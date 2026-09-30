import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { t } from '../config/i18n';

export const AccountScreen = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = getStyles(theme);
  const { user, setUser, language, setLanguage } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUri || null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío'); return; }
    setUser(prev => ({ ...prev, name: name.trim(), avatarUri }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangeAvatar = () => {
    // Basic placeholder for now, usually requires expo-image-picker
    Alert.alert('Foto de perfil', 'Esta función utilizará la cámara o galería (requiere expo-image-picker).');
  };

  const themes = [
    { label: t('dark', language), value: 'dark' },
    { label: t('light', language), value: 'light' },
    { label: t('pink', language), value: 'pink' }
  ];

  const languages = [
    { label: t('spanish', language), value: 'es' },
    { label: t('english', language), value: 'en' }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>{t('controlCenter', language)}</Text>

      {/* ── Profile ── */}
      <View style={styles.profileBlock}>
        <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarPlaceholder}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder={t('username', language)}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      {/* ── Settings ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('customization', language)}</Text>

        <Text style={styles.inputLabel}>{t('appTheme', language)}</Text>
        <View style={styles.optionsRow}>
          {themes.map(th => (
            <TouchableOpacity 
              key={th.value} 
              style={[styles.optionCard, themeMode === th.value && styles.optionCardActive]}
              onPress={() => setThemeMode && setThemeMode(th.value)}
            >
              <Text style={[styles.optionText, themeMode === th.value && styles.optionTextActive]}>{th.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { marginTop: 24 }]}>{t('language', language)}</Text>
        <View style={styles.optionsRow}>
          {languages.map(l => (
            <TouchableOpacity 
              key={l.value} 
              style={[styles.optionCard, language === l.value && styles.optionCardActive]}
              onPress={() => setLanguage && setLanguage(l.value)}
            >
              <Text style={[styles.optionText, language === l.value && styles.optionTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Save ── */}
      <TouchableOpacity style={[styles.saveButton, saved && { backgroundColor: theme.colors.success }]} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{saved ? t('saved', language) : t('saveChanges', language)}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l },
  header: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl, textAlign: 'center', letterSpacing: 4 },
  profileBlock: { flexDirection: 'row', alignItems: 'center', paddingBottom: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: theme.spacing.xl },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.m, overflow: 'hidden' },
  avatarText: { ...theme.typography.h2, color: theme.colors.primary },
  avatarImage: { width: '100%', height: '100%' },
  nameInput: { ...theme.typography.h1, fontSize: 26, color: theme.colors.text, flex: 1, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  section: { marginBottom: theme.spacing.xl },
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 2, marginBottom: theme.spacing.l },
  inputLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 1, marginBottom: theme.spacing.s },
  optionsRow: { flexDirection: 'row', gap: theme.spacing.m },
  optionCard: { flex: 1, paddingVertical: theme.spacing.m, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  optionCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '11' },
  optionText: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: '500' },
  optionTextActive: { color: theme.colors.primary, fontWeight: '700' },
  saveButton: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.m, alignItems: 'center', borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.xxl },
  saveButtonText: { ...theme.typography.body, color: theme.colors.background, fontWeight: '600', letterSpacing: 2 },
});

