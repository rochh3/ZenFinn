import React, { useMemo, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert } from '../utils/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { suggestedCategories } from '../config/defaults';
import { parseAmount, formatMoney } from '../utils/format';
import { Button, Chip, Field, Segmented, ProgressBar, Icon } from '../components/ui';
import { ThemePicker } from '../components/ThemePicker';
import { LANGUAGES } from '../config/i18n';

const TOTAL = 3;

export const Onboarding = () => {
  const { t, theme, themeId, setThemeId, language, setLanguage } = useSettings();
  const styles = useStyles(makeStyles);
  const { profile, updateProfile } = useAuth();
  const { addCategories, addRecurringMany } = useData();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile?.name || '');
  const suggestions = useMemo(() => suggestedCategories(language), [language]);
  const [picked, setPicked] = useState(() => new Set(suggestions.map((_, i) => i)));
  const [fixed, setFixed] = useState([]);
  const [fixedName, setFixedName] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (i) => setPicked((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const addFixed = () => {
    const amount = parseAmount(fixedAmount);
    if (!fixedName.trim() || isNaN(amount)) return Alert.alert(t('error'), t('required'));
    setFixed((l) => [...l, { kind: 'expense', name: fixedName.trim(), amount, day: 1 }]);
    setFixedName(''); setFixedAmount('');
  };

  const finish = async () => {
    setBusy(true);
    try {
      await addCategories(suggestions.filter((_, i) => picked.has(i)));
      await addRecurringMany(fixed);
      await updateProfile({ name: name.trim(), theme: themeId, language, onboarded: true });
    } catch (e) {
      Alert.alert(t('error'), e.message);
      setBusy(false);
    }
  };

  const next = () => {
    if (step === 1 && !name.trim()) return Alert.alert(t('error'), t('required'));
    if (step < TOTAL) setStep(step + 1);
    else finish();
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.frame}>
        <View style={styles.top}>
          <Text style={styles.stepText}>{t('step', { n: step, total: TOTAL })}</Text>
          <ProgressBar value={step / TOTAL} style={{ marginTop: 8 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <>
              <Text style={styles.title}>{t('obHello')}</Text>
              <Field label={t('obName')} value={name} onChangeText={setName} autoCapitalize="words" style={{ marginTop: 24 }} />
              <Text style={styles.sub}>{t('language')}</Text>
              <Segmented options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))} value={language} onChange={setLanguage} style={{ marginBottom: 24 }} />
              <Text style={styles.sub}>{t('obTheme')}</Text>
              <ThemePicker value={themeId} onChange={setThemeId} />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>{t('obCategories')}</Text>
              <Text style={styles.hint}>{t('obCategoriesHint')}</Text>
              <View style={styles.chips}>
                {suggestions.map((c, i) => (
                  <Chip key={c.name} icon={c.icon} label={c.name} color={c.color} active={picked.has(i)} onPress={() => toggle(i)} />
                ))}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>{t('obFixed')}</Text>
              <Text style={styles.hint}>{t('obFixedHint')}</Text>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Field value={fixedName} onChangeText={setFixedName} placeholder={t('name')} style={{ flex: 2, marginBottom: 0, marginRight: 8 }} />
                <Field value={fixedAmount} onChangeText={setFixedAmount} placeholder="0,00" keyboardType="decimal-pad" style={{ flex: 1, marginBottom: 0 }} />
              </View>
              <Button title={t('add')} variant="secondary" icon="add" onPress={addFixed} style={{ marginTop: 12 }} />
              {fixed.map((f, i) => (
                <View key={i} style={styles.fixedRow}>
                  <Text style={styles.fixedName}>{f.name}</Text>
                  <Text style={styles.fixedAmount}>{formatMoney(f.amount, language)}</Text>
                  <TouchableOpacity onPress={() => setFixed((l) => l.filter((_, j) => j !== i))} hitSlop={10}>
                    <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && <Button title={t('back')} variant="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1, marginRight: 10 }} />}
          <Button title={step === TOTAL ? t('obStart') : t('next')} onPress={next} loading={busy} style={{ flex: 2 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  top: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.l },
  stepText: { ...theme.font.caption, color: theme.colors.textSecondary },
  content: { padding: theme.spacing.xl, paddingTop: theme.spacing.xxl },
  title: { ...theme.font.title, color: theme.colors.text },
  hint: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: 6 },
  sub: { ...theme.font.caption, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24 },
  footer: { flexDirection: 'row', padding: theme.spacing.xl, paddingTop: theme.spacing.m },
  fixedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  fixedName: { ...theme.font.body, color: theme.colors.text, flex: 1, fontWeight: '600' },
  fixedAmount: { ...theme.font.body, color: theme.colors.text, marginRight: 12 },
});
