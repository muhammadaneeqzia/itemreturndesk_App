import { mapAuthNetworkError } from './networkError';

/**
 * Human-readable copy for Supabase Auth API errors (signup, signin, reset).
 * @param {import('@supabase/supabase-js').AuthError | Error | null | undefined} error
 * @param {{ fallback?: string }} [opts]
 */
export function mapSupabaseAuthError(error, opts = {}) {
  if (!error) return opts.fallback || 'Something went wrong. Please try again.';

  const raw = String(error.message || '');
  const lower = raw.toLowerCase();
  const status = error.status;

  if (status === 429 || lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many signup attempts from this device or network. Wait 2–5 minutes, then try again once.';
  }
  if (lower.includes('only request this after') || lower.includes('security purposes')) {
    return 'Please wait a minute before trying signup again.';
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Confirm your email from the link we sent you, then log in.';
  }
  if (lower.includes('already registered') || lower.includes('already been registered') || lower.includes('user already')) {
    return 'This email is already registered. Try logging in or use password reset.';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }

  return mapAuthNetworkError(error) || opts.fallback || 'Request failed';
}

/** Used to apply longer UI cooldowns after server rate limits. */
export function isLikelyAuthRateLimitError(error) {
  if (!error) return false;
  const lower = String(error.message || '').toLowerCase();
  return (
    error.status === 429 ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('only request this after') ||
    lower.includes('security purposes') ||
    lower.includes('email rate limit')
  );
}
