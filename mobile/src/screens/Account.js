import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert } from '../utils/alert';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LANGUAGES } from '../config/i18n';
import { Screen, Card, Button, Field, Label, Segmented, Avatar, SectionHeader } from '../components/ui';
import { ThemePicker } from '../components/ThemePicker';

export const AccountScreen = () => {
  const { t, theme, themeId, setThemeId, language, setLanguage } = useSettings();
  const styles = useStyles(makeStyles);
  const { profile, updateProfile, signOut } = useAuth();
  const { findLegacy, importLegacy } = useData();

  const [name, setName] = useState(profile?.name || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');
  const [busy, setBusy] = useState(false);
  const [legacy, setLegacy] = useState([]);

  useEffect(() => { findLegacy().then(setLegacy).catch(() => {}); }, [findLegacy]);

  // Tema e idioma se guardan en cuanto se eligen (y viajan contigo a otros dispositivos)
  const pickTheme = (id) => { setThemeId(id); updateProfile({ theme: id }).catch(() => {}); };
  const pickLang = (id) => { setLanguage(id); updateProfile({ language: id }).catch(() => {}); };

  const dirty = name.trim() !== (profile?.name || '') || whatsapp.trim() !== (profile?.whatsapp || '');

  const save = async () => {
    if (!name.trim()) return Alert.alert(t('error'), t('required'));
    setBusy(true);
    try {
      await updateProfile({ name: name.trim(), whatsapp: whatsapp.replace(/[^\d]/g, '') });
      Alert.alert(t('saved'));
    } catch (e) {
      Alert.alert(t('error'), /duplicate|unique/i.test(e.message) ? 'WhatsApp ya vinculado a otra cuenta' : e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmSignOut = () =>
    Alert.alert(t('signOut'), t('signOutMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: signOut },
    ]);

  const doImport = () =>
    Alert.alert(t('importLegacy'), t('importLegacyMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('import'),
        onPress: async () => {
          setBusy(true);
          try {
            let n = 0;
            for (const prefix of legacy) n += await importLegacy(prefix);
            setLegacy([]);
            Alert.alert(t('imported', { n }));
          } catch (e) {
            Alert.alert(t('error'), e.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <View style={styles.head}>
        <Avatar name={profile?.name} size={72} />
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <Field label={t('yourName')} value={name} onChangeText={setName} autoCapitalize="words" maxLength={30} />
      <Field label={t('whatsapp')} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="34600123456" maxLength={16} style={{ marginBottom: theme.spacing.s }} />
      <Text style={styles.hint}>{t('whatsappHint')}</Text>
      {dirty && <Button title={t('save')} onPress={save} loading={busy} style={{ marginBottom: theme.spacing.l }} />}

      <SectionHeader title={t('appearance')} />
      <Card>
        <Label>{t('theme')}</Label>
        <ThemePicker value={themeId} onChange={pickTheme} />
        <Label style={{ marginTop: theme.spacing.xl }}>{t('language')}</Label>
        <Segmented options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))} value={language} onChange={pickLang} />
      </Card>

      {legacy.length > 0 && (
        <>
          <SectionHeader title={t('importLegacy')} />
          <Button title={t('import')} icon="download-outline" variant="secondary" onPress={doImport} loading={busy} />
        </>
      )}

      <Button title={t('signOut')} icon="log-out-outline" variant="danger" onPress={confirmSignOut} style={{ marginTop: theme.spacing.xxl }} />
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  head: { alignItems: 'center', marginBottom: theme.spacing.xl },
  email: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: theme.spacing.m },
  hint: { ...theme.font.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.l },
});
