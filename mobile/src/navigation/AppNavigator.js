import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettings } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../config/supabase';
import { Button, Icon } from '../components/ui';
import { AuthScreen } from '../screens/AuthScreen';
import { Onboarding } from '../screens/Onboarding';
import { TabNavigator } from './TabNavigator';
import { AddTransaction } from '../screens/AddTransaction';

const Stack = createNativeStackNavigator();

const Splash = ({ message, action }) => {
  const { theme, t } = useSettings();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View style={{ width: 84, height: 84, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name="leaf" size={40} color={theme.colors.onPrimary} />
      </View>
      <Text style={{ ...theme.font.title, color: theme.colors.text }}>{t('appName')}</Text>
      {message ? (
        <Text style={{ ...theme.font.body, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 16 }}>{message}</Text>
      ) : (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      )}
      {action ? <Button title={action.title} onPress={action.onPress} variant="secondary" style={{ marginTop: 24 }} /> : null}
    </View>
  );
};

export const AppNavigator = () => {
  const { theme, t } = useSettings();
  const { session, profile, booting, signOut } = useAuth();

  if (!isSupabaseConfigured) return <Splash message={t('notConfigured')} />;
  if (booting) return <Splash />;
  if (session && !profile) return <Splash message={t('aiError')} action={{ title: t('signOut'), onPress: signOut }} />;

  const base = theme.isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: theme.colors.background, card: theme.colors.background, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.primary },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
        ) : !profile.onboarded ? (
          <Stack.Screen name="Onboarding" component={Onboarding} options={{ animation: 'fade' }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} options={{ animation: 'fade' }} />
            <Stack.Screen name="AddTransaction" component={AddTransaction} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />





          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
