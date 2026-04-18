export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

/**
 * @param {string} password
 * @param {{ minLength?: number }} [opts]
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateNewPassword(password, opts = {}) {
  const minLength = opts.minLength ?? 6;
  if (!password || typeof password !== 'string') {
    return { ok: false, message: 'Please enter a password' };
  }
  if (password.length < minLength) {
    return { ok: false, message: `Password must be at least ${minLength} characters` };
  }
  if (password.length > 128) {
    return { ok: false, message: 'Password is too long' };
  }
  return { ok: true };
}


export function validatePasswordMatch(password, confirm, opts) {
  const p = validateNewPassword(password, opts);
  if (!p.ok) return p;
  if (password !== confirm) {
    return { ok: false, message: 'Passwords do not match' };
  }
  return { ok: true };
}
