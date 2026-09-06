-- The admin UI and moderation trigger both recognize either the admin role or
-- the canonical is_admin flag. Keep the profiles UPDATE policy consistent so
-- an authorized is_admin account does not receive a silent zero-row update.
ALTER POLICY "Admins can update profiles"
ON public.profiles
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles AS admin_profile
    WHERE admin_profile.id = (SELECT auth.uid())
      AND (admin_profile.role = 'admin' OR admin_profile.is_admin IS TRUE)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles AS admin_profile
    WHERE admin_profile.id = (SELECT auth.uid())
      AND (admin_profile.role = 'admin' OR admin_profile.is_admin IS TRUE)
  )
);
