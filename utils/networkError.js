/**
 * RN fetch often throws TypeError with message "Network request failed" (no response body).
 */
export function isNetworkFailure(error) {
  const msg = String(error?.message || '');
  return (
    msg === 'Network request failed' ||
    msg.includes('Failed to fetch') ||
    (error?.name === 'TypeError' && /network|fetch/i.test(msg))
  );
}

export function mapAuthNetworkError(error) {
  if (isNetworkFailure(error)) {
    return "Can't reach the server. Check Wi‑Fi or mobile data, VPN, and that your Supabase project is active.";
  }
  return error?.message || 'Request failed';
}
