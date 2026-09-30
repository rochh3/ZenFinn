export const theme = {
  colors: {
    background: '#030712', // Very dark blue/grey instead of pure black
    surface: '#111827', // Dark slate surface
    primary: '#3B82F6', // Electric blue accent (tech/professional)
    text: '#F9FAFB', // Off-white for better readability
    textSecondary: '#9CA3AF',
    border: '#1F2937', 
    success: '#10B981', // Emerald green
    danger: '#EF4444', 
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  borderRadius: { m: 4, l: 8, xl: 12 }, // Sharper, cleaner edges (less bubbly)
  typography: {
    fontFamily: 'System', 
    h1: { fontSize: 36, fontWeight: '300', letterSpacing: 1.5 }, // Thin, wide
    h2: { fontSize: 20, fontWeight: '400', letterSpacing: 1 },
    body: { fontSize: 14, fontWeight: '300', letterSpacing: 0.5 },
    caption: { fontSize: 11, fontWeight: '400', letterSpacing: 1, textTransform: 'uppercase' }, // Tech aesthetic
  }
};
