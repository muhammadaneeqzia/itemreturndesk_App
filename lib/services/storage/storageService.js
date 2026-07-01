import { supabase } from '../../config/supabase';

function guessContentType(fileUri, fallback) {
  const ext = (fileUri.split('.').pop() || '').toLowerCase().split('?')[0];
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  return map[ext] || fallback;
}

async function uriToBlob(fileUri) {
  const response = await fetch(fileUri);
  if (!response.ok) {
    throw new Error('Failed to read file from device');
  }
  return response.blob();
}

export const storageService = {
  async uploadImage(fileUri, bucketName = 'post-images', fileName = null) {
    try {
      if (!fileName) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = fileUri.split('.').pop()?.split('?')[0] || 'jpg';
        fileName = `image_${timestamp}_${randomStr}.${fileExtension}`;
      }

      const blob = await uriToBlob(fileUri);
      const contentType = blob.type || guessContentType(fileUri, 'image/jpeg');

      const { data, error } = await supabase.storage.from(bucketName).upload(fileName, blob, {
        contentType,
        upsert: false,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload image error:', error);
      return { success: false, error: error.message || 'Failed to upload image' };
    }
  },

  async uploadVideo(fileUri, bucketName = 'post-videos', fileName = null) {
    try {
      if (!fileName) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = fileUri.split('.').pop()?.split('?')[0] || 'mp4';
        fileName = `video_${timestamp}_${randomStr}.${fileExtension}`;
      }

      const blob = await uriToBlob(fileUri);
      const contentType = blob.type || guessContentType(fileUri, 'video/mp4');

      const { data, error } = await supabase.storage.from(bucketName).upload(fileName, blob, {
        contentType,
        upsert: false,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload video error:', error);
      return { success: false, error: error.message || 'Failed to upload video' };
    }
  },

  async uploadMultipleImages(fileUris) {
    try {
      const results = await Promise.all(fileUris.map((uri) => this.uploadImage(uri)));
      const urls = [];
      for (const result of results) {
        if (result.success && result.url) {
          urls.push(result.url);
        } else {
          return { success: false, error: result.error || 'Failed to upload one or more images' };
        }
      }
      return { success: true, urls };
    } catch (error) {
      console.error('Upload multiple images error:', error);
      return { success: false, error: error.message || 'Failed to upload images' };
    }
  },

  async uploadMultipleVideos(fileUris) {
    try {
      const results = await Promise.all(fileUris.map((uri) => this.uploadVideo(uri)));
      const urls = [];
      for (const result of results) {
        if (result.success && result.url) {
          urls.push(result.url);
        } else {
          return { success: false, error: result.error || 'Failed to upload one or more videos' };
        }
      }
      return { success: true, urls };
    } catch (error) {
      console.error('Upload multiple videos error:', error);
      return { success: false, error: error.message || 'Failed to upload videos' };
    }
  },
};
