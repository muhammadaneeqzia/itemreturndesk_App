import * as Linking from 'expo-linking';

/**
 * Deep link path consumed by the app after Supabase redirects from the reset email.
 * Add the full redirect URL from getPasswordResetRedirectUrl() to:
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 */
export const PASSWORD_RESET_PATH = 'reset-password';

/**
 * URL Supabase redirects to after the user taps the link in the password reset email.
 * In Expo Go dev this is often an exp:// URL; production uses your app scheme.
 */
export function getPasswordResetRedirectUrl() {
  return Linking.createURL(PASSWORD_RESET_PATH);
}
