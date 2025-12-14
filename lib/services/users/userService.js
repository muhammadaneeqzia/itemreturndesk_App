import { supabase } from '../../config/supabase';

/**
 * User Service
 * Handles all user profile operations
 */

export const userService = {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message || 'Failed to get profile' };
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updates - Profile updates (name, phone, avatar_url)
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  },

  /**
   * Upload avatar image
   * @param {string} userId - User ID
   * @param {string} imageUri - Image URI (local file path)
   * @param {string} imageType - Image MIME type
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadAvatar(userId, imageUri, imageType = 'image/jpeg') {
    try {
      // Read file as blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = imageType.split('/')[1];
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${userId}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, blob, {
          contentType: imageType,
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const updateResult = await this.updateProfile(userId, {
        avatar_url: publicUrl,
      });

      if (!updateResult.success) {
        return updateResult;
      }

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return { success: false, error: error.message || 'Failed to upload avatar' };
    }
  },

  /**
   * Delete avatar
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteAvatar(userId) {
    try {
      // Get current profile to find avatar path
      const profileResult = await this.getProfile(userId);
      if (!profileResult.success || !profileResult.data?.avatar_url) {
        return { success: false, error: 'No avatar found' };
      }

      // Extract file path from URL
      const avatarUrl = profileResult.data.avatar_url;
      const urlParts = avatarUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // avatars/userId/filename

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('user-avatars')
        .remove([filePath]);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Update profile to remove avatar_url
      return await this.updateProfile(userId, { avatar_url: null });
    } catch (error) {
      console.error('Delete avatar error:', error);
      return { success: false, error: error.message || 'Failed to delete avatar' };
    }
  },
};

