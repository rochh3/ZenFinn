import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Alert } from '../utils/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Button, Field, Icon } from '../components/ui';

export const AuthScreen = () => {
  const { t, theme } = useSettings();
  const styles = useStyles(makeStyles);
  const { signIn, signUp, resetPassword, enterDemo } = useAuth();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === 'signup';

  const friendly = (e) => (/invalid login/i.test(e.message) ? t('invalidCreds') : e.message);

  const submit = async () => {
    if (!email.trim() || !password || (isSignUp && !name.trim())) return Alert.alert(t('error'), t('required'));
    if (isSignUp && password.length < 6) return Alert.alert(t('error'), t('passwordMin'));
    setBusy(true);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUp(email, password, name);
        if (needsConfirmation) { Alert.alert(t('signUp'), t('confirmEmail')); setMode('signin'); }
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      Alert.alert(t('error'), friendly(e));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) return Alert.alert(t('error'), t('resetNeedEmail'));
    try { await resetPassword(email); Alert.alert(t('appName'), t('resetSent')); } catch (e) { Alert.alert(t('error'), e.message); }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <View style={styles.logo}><Icon name="leaf" size={38} color={theme.colors.onPrimary} /></View>
            <Text style={styles.brandName}>{t('appName')}</Text>
            <Text style={styles.subtitle}>{t('authSubtitle')}</Text>
          </View>

          <Text style={styles.heading}>{isSignUp ? t('createAccount') : t('welcomeBack')}</Text>

          {isSignUp && <Field label={t('yourName')} value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />}
          <Field label={t('email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
          <Field label={t('password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" textContentType={isSignUp ? 'newPassword' : 'password'} onSubmitEditing={submit} />

          <Button title={isSignUp ? t('signUp') : t('signIn')} onPress={submit} loading={busy} />

          {!isSignUp && (
            <TouchableOpacity onPress={forgot} style={styles.link}><Text style={styles.linkText}>{t('forgot')}</Text></TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setMode(isSignUp ? 'signin' : 'signup')} style={styles.link}>
            <Text style={[styles.linkText, { fontWeight: '700' }]}>{isSignUp ? t('haveAccount') : t('noAccount')}</Text>
          </TouchableOpacity>
          <Button title={t('tryDemo')} icon="flash-outline" variant="secondary" onPress={enterDemo} style={{ marginTop: theme.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', padding: theme.spacing.xl, paddingTop: theme.spacing.xxl * 1.5, flexGrow: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: theme.spacing.xxl },
  logo: { width: 76, height: 76, borderRadius: 26, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.l },
  brandName: { ...theme.font.title, fontSize: 32, color: theme.colors.text },
  subtitle: { ...theme.font.small, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6 },
  heading: { ...theme.font.h1, color: theme.colors.text, marginBottom: theme.spacing.xl },
  link: { alignItems: 'center', paddingVertical: theme.spacing.m, marginTop: theme.spacing.s },
  linkText: { ...theme.font.small, color: theme.colors.primary },
});
