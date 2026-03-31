import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Brand Identity
  primary: '#8A1C27',         // Our signature Brand Red
  navy: '#2D3E5E',            // Brand Navy (used for headers and titles)

  // Backgrounds
  background: '#F1F4F9',      // Premium Off-White/Light-Blue tint
  surface: '#FFFFFF',         // Pure White for cards

  // Accents & UI Elements
  accentRed: '#FDF2F3',       // Soft red tint for icon backgrounds/badges
  border: '#E2E8F0',          // Subtle border color
  inputBg: '#F1F4F9',         // Input field background

  // Text Colors
  textPrimary: '#2D3E5E',     // Navy for high-priority text
  textSecondary: '#8391A1',   // Muted gray for subtitles/labels
  textLight: '#FFFFFF',       // White text

  // Status
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',

  // Legacy/Gradient Fallbacks
  backgroundGradient: ['#5B7896', '#2D3E5E'],
};

export const FONTS = {
  // Using FontWeight logic as most systems default to System font
  // If you add custom fonts later, replace 'System' with your font family name
  black: '800',
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
};

export const SIZES = {
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 15,
  small: 13,
  tiny: 11,

  // Layout Constants
  padding: 20,
  margin: 16,
  radius: 25,           // Our global premium card curve
  pillRadius: 50,       // For buttons and search bars

  // Device Dimensions
  width,
  height,
};

export const SHADOWS = {
  // The "Floating Card" look we've been using
  premium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  // Subtler shadow for smaller elements
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };