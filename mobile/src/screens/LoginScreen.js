import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

const HOUSEHOLD_PROFILES = [
  { id: 'alberto', name: 'Alberto', emoji: '👨' },
  { id: 'mora',    name: 'Mora',    emoji: '👩' },
];

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { setCurrentUser } = useApp();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [step, setStep] = useState('select');

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setStep('confirm');
  };

  React.useEffect(() => {
    const checkLogin = async () => {
      try {
        const saved = await SecureStore.getItemAsync('saved_profile');
        if (saved) {
          const profile = JSON.parse(saved);
          setCurrentUser({ id: profile.id, name: profile.name });
          const done = await SecureStore.getItemAsync(`onboarding_done_${profile.id}`);
          if (done) {
            navigation.replace('DrawerNavigator');
          } else {
            navigation.replace('Onboarding');
          }
        }
      } catch (e) {
        console.warn(e);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    setCurrentUser({ id: selectedProfile.id, name: selectedProfile.name });
    try {
      await SecureStore.setItemAsync('saved_profile', JSON.stringify(selectedProfile));
    } catch (e) {}

    // Check if this profile has completed onboarding before
    const onboardingKey = `onboarding_done_${selectedProfile.id}`;
    let done = null;
    try {
      done = await SecureStore.getItemAsync(onboardingKey);
    } catch (e) {
      console.warn('SecureStore read failed:', e.message);
    }

    if (done) {
      navigation.replace('DrawerNavigator');
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
        <Text style={styles.logo}>ZenFin.</Text>
        <Text style={styles.tagline}>GESTIÓN FINANCIERA INTELIGENTE</Text>
      </Animated.View>

      {step === 'select' && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.content}>
          <Text style={styles.prompt}>¿QUIÉN ERES?</Text>
          <View style={styles.profilesRow}>
            {HOUSEHOLD_PROFILES.map((profile, i) => (
              <Animated.View key={profile.id} entering={FadeInDown.delay(400 + i * 120)}>
                <TouchableOpacity
                  style={styles.profileCard}
                  onPress={() => handleSelectProfile(profile)}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>{profile.emoji}</Text>
                  </View>
                  <Text style={styles.profileName}>{profile.name.toUpperCase()}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      {step === 'confirm' && selectedProfile && (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.content}>
          <View style={styles.avatarCircleLarge}>
            <Text style={styles.avatarEmojiLarge}>{selectedProfile.emoji}</Text>
          </View>
          <Text style={styles.prompt}>BIENVENIDO, {selectedProfile.name.toUpperCase()}</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
            <Text style={styles.primaryBtnText}>ENTRAR →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep('select')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← CAMBIAR USUARIO</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Text style={styles.footer}>✦ IA Financiera • Grok • Supabase</Text>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: { alignItems: 'center' },
  logo: {
    fontSize: 52,
    fontWeight: '200',
    color: theme.colors.text,
    letterSpacing: 4,
  },
  tagline: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 4,
    marginTop: theme.spacing.s,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  prompt: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 4,
    marginBottom: theme.spacing.xxl,
  },
  profilesRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.surface,
    minWidth: 110,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  avatarEmoji: { fontSize: 32 },
  profileName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  avatarCircleLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarEmojiLarge: { fontSize: 44 },
  primaryBtn: {
    backgroundColor: theme.colors.text,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: 60,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.l,
  },
  primaryBtnText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
    letterSpacing: 2,
  },
  backBtn: { padding: theme.spacing.m },
  backBtnText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  footer: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    opacity: 0.4,
  },
});
