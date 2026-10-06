import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Screen, ScreenTitle, Card, Icon, Avatar } from '../components/ui';

export const MoreScreen = ({ navigation }) => {
  const { t, theme } = useSettings();
  const styles = useStyles(makeStyles);
  const { profile } = useAuth();

  const items = [
    { route: 'Budgets', icon: 'speedometer-outline', label: t('budgets'), color: theme.colors.chart[0] },
    { route: 'Calendar', icon: 'calendar-outline', label: t('calendar'), color: theme.colors.chart[1] },
    { route: 'Categories', icon: 'pricetags-outline', label: t('categories'), color: theme.colors.chart[2] },
    { route: 'Shared', icon: 'people-outline', label: t('shared'), color: theme.colors.chart[3] },
  ];

  return (
    <Screen>
      <ScreenTitle title={t('tabMore')} subtitle={t('moreSubtitle')} />

      <Card onPress={() => navigation.navigate('Account')} style={styles.profile}>
        <Avatar name={profile?.name} size={52} />
        <View style={{ flex: 1, marginLeft: theme.spacing.l }}>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email} numberOfLines={1}>{profile?.email}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </Card>

      <View style={styles.grid}>
        {items.map((it) => (
          <View key={it.route} style={styles.tile}>
            <Card onPress={() => navigation.navigate(it.route)} style={{ minHeight: 128 }}>
              <View style={[styles.tileIcon, { backgroundColor: it.color + '26' }]}><Icon name={it.icon} size={26} color={it.color} /></View>
              <Text style={styles.tileLabel}>{it.label}</Text>
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l },
  name: { ...theme.font.h2, color: theme.colors.text },
  email: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  tile: { width: '50%', padding: 6 },
  tileIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.m },
  tileLabel: { ...theme.font.h2, color: theme.colors.text },
});
