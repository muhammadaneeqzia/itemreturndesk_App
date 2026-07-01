/** Support inbox — override via EXPO_PUBLIC_SUPPORT_EMAIL in .env */
export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@itemreturndesk.app';
