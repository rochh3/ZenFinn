import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dashboard } from '../screens/Dashboard';
import { StatisticsScreen } from '../screens/Statistics';
import { ChatScreen } from '../screens/ChatScreen';
import { MoreStack } from './MoreStack';
import { Icon } from '../components/ui';
import { useSettings } from '../theme/SettingsContext';

const Tab = createBottomTabNavigator();

const Placeholder = () => null;

const AddButton = ({ onPress }) => {
  const { theme } = useSettings();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        style={{
          top: -14, width: 58, height: 58, borderRadius: 29, backgroundColor: theme.colors.primary,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: theme.colors.primary, shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
        }}
      >
        <Icon name="add" size={32} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

export const TabNavigator = () => {
  const { theme, t } = useSettings();
  const icon = (active, inactive) => ({ color, focused }) => <Icon name={focused ? active : inactive} size={24} color={color} />;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: t('tabHome'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: t('tabStats'), tabBarIcon: icon('pie-chart', 'pie-chart-outline') }} />
      <Tab.Screen
        name="AddTab"
        component={Placeholder}
        options={({ navigation }) => ({
          title: t('tabAdd'),
          tabBarLabel: () => null,
          tabBarButton: () => <AddButton onPress={() => navigation.getParent().navigate('AddTransaction')} />,
        })}
      />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('tabAssistant'), tabBarIcon: icon('sparkles', 'sparkles-outline') }} />
      <Tab.Screen name="More" component={MoreStack} options={{ title: t('tabMore'), tabBarIcon: icon('grid', 'grid-outline') }} />
    </Tab.Navigator>
  );
};
