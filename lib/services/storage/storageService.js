import { supabase } from '../../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Storage Service
 * Handles file uploads to Supabase Storage
 */

// Helper to convert base64 to Uint8Array (React Native compatible)
const base64ToUint8Array = (base64) => {
  // Check if atob is available (web)
  if (typeof atob !== 'undefined') {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  // Manual base64 decoding for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = base64.replace(/=+$/, '');
  let output = '';
  
  for (let i = 0; i < str.length; i += 4) {
    const enc1 = chars.indexOf(str.charAt(i));
    const enc2 = chars.indexOf(str.charAt(i + 1));
    const enc3 = chars.indexOf(str.charAt(i + 2));
    const enc4 = chars.indexOf(str.charAt(i + 3));
    
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }
  
  const bytes = new Uint8Array(output.length);
  for (let i = 0; i < output.length; i++) {
    bytes[i] = output.charCodeAt(i);
  }
  return bytes;
};

export const storageService = {
  /**
   * Upload an image file to Supabase Storage
   * @param {string} fileUri - Local file URI
   * @param {string} bucketName - Storage bucket name (default: 'post-images')
   * @param {string} fileName - File name (optional, will be generated if not provided)
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadImage(fileUri, bucketName = 'post-images', fileName = null) {
    try {
      // Generate unique file name if not provided
      if (!fileName) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = fileUri.split('.').pop() || 'jpg';
        fileName = `image_${timestamp}_${randomStr}.${fileExtension}`;
      }

      // Read file as base64 using FileSystem
      // Use string 'base64' encoding (works in all Expo versions)
      const base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Convert base64 to Uint8Array
      const bytes = base64ToUint8Array(base64String);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from(bucketName).upload(fileName, bytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload image error:', error);
      return { success: false, error: error.message || 'Failed to upload image' };
    }
  },

  /**
   * Upload a video file to Supabase Storage
   * @param {string} fileUri - Local file URI
   * @param {string} bucketName - Storage bucket name (default: 'post-videos')
   * @param {string} fileName - File name (optional, will be generated if not provided)
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadVideo(fileUri, bucketName = 'post-videos', fileName = null) {
    try {
      // Generate unique file name if not provided
      if (!fileName) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = fileUri.split('.').pop() || 'mp4';
        fileName = `video_${timestamp}_${randomStr}.${fileExtension}`;
      }

      // Read file as base64 using FileSystem
      // Use string 'base64' encoding (works in all Expo versions)
      const base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Convert base64 to Uint8Array
      const bytes = base64ToUint8Array(base64String);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from(bucketName).upload(fileName, bytes, {
        contentType: 'video/mp4',
        upsert: false,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload video error:', error);
      return { success: false, error: error.message || 'Failed to upload video' };
    }
  },

  /**
   * Upload multiple images
   * @param {Array<string>} fileUris - Array of local file URIs
   * @returns {Promise<{success: boolean, urls?: Array<string>, error?: string}>}
   */
  async uploadMultipleImages(fileUris) {
    try {
      const uploadPromises = fileUris.map((uri) => this.uploadImage(uri));
      const results = await Promise.all(uploadPromises);

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

  /**
   * Upload multiple videos
   * @param {Array<string>} fileUris - Array of local file URIs
   * @returns {Promise<{success: boolean, urls?: Array<string>, error?: string}>}
   */
  async uploadMultipleVideos(fileUris) {
    try {
      const uploadPromises = fileUris.map((uri) => this.uploadVideo(uri));
      const results = await Promise.all(uploadPromises);

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
