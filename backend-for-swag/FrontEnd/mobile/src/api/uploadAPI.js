import apiClient from './client';

/**
 * Returns true if the URI is a local device path (file:// or content://).
 * These only work on the device that created them and must be uploaded
 * to Supabase Storage before being saved to the database.
 */
export const isLocalUri = (uri) =>
  typeof uri === 'string' && (uri.startsWith('file://') || uri.startsWith('content://'));

/**
 * Uploads a local file to Supabase Storage via the backend /api/upload/media
 * endpoint and returns the public URL.
 *
 * @param {string} localUri  - The file:// or content:// URI from ImagePicker
 * @param {'image'|'video'} mediaType - 'image' (default) or 'video'
 * @returns {Promise<string|null>} Public Supabase URL, or null if upload failed
 */
export const uploadMedia = async (localUri, mediaType = 'image') => {
  try {
    const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    const ext      = mediaType === 'video' ? 'mp4'       : 'jpg';

    const formData = new FormData();
    formData.append('file', { uri: localUri, type: mimeType, name: `upload.${ext}` });

    const res = await apiClient.post('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes — large videos need time
    });

    return res.data.url;
  } catch (err) {
    console.warn('[uploadMedia] Upload failed:', err?.response?.data || err.message);
    return null;
  }
};
