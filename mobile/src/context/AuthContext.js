import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useSettings } from '../theme/SettingsContext';

const AuthContext = createContext(null);

const mapProfile = (row, fallbackEmail) => ({
  id: row.id,
  name: row.name || '',
  email: row.email || fallbackEmail || '',
  whatsapp: row.whatsapp_number || '',
  theme: row.theme,
  language: row.language,
  onboarded: !!row.onboarded,
});

export const AuthProvider = ({ children }) => {
  const { setThemeId, setLanguage } = useSettings();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [booting, setBooting] = useState(isSupabaseConfigured); // true hasta conocer la sesión inicial
  const [demo, setDemo] = useState(false);
  const userId = session?.user?.id ?? null;

  // Sesión: carga inicial + cambios (login, logout, refresh de token)
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setBooting(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Perfil: se carga cuando cambia el usuario (fuera del callback de auth para evitar bloqueos)
  useEffect(() => {
    if (!supabase) return undefined;
    if (!userId) {
      setProfile(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      let row = null;
      // El trigger crea el perfil al registrarse; reintentamos por si tarda unos ms.
      for (let i = 0; i < 4 && !row && !cancelled; i++) {
        const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
        row = data;
        if (!row) await new Promise((r) => setTimeout(r, 400));
      }
      if (cancelled) return;
      if (!row) {
        const { data } = await supabase
          .from('users')
          .upsert({ id: userId, email: session.user.email, name: session.user.user_metadata?.name || '' })
          .select()
          .single();
        row = data;
      }
      if (cancelled) return;
      if (row) {
        const p = mapProfile(row, session.user.email);
        setProfile(p);
        if (p.theme) setThemeId(p.theme);
        if (p.language) setLanguage(p.language);
      }
      setBooting(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password, options: { data: { name: name.trim() } },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (demo) { setDemo(false); setProfile(null); return; }
    await supabase.auth.signOut();
  }, [demo]);

  // Modo demo: datos de ejemplo en memoria, sin cuenta ni Supabase (solo para probar).
  const enterDemo = useCallback(() => {
    setProfile({ id: 'demo', name: 'Demo', email: 'demo@zenfin.app', whatsapp: '', theme: null, language: null, onboarded: true });
    setDemo(true);
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (demo) { setProfile((p) => ({ ...p, ...patch })); return; }
    if (!userId) return;
    const db = {};
    if ('name' in patch) db.name = patch.name;
    if ('whatsapp' in patch) db.whatsapp_number = patch.whatsapp || null;
    if ('theme' in patch) db.theme = patch.theme;
    if ('language' in patch) db.language = patch.language;
    if ('onboarded' in patch) db.onboarded = patch.onboarded;
    setProfile((p) => (p ? { ...p, ...patch } : p));
    const { error } = await supabase.from('users').update(db).eq('id', userId);
    if (error) throw error;
  }, [userId, demo]);

  const value = useMemo(
    () => ({
      session: demo ? { demo: true } : session, user: demo ? { id: 'demo' } : session?.user ?? null,
      profile, booting: demo ? false : booting, demo, enterDemo, signIn, signUp, signOut, resetPassword, updateProfile,
    }),
    [session, profile, booting, demo, enterDemo, signIn, signUp, signOut, resetPassword, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
