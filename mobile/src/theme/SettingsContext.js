import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, DEFAULT_THEME, spacing, radius, font } from './themes';
import { makeT } from '../config/i18n';

const KEY = 'zenfin_settings_v1';
const SettingsContext = createContext(null);

/** Tema + idioma. Se recuerdan en el dispositivo y se sincronizan con el perfil al iniciar sesión. */
export const SettingsProvider = ({ children }) => {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME);
  const [language, setLanguageState] = useState('es');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw);
        if (THEMES[s.themeId]) setThemeIdState(s.themeId);
        if (s.language === 'es' || s.language === 'en') setLanguageState(s.language);
      })
      .catch(() => {});
  }, []);

  const persist = (next) => AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});

  const setThemeId = useCallback((id) => {
    if (!THEMES[id]) return;
    setThemeIdState(id);
    setLanguageState((lang) => { persist({ themeId: id, language: lang }); return lang; });
  }, []);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    setThemeIdState((id) => { persist({ themeId: id, language: lang }); return id; });
  }, []);

  const value = useMemo(() => {
    const base = THEMES[themeId] || THEMES[DEFAULT_THEME];
    return {
      theme: { ...base, spacing, radius, font },
      themeId, setThemeId, language, setLanguage,
      t: makeT(language),
    };
  }, [themeId, language, setThemeId, setLanguage]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);

/** const styles = useStyles(makeStyles) — hoja de estilos memoizada por tema. */
export const useStyles = (factory) => {
  const { theme } = useSettings();
  return useMemo(() => factory(theme), [factory, theme]);
};
