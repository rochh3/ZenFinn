import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Screen, Card, Button, SectionHeader, EmptyState, Icon, Banner } from '../components/ui';
import { TransactionRow } from '../components/TransactionRow';
import { formatMoney, friendlyDate } from '../utils/format';
import { summarize } from '../utils/finance';

const RECENT_DAYS = 8; // número de días con movimientos que se muestran en Inicio

export const Dashboard = () => {
  const navigation = useNavigation();
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { profile } = useAuth();
  const { transactions, categoriesById, loading, reload, offline } = useData();

  const { total, month, groups } = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const all = summarize(transactions);
    const thisMonth = summarize(transactions.filter((tx) => tx.date.startsWith(prefix)));
    const byDay = [];
    for (const tx of transactions) {
      const last = byDay[byDay.length - 1];
      if (last && last.date === tx.date) last.items.push(tx);
      else if (byDay.length < RECENT_DAYS) byDay.push({ date: tx.date, items: [tx] });
    }
    return { total: all.net, month: thisMonth, groups: byDay };
  }, [transactions]);

  const openAdd = (type) => navigation.navigate('AddTransaction', { type });
  const openTx = (id) => navigation.navigate('AddTransaction', { txId: id });

  return (
    <Screen onRefresh={() => reload()} refreshing={loading}>
      {offline && <Banner text={t('offline')} />}
      <Text style={styles.greeting}>{t('hello', { name: profile?.name || '' })} 👋</Text>

      <Animated.View entering={FadeInDown.springify().damping(16)}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{t('currentBalance')}</Text>
          <Text style={styles.heroAmount} adjustsFontSizeToFit numberOfLines={1}>{formatMoney(total, language)}</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.22)' }]}><Icon name="arrow-down" size={16} color={theme.colors.onPrimary} /></View>
              <View>
                <Text style={styles.heroStatLabel}>{t('incomes')} · {t('thisMonth').toLowerCase()}</Text>
                <Text style={styles.heroStatValue}>{formatMoney(month.income, language)}</Text>
              </View>
            </View>
            <View style={styles.heroStat}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.22)' }]}><Icon name="arrow-up" size={16} color={theme.colors.onPrimary} /></View>
              <View>
                <Text style={styles.heroStatLabel}>{t('expenses')} · {t('thisMonth').toLowerCase()}</Text>
                <Text style={styles.heroStatValue}>{formatMoney(month.expense, language)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.actions}>
        <Button title={t('expense')} icon="remove-circle-outline" variant="secondary" onPress={() => openAdd('expense')} style={{ flex: 1, marginRight: 10 }} />
        <Button title={t('income')} icon="add-circle-outline" variant="secondary" onPress={() => openAdd('income')} style={{ flex: 1 }} />
      </View>

      <SectionHeader title={t('recent')} />

      {groups.length === 0 ? (
        <Card><EmptyState icon="wallet-outline" title={t('noTransactions')} text={t('noTransactionsHint')} actionLabel={t('newTransaction')} onAction={() => openAdd('expense')} /></Card>
      ) : (
        groups.map((g) => {
          const day = summarize(g.items);
          return (
            <View key={g.date} style={{ marginBottom: theme.spacing.l }}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{friendlyDate(g.date, t, language)}</Text>
                <Text style={styles.dayTotal}>{day.net >= 0 ? '+' : '−'}{formatMoney(Math.abs(day.net), language)}</Text>
              </View>
              <Card style={{ paddingVertical: theme.spacing.xs }}>
                {g.items.map((tx, i) => (
                  <View key={tx.id} style={i > 0 && styles.divider}>
                    <TransactionRow tx={tx} category={categoriesById[tx.categoryId]} onPress={() => openTx(tx.id)} />
                  </View>
                ))}
              </Card>
            </View>
          );
        })
      )}
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  greeting: { ...theme.font.h1, color: theme.colors.text, marginBottom: theme.spacing.l },
  hero: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl, padding: theme.spacing.xl },
  heroLabel: { ...theme.font.caption, color: theme.colors.onPrimary, opacity: 0.8, textTransform: 'uppercase' },
  heroAmount: { ...theme.font.amountXL, color: theme.colors.onPrimary, marginTop: 4, marginBottom: theme.spacing.l },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  heroIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  heroStatLabel: { fontSize: 11, color: theme.colors.onPrimary, opacity: 0.8, fontWeight: '600' },
  heroStatValue: { ...theme.font.body, color: theme.colors.onPrimary, fontWeight: '800' },
  actions: { flexDirection: 'row', marginTop: theme.spacing.l },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.s, paddingHorizontal: 4 },
  dayTitle: { ...theme.font.small, color: theme.colors.textSecondary, fontWeight: '700', textTransform: 'capitalize' },
  dayTotal: { ...theme.font.small, color: theme.colors.textSecondary, fontWeight: '700' },
  divider: { borderTopWidth: 1, borderTopColor: theme.colors.border },
});
