import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Alert } from '../utils/alert';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useData } from '../context/DataContext';
import { Screen, Card, Button, Field, Label, Chip, Sheet, SectionHeader, ProgressBar, EmptyState, Icon } from '../components/ui';
import { formatMoney, parseAmount } from '../utils/format';

export const BudgetsScreen = () => {
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { recurring, addRecurring, deleteRecurring, budgets, setBudget, deleteBudget, activeCategories, categoriesById, transactions } = useData();

  const [recSheet, setRecSheet] = useState(null); // 'expense' | 'income' | null
  const [recName, setRecName] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recDay, setRecDay] = useState('1');
  const [limitSheet, setLimitSheet] = useState(false);
  const [limitCat, setLimitCat] = useState(null);
  const [limitValue, setLimitValue] = useState('');
  const [busy, setBusy] = useState(false);

  const fixed = recurring.filter((r) => r.kind === 'expense');
  const incomes = recurring.filter((r) => r.kind === 'income');
  const totalFixed = fixed.reduce((a, r) => a + r.amount, 0);
  const totalIncome = incomes.reduce((a, r) => a + r.amount, 0);
  const margin = totalIncome - totalFixed;

  // Gasto del mes en curso por categoría
  const spentByCat = useMemo(() => {
    const d = new Date();
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const map = {};
    for (const tx of transactions) if (tx.type === 'expense' && tx.date.startsWith(prefix) && tx.categoryId) map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
    return map;
  }, [transactions]);

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (e) { Alert.alert(t('error'), e.message); } finally { setBusy(false); }
  };

  const saveRecurring = () => {
    const amount = parseAmount(recAmount);
    const day = Math.min(31, Math.max(1, parseInt(recDay, 10) || 1));
    if (!recName.trim() || isNaN(amount)) return Alert.alert(t('error'), t('required'));
    run(async () => {
      await addRecurring({ kind: recSheet, name: recName.trim(), amount, day });
      setRecSheet(null); setRecName(''); setRecAmount(''); setRecDay('1');
    });
  };

  const saveLimit = () => {
    const limit = parseAmount(limitValue);
    if (!limitCat || isNaN(limit)) return Alert.alert(t('error'), t('required'));
    run(async () => { await setBudget(limitCat, limit); setLimitSheet(false); setLimitCat(null); setLimitValue(''); });
  };

  const confirmDelete = (fn) =>
    Alert.alert(t('delete'), t('deleteTxMsg'), [{ text: t('cancel'), style: 'cancel' }, { text: t('delete'), style: 'destructive', onPress: () => run(fn) }]);

  const RecurringList = ({ items, kind }) =>
    items.length === 0 ? (
      <Card><Text style={styles.empty}>{kind === 'expense' ? t('noFixed') : t('noRecurring')}</Text></Card>
    ) : (
      <Card style={{ paddingVertical: theme.spacing.xs }}>
        {items.map((r, i) => (
          <View key={r.id} style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={[styles.dot, { backgroundColor: kind === 'expense' ? theme.colors.danger : theme.colors.success }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{r.name}</Text>
              <Text style={styles.rowSub}>{t('everyMonthDay', { day: r.day })}</Text>
            </View>
            <Text style={[styles.rowAmount, { color: kind === 'income' ? theme.colors.success : theme.colors.text }]}>{formatMoney(r.amount, language)}</Text>
            <TouchableOpacity hitSlop={10} onPress={() => confirmDelete(() => deleteRecurring(r.id))} style={{ marginLeft: 12 }}>
              <Icon name="trash-outline" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>
    );

  return (
    <Screen edges={[]}>
      <Card tone="alt">
        <Text style={styles.cap}>{t('monthlyMargin')}</Text>
        <Text style={[styles.margin, { color: margin >= 0 ? theme.colors.success : theme.colors.danger }]}>
          {margin >= 0 ? '+' : '−'}{formatMoney(Math.abs(margin), language)}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: theme.spacing.m }}>
          <View style={{ flex: 1 }}><Text style={styles.cap}>{t('fixedExpenses')}</Text><Text style={[styles.sum, { color: theme.colors.danger }]}>−{formatMoney(totalFixed, language)}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.cap}>{t('recurringIncomes')}</Text><Text style={[styles.sum, { color: theme.colors.success }]}>+{formatMoney(totalIncome, language)}</Text></View>
        </View>
      </Card>

      <SectionHeader title={t('categoryLimits')} actionLabel={`+ ${t('newPlan')}`} onAction={() => setLimitSheet(true)} />
      {budgets.length === 0 ? (
        <Card><EmptyState icon="speedometer-outline" title={t('noLimits')} /></Card>
      ) : (
        budgets.map((b) => {
          const cat = categoriesById[b.categoryId];
          if (!cat) return null;
          const spent = spentByCat[b.categoryId] || 0;
          const ratio = spent / b.limit;
          const barColor = ratio >= 1 ? theme.colors.danger : ratio >= 0.85 ? theme.colors.warning : cat.color;
          return (
            <Card key={b.id} style={{ marginBottom: theme.spacing.m }}>
              <View style={styles.limitHead}>
                <Text style={{ fontSize: 22, marginRight: 10 }}>{cat.icon}</Text>
                <Text style={styles.rowName}>{cat.name}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity hitSlop={10} onPress={() => confirmDelete(() => deleteBudget(b.id))}><Icon name="trash-outline" size={18} color={theme.colors.textSecondary} /></TouchableOpacity>
              </View>
              <ProgressBar value={ratio} color={barColor} style={{ marginVertical: theme.spacing.m }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.rowSub}>{formatMoney(spent, language)} / {formatMoney(b.limit, language)}</Text>
                <Text style={[styles.rowSub, { color: ratio >= 1 ? theme.colors.danger : theme.colors.textSecondary, fontWeight: '700' }]}>
                  {ratio >= 1 ? t('overBy', { amount: formatMoney(spent - b.limit, language) }) : t('leftThisMonth', { amount: formatMoney(b.limit - spent, language) })}
                </Text>
              </View>
            </Card>
          );
        })
      )}

      <SectionHeader title={t('fixedExpenses')} actionLabel={`+ ${t('add')}`} onAction={() => setRecSheet('expense')} />
      <RecurringList items={fixed} kind="expense" />

      <SectionHeader title={t('recurringIncomes')} actionLabel={`+ ${t('add')}`} onAction={() => setRecSheet('income')} />
      <RecurringList items={incomes} kind="income" />

      <Sheet visible={!!recSheet} onClose={() => setRecSheet(null)} title={recSheet === 'income' ? t('recurringIncomes') : t('fixedExpenses')}>
        <Field label={t('name')} value={recName} onChangeText={setRecName} autoFocus maxLength={40} />
        <View style={{ flexDirection: 'row' }}>
          <Field label={t('amount')} value={recAmount} onChangeText={setRecAmount} keyboardType="decimal-pad" style={{ flex: 1, marginRight: 10 }} />
          <Field label={t('dayOfMonth')} value={recDay} onChangeText={setRecDay} keyboardType="number-pad" maxLength={2} style={{ flex: 1 }} />
        </View>
        <Button title={t('save')} onPress={saveRecurring} loading={busy} />
      </Sheet>

      <Sheet visible={limitSheet} onClose={() => setLimitSheet(false)} title={t('newPlan')}>
        <Label>{t('pickCategory')}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.l }}>
          {activeCategories.map((c) => (
            <Chip key={c.id} icon={c.icon} label={c.name} color={c.color} active={limitCat === c.id} onPress={() => setLimitCat(c.id)} />
          ))}
        </View>
        <Field label={t('limit')} value={limitValue} onChangeText={setLimitValue} keyboardType="decimal-pad" placeholder="0,00" />
        <Button title={t('save')} onPress={saveLimit} loading={busy} />
      </Sheet>
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  cap: { ...theme.font.caption, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  margin: { ...theme.font.amountXL, fontSize: 34, marginTop: 4 },
  sum: { ...theme.font.h2, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.m },
  rowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: theme.spacing.m },
  rowName: { ...theme.font.body, color: theme.colors.text, fontWeight: '700' },
  rowSub: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: 2 },
  rowAmount: { ...theme.font.body, fontWeight: '800' },
  limitHead: { flexDirection: 'row', alignItems: 'center' },
  empty: { ...theme.font.small, color: theme.colors.textSecondary, textAlign: 'center' },
});
