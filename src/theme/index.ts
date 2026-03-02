// Shared visual constants for the Elderly Care app.
// Larger font sizes and high-contrast colours improve accessibility for elderly users.

export const COLORS = {
  primary: '#1565C0',      // deep blue — primary actions
  primaryLight: '#1E88E5', // lighter blue — highlights
  accent: '#2E7D32',       // green — success / active status
  background: '#EEF2F7',   // soft blue-grey page background
  card: '#FFFFFF',         // white card surfaces
  text: '#1A1A2E',         // near-black body text
  subtext: '#546E7A',      // muted label / meta text
  border: '#CFD8DC',       // light divider/border
  danger: '#C62828',       // red — destructive / revoked
  warning: '#E65100',      // orange — pending status
  success: '#1B5E20',      // dark green — active/success text
  disabled: '#B0BEC5',     // grey for disabled elements
  overlay: 'rgba(0,0,0,0.4)',
};

export const FONT_SIZE = {
  xs: 13,
  sm: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};
