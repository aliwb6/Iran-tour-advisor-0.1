import { supabase } from '@/supabaseClient';

/**
 * Supabase Image Transformation helper.
 *
 * IMPORTANT: This only does anything when the `VITE_SUPABASE_IMAGE_TRANSFORMS`
 * env flag is set to "true" AND Image Transformation is enabled on the
 * `tour-images` bucket in the Supabase dashboard. When the flag is off (the
 * default), this returns the original public URL unchanged — so flipping it off
 * is a guaranteed no-op with zero behavior change.
 *
 * To switch it on:
 *   1. Supabase dashboard → Storage → tour-images → enable "Image Transformation".
 *   2. Add `VITE_SUPABASE_IMAGE_TRANSFORMS=true` to your env (and to the
 *      production build env).
 *   3. Rebuild/deploy.
 *
 * @param {string} url   Original public URL (e.g. from getPublicUrl).
 * @param {object} opts  { width, height, quality, resize?: 'cover'|'contain'|'fill' }
 * @returns {string}     A right-sized URL, or the original when disabled/unavailable.
 */
const ENABLED = import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS === 'true';

export function transformImage(url, opts = {}) {
  if (!ENABLED || !url) return url;

  try {
    // Only Supabase storage URLs are transformable. Anything else (Unsplash,
    // base44, data:) passes through untouched.
    const parsed = new URL(url);
    const isSupabaseStorage =
      parsed.hostname.includes('supabase') &&
      parsed.pathname.includes('/storage/v1/object/public/');
    if (!isSupabaseStorage) return url;

    // Path WITHIN the bucket (getPublicUrl expects it without the bucket name).
    const afterPublic = url.split('/public/')[1]?.split('?')[0] || '';
    const bucketPrefix = 'tour-images/';
    const objectPath = afterPublic.startsWith(bucketPrefix)
      ? afterPublic.slice(bucketPrefix.length)
      : afterPublic;

    return supabase.storage
      .from('tour-images')
      .getPublicUrl(objectPath, {
        transform: {
          width: opts.width,
          height: opts.height,
          quality: opts.quality ?? 70,
          resize: opts.resize ?? 'cover',
        },
      }).data.publicUrl;
  } catch {
    return url;
  }
}

// Named presets keep call sites readable and consistent.
export const imgPresets = {
  // Tour detail hero banner (displayed up to ~ full width, ~1200px).
  hero: { width: 1200, quality: 75 },
  // Card thumbnails (tour cards, gallery grids).
  card: { width: 640, quality: 70 },
  // Avatars / small circular images.
  avatar: { width: 200, quality: 75 },
  // Lightbox / full view.
  full: { width: 1600, quality: 80 },
};
