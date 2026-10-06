import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useData } from '../context/DataContext';
import { Screen, ScreenTitle, Card, Segmented, IconButton, EmptyState, SectionHeader } from '../components/ui';
import { DonutChart, BarChart } from '../components/charts';
import { formatMoney } from '../utils/format';
import { getRange, periodLabel, inRange, summarize, byCategory, buildSeries } from '../utils/finance';

export const StatisticsScreen = () => {
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { transactions, categoriesById } = useData();
  const [period, setPeriod] = useState('month');
  const [offset, setOffset] = useState(0);

  const range = useMemo(() => getRange(period, offset), [period, offset]);
  const filtered = useMemo(() => transactions.filter((tx) => inRange(tx.date, range)), [transactions, range]);
  const totals = useMemo(() => summarize(filtered), [filtered]);
  const cats = useMemo(() => byCategory(filtered, categoriesById), [filtered, categoriesById]);
  const series = useMemo(() => buildSeries(filtered, period, range, language), [filtered, period, range, language]);

  const palette = theme.colors.chart;
  const colorOf = (item, i) => item.category?.color || palette[i % palette.length];
  const donut = cats.map((c, i) => ({ value: c.value, color: colorOf(c, i) }));

  return (
    <Screen>
      <ScreenTitle title={t('stats')} />
      <Segmented
        value={period}
        onChange={(p) => { setPeriod(p); setOffset(0); }}
        options={[{ value: 'day', label: t('day') }, { value: 'month', label: t('month') }, { value: 'quarter', label: t('quarter') }, { value: 'year', label: t('year') }]}
      />

      <View style={styles.nav}>
        <IconButton name="chevron-back" onPress={() => setOffset(offset - 1)} />
        <Text style={styles.navLabel}>{periodLabel(period, range, language)}</Text>
        <IconButton name="chevron-forward" onPress={() => offset < 0 && setOffset(offset + 1)} color={offset >= 0 ? theme.colors.border : undefined} />
      </View>

      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { marginRight: 8 }]}>
          <Text style={styles.summaryLabel}>{t('incomes')}</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(totals.income, language)}</Text>
        </Card>
        <Card style={[styles.summaryCard, { marginLeft: 8 }]}>
          <Text style={styles.summaryLabel}>{t('expenses')}</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(totals.expense, language)}</Text>
        </Card>
      </View>
      <Card tone="alt" style={styles.netCard}>
        <Text style={styles.summaryLabel}>{t('net')}</Text>
        <Text style={[styles.netValue, { color: totals.net >= 0 ? theme.colors.success : theme.colors.danger }]}>
          {totals.net >= 0 ? '+' : '−'}{formatMoney(Math.abs(totals.net), language)}
        </Text>
      </Card>

      {filtered.length === 0 ? (
        <Card style={{ marginTop: theme.spacing.l }}><EmptyState icon="stats-chart-outline" title={t('noData')} /></Card>
      ) : (
        <>
          {series.length > 0 && (
            <>
              <SectionHeader title={t('evolution')} />
              <Card><BarChart data={series} /></Card>
            </>
          )}

          {cats.length > 0 && (
            <>
              <SectionHeader title={t('byCategory')} />
              <Card>
                <View style={{ alignItems: 'center', marginBottom: theme.spacing.l }}>
                  <DonutChart data={donut} centerTop={t('expenses')} centerBottom={formatMoney(totals.expense, language, { compact: true })} />
                </View>
                {cats.map((c, i) => {
                  const pct = totals.expense > 0 ? (c.value / totals.expense) * 100 : 0;
                  return (
                    <View key={c.id} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: colorOf(c, i) }]} />
                      <Text style={styles.legendName} numberOfLines={1}>{c.category ? `${c.category.icon} ${c.category.name}` : t('noCategory')}</Text>
                      <Text style={styles.legendPct}>{pct.toFixed(0)}%</Text>
                      <Text style={styles.legendValue}>{formatMoney(c.value, language)}</Text>
                    </View>
                  );
                })}
              </Card>
            </>
          )}
        </>
      )}
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: theme.spacing.m },
  navLabel: { ...theme.font.h2, color: theme.colors.text, textTransform: 'capitalize' },
  summaryRow: { flexDirection: 'row' },
  summaryCard: { flex: 1 },
  summaryLabel: { ...theme.font.caption, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  summaryValue: { ...theme.font.h1, marginTop: 6 },
  netCard: { marginTop: theme.spacing.m, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netValue: { ...theme.font.h1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendName: { ...theme.font.body, color: theme.colors.text, flex: 1, fontWeight: '600' },
  legendPct: { ...theme.font.small, color: theme.colors.textSecondary, width: 44, textAlign: 'right' },
  legendValue: { ...theme.font.body, color: theme.colors.text, width: 96, textAlign: 'right', fontWeight: '700' },
});
