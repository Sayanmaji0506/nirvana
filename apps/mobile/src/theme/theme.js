/**
 * NIRVANA Design System
 * 
 * Typography: Inter — only 2 weights: '400' (Regular) and '500' (Medium)
 * Spacing: 4px base scale
 * Border Radius: consistent 8/12px
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const FONT = {
  regular: '400',
  medium: '500',
};

export const TYPE = {
  // Headings — medium weight
  h1: { fontSize: 24, fontWeight: FONT.medium, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: FONT.medium, lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: FONT.medium, lineHeight: 24 },
  // Body — regular weight
  body: { fontSize: 15, fontWeight: FONT.regular, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: FONT.regular, lineHeight: 18 },
  // Labels — medium weight
  label: { fontSize: 13, fontWeight: FONT.medium, lineHeight: 18 },
  labelSmall: { fontSize: 11, fontWeight: FONT.medium, lineHeight: 16 },
  // Caption — regular weight
  caption: { fontSize: 11, fontWeight: FONT.regular, lineHeight: 16 },
};

export const COMPONENT = {
  buttonHeight: 48,
  inputHeight: 48,
  navBarHeight: 56,
  iconSize: 20,
  iconSizeLg: 24,
};

// Road/risk status colors — shared between themes
const STATUS = {
  clear: '#22C55E',
  risky: '#F59E0B',
  blocked: '#EF4444',
};

export const LIGHT = {
  mode: 'light',
  // Backgrounds
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  // Brand
  accent: '#2563EB',
  accentLight: 'rgba(37, 99, 235, 0.08)',
  // Status
  ...STATUS,
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.08)',
  // Map
  mapTileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  mapBg: '#E8E8E8',
  // Navigation
  navBackground: '#FFFFFF',
  navBorder: '#E5E7EB',
  navActiveColor: '#2563EB',
  navInactiveColor: '#9CA3AF',
  // Shadows
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowMd: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const DARK = {
  mode: 'dark',
  // Backgrounds
  background: '#111111',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textInverse: '#1A1A1A',
  // Border
  border: '#2C2C2E',
  borderLight: '#3A3A3C',
  // Brand
  accent: '#3B82F6',
  accentLight: 'rgba(59, 130, 246, 0.12)',
  // Status
  ...STATUS,
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.12)',
  // Map
  mapTileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  mapBg: '#1A1A2E',
  // Navigation
  navBackground: '#1C1C1E',
  navBorder: '#2C2C2E',
  navActiveColor: '#3B82F6',
  navInactiveColor: '#6B7280',
  // Shadows
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowMd: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Legacy compat — keep COLORS export for any file not yet migrated
export const COLORS = {
  open: STATUS.clear,
  risky: STATUS.risky,
  blocked: STATUS.blocked,
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  accent: '#0D9488',
  danger: '#DC2626',
  bgDark: DARK.background,
  cardDark: DARK.surface,
  surfaceDark: DARK.surfaceElevated,
  borderDark: DARK.border,
  bgLight: LIGHT.background,
  cardLight: LIGHT.surface,
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textWhite: '#FFFFFF',
  textMuted: '#94A3B8',
  liveSync: '#10B981',
  alternateRoute: '#8B5CF6',
};
