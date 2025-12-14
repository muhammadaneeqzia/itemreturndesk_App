import { supabase } from '../../config/supabase';

/**
 * Authentication Service
 * Handles all authentication operations with Supabase Auth
 */

export const authService = {
 
  async signUp(email, password, name) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Profile will be created automatically via trigger
      // But we can also fetch it here if needed
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message || 'Failed to sign up' };
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return { success: false, error: 'Failed to fetch user profile' };
        }

        return {
          success: true,
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            role: profile.role,
          },
          session: data.session,
        };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Failed to sign in' };
    }
  },

  /**
   * Sign out current user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message || 'Failed to sign out' };
    }
  },

  /**
   * Get current session
   * @returns {Promise<{success: boolean, session?: object, error?: string}>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, session };
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error: error.message || 'Failed to get session' };
    }
  },

  /**
   * Get current user
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { success: false, error: error?.message || 'No user found' };
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          role: profile.role,
        },
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message || 'Failed to get user' };
    }
  },

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'itemreturndesk://reset-password',
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  },

  /**
   * Update password
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message || 'Failed to update password' };
    }
  },
};

