import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { formatMoney } from '../utils/format';

export const TransactionRow = React.memo(({ tx, category, onPress }) => {
  const { theme, language, t } = useSettings();
  const styles = useStyles(makeStyles);
  const isIncome = tx.type === 'income';
  const color = category?.color || theme.colors.textSecondary;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      <View style={[styles.icon, { backgroundColor: color + '26' }]}>
        <Text style={{ fontSize: 20 }}>{category?.icon || (isIncome ? '💰' : '💸')}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{tx.note || category?.name || t('noCategory')}</Text>
        <Text style={styles.sub} numberOfLines={1}>{category?.name || t('noCategory')}</Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? theme.colors.success : theme.colors.text }]}>
        {isIncome ? '+' : '−'}{formatMoney(tx.amount, language)}
      </Text>
    </TouchableOpacity>
  );
});

const makeStyles = (theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.m },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.m },
  title: { ...theme.font.body, color: theme.colors.text, fontWeight: '600' },
  sub: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: 2 },
  amount: { ...theme.font.h2 },
});
