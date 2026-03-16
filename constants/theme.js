// App Theme Constants
export const COLORS = {
  primary: '#1700f2',
  primaryLight: '#4a3af5',
  primaryDark: '#1200c0',
  secondary: '#6c757d',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#007AFF',
  
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  
  // Backgrounds
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  inputBackground: '#f9f9f9',
  
  // Text
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  textWhite: '#ffffff',
  
  // Borders
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
};

export const FONTS = {
  regular: {
    fontSize: 14,
    fontWeight: '400',
  },
  medium: {
    fontSize: 14,
    fontWeight: '500',
  },
  semiBold: {
    fontSize: 14,
    fontWeight: '600',
  },
  bold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  small: {
    fontSize: 10,
    fontWeight: '400',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
};