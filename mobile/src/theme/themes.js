// Tokens compartidos por todos los temas.
export const spacing = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
export const radius = { s: 10, m: 14, l: 20, xl: 28, pill: 999 };
export const font = {
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '500' },
  small: { fontSize: 13, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  amountXL: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
};

// Cada tema solo define sus colores.
const make = (id, name, isDark, c) => ({ id, name, isDark, colors: { success: '#16A34A', danger: '#E5484D', warning: '#F59E0B', ...c } });

export const THEMES = {
  dark: make('dark', 'Medianoche', true, {
    background: '#0B1020', surface: '#151B2E', surfaceAlt: '#1E2640', border: '#27304D',
    primary: '#7C9CFF', onPrimary: '#0B1020', text: '#F1F4FF', textSecondary: '#9AA4C4',
    success: '#34D399', danger: '#FF6B72',
    chart: ['#7C9CFF', '#34D399', '#F59E0B', '#F472B6', '#22D3EE', '#A78BFA', '#FB7185', '#A3E635'],
  }),
  light: make('light', 'Claro', false, {
    background: '#F4F6FB', surface: '#FFFFFF', surfaceAlt: '#EBEFF9', border: '#E1E6F2',
    primary: '#4F6BED', onPrimary: '#FFFFFF', text: '#12182B', textSecondary: '#667089',
    chart: ['#4F6BED', '#16A34A', '#F59E0B', '#EC4899', '#0891B2', '#7C3AED', '#E5484D', '#65A30D'],
  }),
  rose: make('rose', 'Rosa', false, {
    background: '#FFF3F7', surface: '#FFFFFF', surfaceAlt: '#FFE3EC', border: '#F8CFDC',
    primary: '#E8457C', onPrimary: '#FFFFFF', text: '#4A1530', textSecondary: '#9A5B74',
    chart: ['#E8457C', '#F59E0B', '#8B5CF6', '#14B8A6', '#F97316', '#EC4899', '#3B82F6', '#84CC16'],
  }),
  ocean: make('ocean', 'Océano', true, {
    background: '#071A22', surface: '#0E2A36', surfaceAlt: '#153744', border: '#1E4756',
    primary: '#2DD4BF', onPrimary: '#04201C', text: '#E6FAF7', textSecondary: '#85B3B8',
    success: '#4ADE80', danger: '#FB7185',
    chart: ['#2DD4BF', '#38BDF8', '#FBBF24', '#F472B6', '#A78BFA', '#4ADE80', '#FB923C', '#F87171'],
  }),
  violet: make('violet', 'Violeta', true, {
    background: '#130C26', surface: '#1D1438', surfaceAlt: '#291C4D', border: '#37276B',
    primary: '#B197FC', onPrimary: '#160B30', text: '#F4EFFF', textSecondary: '#A99BD1',
    success: '#4ADE80', danger: '#FB7185',
    chart: ['#B197FC', '#F472B6', '#38BDF8', '#FBBF24', '#34D399', '#FB923C', '#818CF8', '#F87171'],
  }),
  forest: make('forest', 'Bosque', false, {
    background: '#F1F7F2', surface: '#FFFFFF', surfaceAlt: '#E1EFE4', border: '#D1E3D6',
    primary: '#2E9E5B', onPrimary: '#FFFFFF', text: '#12301F', textSecondary: '#5E7D69',
    chart: ['#2E9E5B', '#F59E0B', '#3B82F6', '#EC4899', '#0D9488', '#8B5CF6', '#EF4444', '#84CC16'],
  }),
  sunset: make('sunset', 'Atardecer', false, {
    background: '#FFF7ED', surface: '#FFFFFF', surfaceAlt: '#FFEBD6', border: '#F8DDBD',
    primary: '#F26B1D', onPrimary: '#FFFFFF', text: '#3B1D08', textSecondary: '#94673F',
    chart: ['#F26B1D', '#2563EB', '#16A34A', '#DB2777', '#7C3AED', '#0891B2', '#CA8A04', '#DC2626'],
  }),
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME = 'dark';
