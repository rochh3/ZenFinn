import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettings } from '../theme/SettingsContext';
import { MoreScreen } from '../screens/More';
import { BudgetsScreen } from '../screens/Budgets';
import { CalendarScreen } from '../screens/Calendar';
import { Categories } from '../screens/Categories';
import { SharedScreen } from '../screens/Shared';
import { SharedGroupScreen } from '../screens/SharedGroup';
import { AccountScreen } from '../screens/Account';

const Stack = createNativeStackNavigator();

/**
 * Pantallas secundarias dentro de la pestaña "Más": así la barra inferior sigue visible
 * y se puede volver a Inicio (o al menú) en un toque, además de con la flecha de atrás.
 */
export const MoreStack = () => {
  const { theme, t } = useSettings();
  const header = (title) => ({
    headerShown: true,
    title,
    headerStyle: { backgroundColor: theme.colors.background },
    headerShadowVisible: false,
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { ...theme.font.h2, color: theme.colors.text },
    headerBackButtonDisplayMode: 'default',
  });

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MoreHome" component={MoreScreen} />
      <Stack.Screen name="Budgets" component={BudgetsScreen} options={header(t('budgets'))} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={header(t('calendar'))} />
      <Stack.Screen name="Categories" component={Categories} options={header(t('categories'))} />
      <Stack.Screen name="Shared" component={SharedScreen} options={header(t('shared'))} />
      <Stack.Screen name="SharedGroup" component={SharedGroupScreen} options={header('')} />
      <Stack.Screen name="Account" component={AccountScreen} options={header(t('profile'))} />
    </Stack.Navigator>
  );
};
