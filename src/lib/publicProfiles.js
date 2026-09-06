export function applyPublicProfileVisibility(query) {
  return query
    .eq('is_approved', true)
    .eq('is_rejected', false)
    .eq('is_published', true)
    .eq('is_public', true);
}

export function selectPublicProfiles(client, columns = '*') {
  return applyPublicProfileVisibility(client.from('profiles').select(columns));
}
