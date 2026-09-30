import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { t } from '../config/i18n';

const FILTERS = ['daily', 'monthly', 'quarterly', 'yearly'];

export const StatisticsScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { transactions, categories, language } = useApp();
  const [filter, setFilter] = useState('monthly');
  const [offset, setOffset] = useState(0); // 0 = current, -1 = previous, etc.

  // Helper to change offset
  const handleOffset = (delta) => setOffset(prev => prev + delta);

  // Change filter resets offset
  const handleFilterChange = (f) => {
    setFilter(f);
    setOffset(0);
  };

  // Filter transactions by period
  const baseDate = new Date();
  
  const filtered = transactions.filter(tx => {
    const d = new Date(tx.date.split('/').reverse().join('-'));
    if (isNaN(d.getTime())) return false; // invalid date safeguard

    if (filter === 'daily') {
      const target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
      return d.toDateString() === target.toDateString();
    }
    if (filter === 'monthly') {
      const target = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
      return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
    }
    if (filter === 'quarterly') {
      const currentQ = Math.floor(baseDate.getMonth() / 3);
      // Calculate target quarter handling year wrap
      const targetMonthsOffset = offset * 3;
      const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + targetMonthsOffset, 1);
      const targetQ = Math.floor(targetDate.getMonth() / 3);
      return Math.floor(d.getMonth() / 3) === targetQ && d.getFullYear() === targetDate.getFullYear();
    }
    if (filter === 'yearly') {
      const targetYear = baseDate.getFullYear() + offset;
      return d.getFullYear() === targetYear;
    }
    return true;
  });

  // Display label for current period
  const getPeriodLabel = () => {
    if (offset === 0) return language === 'en' ? 'Current' : 'Actual';
    if (filter === 'daily') {
      const tDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
      return tDate.toLocaleDateString();
    }
    if (filter === 'monthly') {
      const tDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
      return `${tDate.getMonth() + 1}/${tDate.getFullYear()}`;
    }
    if (filter === 'quarterly') {
      const tDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + (offset * 3), 1);
      const q = Math.floor(tDate.getMonth() / 3) + 1;
      return `Q${q} ${tDate.getFullYear()}`;
    }
    if (filter === 'yearly') {
      return `${baseDate.getFullYear() + offset}`;
    }
    return '';
  };

  const expenses = filtered.filter(tx => tx.type === 'expense');
  const income = filtered.filter(tx => tx.type === 'income');
  const totalExpense = expenses.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
  const totalIncome = income.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

  // Group by category
  const byCategory = categories.map(cat => {
    const spent = expenses.filter(tx => tx.category === cat.name).reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    return { ...cat, spent };
  }).filter(c => c.spent > 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>{t('stats', language)}</Text>

      {/* Filter bar */}
      <View style={styles.filterContainer}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => handleFilterChange(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{t(f, language).toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period Navigator */}
      <View style={styles.periodNav}>
        <TouchableOpacity onPress={() => handleOffset(-1)} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.periodLabel}>{getPeriodLabel()}</Text>
        <TouchableOpacity onPress={() => handleOffset(1)} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{language === 'en' ? 'EXPENSES' : 'GASTOS'}</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.danger }]}>{totalExpense.toFixed(2)} €</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{language === 'en' ? 'INCOME' : 'INGRESOS'}</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>{totalIncome.toFixed(2)} €</Text>
        </View>
      </View>

      {/* Chart */}
      {(totalExpense > 0 || totalIncome > 0) && (
        <View style={styles.chartContainer}>
          <View style={styles.barWrapper}>
            <View style={[styles.bar, { height: `${Math.max((totalExpense / (totalExpense + totalIncome)) * 100, 5)}%`, backgroundColor: theme.colors.danger }]} />
            <Text style={styles.barLabel}>{language === 'en' ? 'Exp.' : 'Gas.'}</Text>
          </View>
          <View style={styles.barWrapper}>
            <View style={[styles.bar, { height: `${Math.max((totalIncome / (totalExpense + totalIncome)) * 100, 5)}%`, backgroundColor: theme.colors.success }]} />
            <Text style={styles.barLabel}>{language === 'en' ? 'Inc.' : 'Ing.'}</Text>
          </View>
        </View>
      )}

      {/* By category */}
      <Text style={styles.sectionTitle}>{language === 'en' ? 'BY CATEGORY' : 'POR CATEGORÍA'}</Text>

      {byCategory.length === 0 ? (
        <Text style={styles.emptyText}>
          {transactions.length === 0
            ? (language === 'en' ? 'Add transactions to see stats' : 'Añade transacciones para ver estadísticas')
            : (language === 'en' ? 'No expenses in this period' : 'Sin gastos en este período')}
        </Text>
      ) : (
        byCategory.map(cat => {
          const pct = totalExpense > 0 ? ((cat.spent / totalExpense) * 100).toFixed(0) : 0;
          return (
            <View key={cat.id} style={styles.catRow}>
              <View style={styles.catRowHeader}>
                <Text style={styles.catName}>{cat.icon} {cat.name}</Text>
                <Text style={styles.catAmount}>{cat.spent.toFixed(2)} €  <Text style={{ color: theme.colors.textSecondary }}>{pct}%</Text></Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l },
  header: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxl, marginBottom: theme.spacing.m, textAlign: 'center', letterSpacing: 4 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  periodNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.m, marginBottom: theme.spacing.l },
  arrowBtn: { padding: theme.spacing.s },
  arrowText: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' },
  periodLabel: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' },
  filterText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  filterTextActive: { color: theme.colors.primary, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.m, marginBottom: theme.spacing.xl },
  summaryCard: { flex: 1, backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border },
  summaryLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.s },
  summaryAmount: { ...theme.typography.h2 },
  chartContainer: { flexDirection: 'row', justifyContent: 'center', height: 150, marginBottom: theme.spacing.xl, alignItems: 'flex-end', gap: 40 },
  barWrapper: { alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: 40, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  barLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 8 },
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 2, marginBottom: theme.spacing.m },
  emptyText: { ...theme.typography.caption, color: theme.colors.textSecondary, opacity: 0.5, textAlign: 'center', marginTop: theme.spacing.xxl },
  catRow: { marginBottom: theme.spacing.l },
  catRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.s },
  catName: { ...theme.typography.body, color: theme.colors.text },
  catAmount: { ...theme.typography.caption, color: theme.colors.text },
  progressTrack: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});
