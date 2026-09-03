export function checkProfileCompletion(profile) {
  if (!profile || (profile.role !== 'guide' && profile.role !== 'agency')) {
    return { completed: false, items: [], percentage: 0 };
  }

  const items = [];
  let passed = 0;

  const check = (label, ok) => {
    items.push({ label, ok });
    if (ok) passed++;
  };

  const role = profile.role;

  // full_name
  check('full_name', !!profile.full_name?.trim());

  // phone
  check('phone', !!profile.phone?.trim());

  // city
  check('city', !!profile.city?.trim());

  // bio (≥ 50 chars)
  check('bio', (profile.bio?.length || 0) >= 50);

  // avatar_url
  check('avatar_url', !!profile.avatar_url?.trim());

  // languages (at least one)
  const langs = profile.languages
    ? (Array.isArray(profile.languages) ? profile.languages : profile.languages.split(',').map(s => s.trim()).filter(Boolean))
    : [];
  check('languages', langs.length >= 1);

  // specialty / tour_types / specialties
  const hasSpecialty = !!profile.specialty?.trim()
    || (Array.isArray(profile.specialties) && profile.specialties.length > 0)
    || (Array.isArray(profile.tour_types) && profile.tour_types.length > 0);
  check(role === 'agency' ? 'tour_types' : 'specialty', hasSpecialty);

  // Uploading the license is the user's responsibility. Verification is a
  // separate admin-review state and must not keep the user's form incomplete.
  check('license_url', !!profile.license_url?.trim());

  const total = items.length;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const completed = passed === total;

  return { completed, items, percentage, passed, total };
}
