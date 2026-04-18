// Light Theme — refined blues with clearer hierarchy
export const lightTheme = {
  // Primary Colors
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  /** LinearGradient stops for hero surfaces */
  heroGradient: ['#2563EB', '#0891B2'],
  
  // Secondary Colors
  secondary: '#03A9F4',      // Cyan Blue
  secondaryDark: '#0288D1',  // Darker Cyan
  secondaryLight: '#4FC3F7', // Lighter Cyan
  
  // Background Colors
  background: '#F0F4FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  surfaceMuted: '#E8EEF7',
  
  // Text Colors
  text: '#1A1A1A',           // Almost Black
  textSecondary: '#424242',  // Dark Gray
  textTertiary: '#757575',   // Medium Gray
  textInverse: '#FFFFFF',    // White
  
  // Accent Colors
  accent: '#00BCD4',         // Cyan
  accentLight: '#80DEEA',    // Light Cyan
  
  // Status Colors
  success: '#4CAF50',        // Green
  warning: '#FF9800',        // Orange
  error: '#F44336',          // Red
  info: '#2196F3',           // Blue
  
  // Border & Divider
  border: '#E2E8F0',
  divider: '#CBD5E1',

  // Shadow
  shadow: 'rgba(37, 99, 235, 0.12)',
};

// Dark Theme — deep surfaces, readable accents
export const darkTheme = {
  // Primary Colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#93C5FD',
  heroGradient: ['#1E40AF', '#0E7490'],
  
  // Secondary Colors
  secondary: '#29B6F6',      // Cyan Blue
  secondaryDark: '#0288D1',  // Darker Cyan
  secondaryLight: '#4FC3F7', // Lighter Cyan
  
  // Background Colors
  background: '#0C1117',
  surface: '#161B22',
  card: '#1C222B',
  surfaceMuted: '#252D38',
  
  // Text Colors
  text: '#FFFFFF',           // White
  textSecondary: '#B0B0B0',  // Light Gray
  textTertiary: '#808080',   // Medium Gray
  textInverse: '#1A1A1A',    // Almost Black
  
  // Accent Colors
  accent: '#00BCD4',         // Cyan
  accentLight: '#4DD0E1',    // Light Cyan
  
  // Status Colors
  success: '#66BB6A',        // Light Green
  warning: '#FFA726',        // Light Orange
  error: '#EF5350',          // Light Red
  info: '#42A5F5',           // Blue
  
  // Border & Divider
  border: '#2D3748',
  divider: '#3D4A5C',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.45)',
};

// Export default theme (can be used for quick access)
export default {
  light: lightTheme,
  dark: darkTheme,
};

