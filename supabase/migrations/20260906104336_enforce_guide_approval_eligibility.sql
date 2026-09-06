-- Canonical guide moderation state lives on public.profiles. Rejection details
-- were referenced by the application but never applied to the live schema.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_rejected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_rejection_reason text,
  ADD COLUMN IF NOT EXISTS approval_reviewed_at timestamptz;

UPDATE public.profiles SET is_rejected = false WHERE is_rejected IS NULL;
ALTER TABLE public.profiles
  ALTER COLUMN is_rejected SET DEFAULT false,
  ALTER COLUMN is_rejected SET NOT NULL;

COMMENT ON COLUMN public.profiles.approval_rejection_reason IS
  'Required reason recorded by an administrator when a guide or agency profile is rejected.';

CREATE OR REPLACE FUNCTION public.enforce_guide_profile_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  has_required_fields boolean;
  reviewer_is_admin boolean := false;
  approval_started boolean := false;
  rejection_started boolean := false;
  protected_state_changed boolean := false;
BEGIN
  IF NEW.role NOT IN ('guide', 'agency') OR TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  has_required_fields := (
    NULLIF(btrim(NEW.full_name), '') IS NOT NULL
    AND NULLIF(btrim(NEW.email), '') IS NOT NULL
    AND NULLIF(btrim(NEW.phone), '') IS NOT NULL
    AND NULLIF(btrim(NEW.city), '') IS NOT NULL
    AND NULLIF(btrim(NEW.languages), '') IS NOT NULL
    AND (
      COALESCE(cardinality(NEW.tour_types), 0) > 0
      OR COALESCE(cardinality(NEW.specialties), 0) > 0
      OR NULLIF(btrim(NEW.specialty), '') IS NOT NULL
    )
    AND NULLIF(btrim(NEW.bio), '') IS NOT NULL
    AND NULLIF(btrim(NEW.license_url), '') IS NOT NULL
  );

  approval_started := NEW.is_approved IS TRUE AND COALESCE(OLD.is_approved, false) IS FALSE;
  rejection_started := NEW.is_rejected IS TRUE AND COALESCE(OLD.is_rejected, false) IS FALSE;
  protected_state_changed := (
    NEW.is_approved IS DISTINCT FROM OLD.is_approved
    OR NEW.is_rejected IS DISTINCT FROM OLD.is_rejected
    OR NEW.is_published IS DISTINCT FROM OLD.is_published
    OR NEW.approval_rejection_reason IS DISTINCT FROM OLD.approval_rejection_reason
    OR NEW.approval_reviewed_at IS DISTINCT FROM OLD.approval_reviewed_at
    OR (
      NEW.license_status IS DISTINCT FROM OLD.license_status
      AND NEW.license_status IN ('verified', 'rejected')
    )
  );

  IF protected_state_changed THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.profiles AS reviewer
      WHERE reviewer.id = (SELECT auth.uid())
        AND (reviewer.role = 'admin' OR reviewer.is_admin IS TRUE)
    ) INTO reviewer_is_admin;

    IF NOT reviewer_is_admin THEN
      RAISE EXCEPTION 'Only an administrator may moderate a guide profile'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  IF approval_started AND rejection_started THEN
    RAISE EXCEPTION 'A guide profile cannot be approved and rejected together'
      USING ERRCODE = 'check_violation';
  END IF;

  IF approval_started THEN
    IF NOT has_required_fields THEN
      RAISE EXCEPTION 'Guide profile is missing required approval fields'
        USING ERRCODE = 'check_violation';
    END IF;

    NEW.is_rejected := false;
    NEW.license_status := 'verified';
    NEW.is_published := true;
    NEW.approval_rejection_reason := NULL;
    NEW.approval_reviewed_at := COALESCE(NEW.approval_reviewed_at, now());
  ELSIF NEW.is_rejected IS TRUE THEN
    IF NULLIF(btrim(NEW.approval_rejection_reason), '') IS NULL THEN
      RAISE EXCEPTION 'A rejection reason is required'
        USING ERRCODE = 'check_violation';
    END IF;

    NEW.approval_rejection_reason := btrim(NEW.approval_rejection_reason);
    NEW.is_approved := false;
    NEW.license_status := 'rejected';
    NEW.is_published := false;
    NEW.approval_reviewed_at := COALESCE(NEW.approval_reviewed_at, now());
  END IF;

  RETURN NEW;
END;
$$;

-- Synchronize the legacy flag without changing which existing rows are
-- approved/rejected. Public discovery remains controlled by is_approved,
-- is_rejected, and the guide's own is_public preference.
UPDATE public.profiles
SET is_published = (is_approved IS TRUE AND is_rejected IS FALSE)
WHERE role IN ('guide', 'agency')
  AND is_published IS DISTINCT FROM (is_approved IS TRUE AND is_rejected IS FALSE);

DROP TRIGGER IF EXISTS trg_enforce_guide_profile_moderation ON public.profiles;
CREATE TRIGGER trg_enforce_guide_profile_moderation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guide_profile_moderation();

NOTIFY pgrst, 'reload schema';
