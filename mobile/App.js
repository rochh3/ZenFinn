import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/theme/SettingsContext';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const ThemedStatusBar = () => {
  const { theme } = useSettings();
  return <StatusBar style={theme.isDark ? 'light' : 'dark'} />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <DataProvider>
            <ThemedStatusBar />
            <AppNavigator />
          </DataProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
