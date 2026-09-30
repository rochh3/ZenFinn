import React, { createContext, useContext, useState, useMemo } from 'react';

const themes = {
  dark: {
    colors: {
      background: '#030712',
      surface: '#111827',
      primary: '#3B82F6',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#1F2937',
      success: '#10B981',
      danger: '#EF4444',
    },
    spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
    borderRadius: { m: 4, l: 8, xl: 12 },
    typography: {
      fontFamily: 'System',
      h1: { fontSize: 36, fontWeight: '300', letterSpacing: 1.5 },
      h2: { fontSize: 20, fontWeight: '400', letterSpacing: 1 },
      body: { fontSize: 14, fontWeight: '300', letterSpacing: 0.5 },
      caption: { fontSize: 11, fontWeight: '400', letterSpacing: 1, textTransform: 'uppercase' },
    }
  },
  light: {
    colors: {
      background: '#F3F4F6',
      surface: '#FFFFFF',
      primary: '#2563EB',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#059669',
      danger: '#DC2626',
    },
    spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
    borderRadius: { m: 4, l: 8, xl: 12 },
    typography: {
      fontFamily: 'System',
      h1: { fontSize: 36, fontWeight: '300', letterSpacing: 1.5 },
      h2: { fontSize: 20, fontWeight: '400', letterSpacing: 1 },
      body: { fontSize: 14, fontWeight: '300', letterSpacing: 0.5 },
      caption: { fontSize: 11, fontWeight: '400', letterSpacing: 1, textTransform: 'uppercase' },
    }
  },
  pink: {
    colors: {
      background: '#FDF2F8',
      surface: '#FCE7F3',
      primary: '#DB2777',
      text: '#831843',
      textSecondary: '#BE185D',
      border: '#FBCFE8',
      success: '#059669',
      danger: '#E11D48',
    },
    spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
    borderRadius: { m: 4, l: 8, xl: 12 },
    typography: {
      fontFamily: 'System',
      h1: { fontSize: 36, fontWeight: '300', letterSpacing: 1.5 },
      h2: { fontSize: 20, fontWeight: '400', letterSpacing: 1 },
      body: { fontSize: 14, fontWeight: '300', letterSpacing: 0.5 },
      caption: { fontSize: 11, fontWeight: '400', letterSpacing: 1, textTransform: 'uppercase' },
    }
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');
  const theme = useMemo(() => themes[themeMode] || themes.dark, [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
