import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useData } from '../context/DataContext';
import { Screen, Card, IconButton, EmptyState } from '../components/ui';
import { TransactionRow } from '../components/TransactionRow';
import { toISODate, todayISO, monthName, weekdayInitials, formatMoney, friendlyDate } from '../utils/format';
import { summarize } from '../utils/finance';

export const CalendarScreen = () => {
  const navigation = useNavigation();
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { transactions, categoriesById } = useData();

  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(todayISO());

  const byDate = useMemo(() => {
    const map = new Map();
    for (const tx of transactions) {
      if (!map.has(tx.date)) map.set(tx.date, []);
      map.get(tx.date).push(tx);
    }
    return map;
  }, [transactions]);

  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const lead = (new Date(year, m, 1).getDay() + 6) % 7; // lunes primero
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const dayTx = byDate.get(selected) || [];
  const dayTotals = summarize(dayTx);
  const today = todayISO();

  return (
    <Screen edges={[]}>
      <View style={styles.nav}>
        <IconButton name="chevron-back" onPress={() => setMonth(new Date(year, m - 1, 1))} />
        <Text style={styles.monthTitle}>{monthName(m, language)} {year}</Text>
        <IconButton name="chevron-forward" onPress={() => setMonth(new Date(year, m + 1, 1))} />
      </View>

      <Card style={{ paddingHorizontal: theme.spacing.s }}>
        <View style={styles.weekRow}>
          {weekdayInitials(language).map((d, i) => <Text key={i} style={styles.weekDay}>{d}</Text>)}
        </View>
        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const iso = toISODate(new Date(year, m, day));
            const list = byDate.get(iso);
            const isSel = iso === selected;
            const hasIncome = list?.some((x) => x.type === 'income');
            const hasExpense = list?.some((x) => x.type === 'expense');
            return (
              <TouchableOpacity key={i} style={styles.cell} onPress={() => setSelected(iso)} activeOpacity={0.7}>
                <View style={[styles.dayCircle, isSel && { backgroundColor: theme.colors.primary }, !isSel && iso === today && { borderWidth: 1.5, borderColor: theme.colors.primary }]}>
                  <Text style={[styles.dayText, isSel && { color: theme.colors.onPrimary, fontWeight: '800' }]}>{day}</Text>
                </View>
                <View style={styles.dots}>
                  {hasExpense && <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />}
                  {hasIncome && <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{friendlyDate(selected, t, language)}</Text>
        {dayTx.length > 0 && <Text style={styles.dayNet}>{dayTotals.net >= 0 ? '+' : '−'}{formatMoney(Math.abs(dayTotals.net), language)}</Text>}
      </View>

      <Card style={{ paddingVertical: theme.spacing.xs }}>
        {dayTx.length === 0 ? (
          <EmptyState icon="calendar-clear-outline" title={t('noDayTransactions')} />
        ) : (
          dayTx.map((tx, i) => (
            <View key={tx.id} style={i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.border }}>
              <TransactionRow tx={tx} category={categoriesById[tx.categoryId]} onPress={() => navigation.navigate('AddTransaction', { txId: tx.id })} />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.m },
  monthTitle: { ...theme.font.h1, color: theme.colors.text, textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row', marginBottom: theme.spacing.s },
  weekDay: { flex: 1, textAlign: 'center', ...theme.font.caption, color: theme.colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4, height: 52 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayText: { ...theme.font.body, color: theme.colors.text },
  dots: { flexDirection: 'row', height: 6, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, marginHorizontal: 1 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xl, marginBottom: theme.spacing.s, paddingHorizontal: 4 },
  dayTitle: { ...theme.font.h2, color: theme.colors.text, textTransform: 'capitalize' },
  dayNet: { ...theme.font.h2, color: theme.colors.textSecondary },
});
