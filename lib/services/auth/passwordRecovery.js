import { supabase } from '../../config/supabase';

/**
 * Parses Supabase implicit grant tokens from a deep link (hash or query).
 * @param {string} rawUrl
 * @returns {{ access_token: string, refresh_token: string, type: string | null } | null}
 */
export function parseAuthParamsFromUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  let fragment = '';
  const hashIdx = rawUrl.indexOf('#');
  if (hashIdx >= 0) {
    fragment = rawUrl.slice(hashIdx + 1);
  }

  let query = '';
  const beforeHash = hashIdx >= 0 ? rawUrl.slice(0, hashIdx) : rawUrl;
  const qIdx = beforeHash.indexOf('?');
  if (qIdx >= 0) {
    query = beforeHash.slice(qIdx + 1);
  }

  const params = new URLSearchParams(fragment || query || '');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const type = params.get('type');

  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token, type };
}

/**
 * Applies tokens from a redirect URL and establishes a Supabase session.
 * @returns {Promise<{ ok: boolean, isRecovery?: boolean, error?: string }>}
 */
export async function applySessionFromAuthUrl(rawUrl) {
  const parsed = parseAuthParamsFromUrl(rawUrl);
  if (!parsed) {
    return { ok: false };
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: parsed.access_token,
    refresh_token: parsed.refresh_token,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const isRecovery = parsed.type === 'recovery';
  return { ok: true, isRecovery, session: data?.session ?? null };
}
