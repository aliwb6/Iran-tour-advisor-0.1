export const DEFAULT_MALE_AVATAR = '/avatars/default-male.png';
export const DEFAULT_FEMALE_AVATAR = '/avatars/default-female.png';

export function defaultAvatarFor(gender) {
  return gender === 'female' ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;
}

export function avatarFor(profile) {
  if (profile?.avatar_url) return profile.avatar_url;
  return defaultAvatarFor(profile?.gender);
}
