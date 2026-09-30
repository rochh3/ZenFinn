import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Dashboard } from '../screens/Dashboard';
import { Categories } from '../screens/Categories';
import { AddTransaction } from '../screens/AddTransaction';
import { CalendarScreen } from '../screens/Calendar';
import { StatisticsScreen } from '../screens/Statistics';
import { AccountScreen } from '../screens/Account';
import { BudgetsScreen } from '../screens/Budgets';
import { ChatScreen } from '../screens/ChatScreen';
import { SharedScreen } from '../screens/Shared';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { t } from '../config/i18n';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  const { theme } = useTheme();
  const { language } = useApp();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.background, shadowOpacity: 0, elevation: 0, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
        headerTintColor: theme.colors.text,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 260,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerLabelStyle: {
          ...theme.typography.caption,
          letterSpacing: 2,
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} options={{ title: t('dashboard', language) }} />
      <Drawer.Screen name="Chat" component={ChatScreen} options={{ title: t('assistant', language) }} />
      <Drawer.Screen name="Budgets" component={BudgetsScreen} options={{ title: t('budgets', language) }} />
      <Drawer.Screen name="Statistics" component={StatisticsScreen} options={{ title: t('statistics', language) }} />
      <Drawer.Screen name="Shared" component={SharedScreen} options={{ title: t('shared', language) }} />
      <Drawer.Screen name="Add" component={AddTransaction} options={{ title: t('addTransaction', language) }} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} options={{ title: t('calendar', language) }} />
      <Drawer.Screen name="Categories" component={Categories} options={{ title: t('categories', language) }} />
      <Drawer.Screen name="Account" component={AccountScreen} options={{ title: t('profile', language) }} />
    </Drawer.Navigator>
  );
};
