import { supabase } from '../../config/supabase';
import { getPasswordResetRedirectUrl } from '../../config/authLinks';
import { mapAuthNetworkError } from '../../utils/networkError';
import { mapSupabaseAuthError, isLikelyAuthRateLimitError } from '../../utils/authErrors';
import { normalizeEmail } from '../../utils/authValidation';

/**
 * Same-email signup throttle (client-only): avoids double-taps and rapid retries that trigger Supabase rate limits.
 * Server limits still apply — raise limits in Supabase Dashboard → Authentication if needed (e.g. dev/testing).
 */
const lastSignUpAttemptByEmail = new Map();
const SAME_EMAIL_SIGNUP_COOLDOWN_MS = 10000;

/**
 * Authentication Service
 * Handles all authentication operations with Supabase Auth
 */

export const authService = {
 
  async signUp(email, password, name) {
    try {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return { success: false, error: 'Please enter a valid email' };
      }

      const prevAt = lastSignUpAttemptByEmail.get(normalizedEmail) || 0;
      const now = Date.now();
      if (now - prevAt < SAME_EMAIL_SIGNUP_COOLDOWN_MS) {
        const waitSec = Math.ceil((SAME_EMAIL_SIGNUP_COOLDOWN_MS - (now - prevAt)) / 1000);
        return {
          success: false,
          error: `Please wait ${waitSec}s before trying this email again (helps avoid signup limits).`,
          rateLimited: true,
        };
      }
      lastSignUpAttemptByEmail.set(normalizedEmail, now);

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: (name || '').trim() || normalizedEmail.split('@')[0],
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: mapSupabaseAuthError(error),
          rateLimited: isLikelyAuthRateLimitError(error),
        };
      }

      const session = data?.session ?? null;
      const user = data?.user ?? null;
      /** Supabase returns no session until the user confirms email (when confirmations are enabled). */
      const needsEmailConfirmation = Boolean(user && !session);

      return {
        success: true,
        session,
        user,
        needsEmailConfirmation,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: mapAuthNetworkError(error) };
    }
  },

  async signIn(email, password) {
    try {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return { success: false, error: 'Please enter a valid email' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
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
      return { success: false, error: mapAuthNetworkError(error) };
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
      return { success: false, error: mapAuthNetworkError(error) };
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
      return { success: false, error: mapAuthNetworkError(error) };
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
      return { success: false, error: mapAuthNetworkError(error) };
    }
  },

  /**
   * Sends a password reset email (Supabase Auth updates credentials in auth.users).
   * @param {string} email - User email (trimmed by caller)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async requestPasswordReset(email) {
    try {
      const redirectTo = getPasswordResetRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }
      return { success: true };
    } catch (error) {
      console.error('Request password reset error:', error);
      return { success: false, error: mapAuthNetworkError(error) };
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
        return { success: false, error: mapSupabaseAuthError(error) };
      }
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: mapAuthNetworkError(error) };
    }
  },
};

