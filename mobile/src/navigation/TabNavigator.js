import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dashboard } from '../screens/Dashboard';
import { Categories } from '../screens/Categories';
import { AddTransaction } from '../screens/AddTransaction';
import { CalendarScreen } from '../screens/Calendar';
import { AccountScreen } from '../screens/Account';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { t } from '../config/i18n';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { theme } = useTheme();
  const { language } = useApp();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontSize: 9,
          marginBottom: 4,
          letterSpacing: 1,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ title: t('dashboard', language) }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: t('calendar', language) }}
      />
      <Tab.Screen 
        name="Add" 
        component={AddTransaction} 
        options={{ 
          title: t('addTransaction', language),
          tabBarLabelStyle: { color: theme.colors.primary, ...theme.typography.caption, fontSize: 9 }
        }}
      />
      <Tab.Screen 
        name="Categories" 
        component={Categories} 
        options={{ title: t('categories', language) }} 
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ title: t('profile', language) }}
      />
    </Tab.Navigator>
  );
};
