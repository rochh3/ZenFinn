import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Share, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert } from '../utils/alert';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Screen, Card, Button, Field, Chip, Label, SectionHeader, EmptyState, Avatar, Icon } from '../components/ui';
import { computeDebts } from '../utils/finance';
import { formatMoney, parseAmount, todayISO, friendlyDate } from '../utils/format';

export const SharedGroupScreen = ({ navigation, route }) => {
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { user } = useAuth();
  const { groups, addSharedExpense, deleteSharedExpense, leaveGroup, addTransaction } = useData();
  const group = groups.find((g) => g.id === route.params.groupId);
  const myId = user.id;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(myId);
  const [alsoRecord, setAlsoRecord] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (group) navigation.setOptions({ title: group.name }); }, [group?.name, navigation]);
  useEffect(() => { if (!group) navigation.goBack(); }, [group, navigation]);

  const nameOf = useMemo(() => {
    const map = Object.fromEntries((group?.members || []).map((m) => [m.id, m.id === myId ? t('you') : m.name]));
    return (id) => map[id] || '—';
  }, [group, myId, t]);

  const debts = useMemo(() => (group ? computeDebts(group.members.map((m) => m.id), group.expenses) : []), [group]);

  if (!group) return null;

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (e) { Alert.alert(t('error'), e.message); } finally { setBusy(false); }
  };

  const addExpense = () => {
    const value = parseAmount(amount);
    if (!title.trim() || isNaN(value)) return Alert.alert(t('error'), t('required'));
    run(async () => {
      await addSharedExpense(group.id, { title: title.trim(), amount: value, payerId, date: todayISO() });
      if (payerId === myId && alsoRecord) await addTransaction({ amount: value, type: 'expense', note: title.trim(), categoryId: null, date: todayISO() });
      setTitle(''); setAmount('');
    });
  };

  const settle = (d) =>
    Alert.alert(t('settle'), t('settleMsg', { amount: formatMoney(d.amount, language), from: nameOf(d.from), to: nameOf(d.to) }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('settle'),
        onPress: () => run(async () => {
          await addSharedExpense(group.id, { title: t('transfer'), amount: d.amount, payerId: d.from, receiverId: d.to, isTransfer: true, date: todayISO() });
          // Si el pago me afecta, también queda reflejado en mis movimientos personales.
          if (d.from === myId) await addTransaction({ amount: d.amount, type: 'expense', note: `${t('transfer')} → ${nameOf(d.to)}`, categoryId: null, date: todayISO() });
          else if (d.to === myId) await addTransaction({ amount: d.amount, type: 'income', note: `${t('transfer')} ← ${nameOf(d.from)}`, categoryId: null, date: todayISO() });
        }),
      },
    ]);

  const remove = (e) =>
    Alert.alert(t('delete'), t('deleteTxMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => run(() => deleteSharedExpense(e.id)) },
    ]);

  const leave = () =>
    Alert.alert(t('leaveGroup'), t('leaveGroupMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('leaveGroup'), style: 'destructive', onPress: () => run(() => leaveGroup(group.id)) },
    ]);

  const shareCode = () => Share.share({ message: `ZenFin · ${group.name}\n${t('inviteCode')}: ${group.inviteCode}` });

  return (
    <Screen edges={[]}>
      <Card style={styles.inviteCard} tone="alt">
        <View style={{ flex: 1 }}>
          <Text style={styles.cap}>{t('inviteCode')}</Text>
          <Text style={styles.code}>{group.inviteCode}</Text>
        </View>
        <Button title={t('inviteShare')} icon="share-outline" variant="secondary" small onPress={shareCode} />
      </Card>

      <View style={styles.members}>
        {group.members.map((m, i) => (
          <View key={m.id} style={styles.member}>
            <Avatar name={m.name} size={40} color={theme.colors.chart[i % theme.colors.chart.length]} />
            <Text style={styles.memberName} numberOfLines={1}>{m.id === myId ? t('you') : m.name}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title={t('settleUp')} style={{ marginTop: theme.spacing.l }} />
      <Card>
        {debts.length === 0 ? (
          <Text style={styles.settled}>{t('allSettled')}</Text>
        ) : (
          debts.map((d, i) => (
            <View key={i} style={[styles.debtRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
              <Text style={styles.debtText}>
                <Text style={styles.bold}>{nameOf(d.from)}</Text> {t('owes')} <Text style={styles.bold}>{nameOf(d.to)}</Text>
              </Text>
              <Text style={[styles.bold, { color: theme.colors.danger, marginRight: 10 }]}>{formatMoney(d.amount, language)}</Text>
              <Button title={t('settle')} small variant="secondary" onPress={() => settle(d)} />
            </View>
          ))
        )}
      </Card>

      <SectionHeader title={t('newSharedExpense')} />
      <Card>
        <Field label={t('concept')} value={title} onChangeText={setTitle} maxLength={60} />
        <Field label={t('amount')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" />
        <Label>{t('whoPaid')}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {group.members.map((m) => <Chip key={m.id} label={m.id === myId ? t('you') : m.name} active={payerId === m.id} onPress={() => setPayerId(m.id)} />)}
        </View>
        {payerId === myId && (
          <TouchableOpacity style={styles.toggle} onPress={() => setAlsoRecord(!alsoRecord)} activeOpacity={0.7}>
            <Icon name={alsoRecord ? 'checkbox' : 'square-outline'} size={22} color={theme.colors.primary} />
            <Text style={styles.toggleText}>{t('alsoRecord')}</Text>
          </TouchableOpacity>
        )}
        <Button title={t('add')} icon="add" onPress={addExpense} loading={busy} style={{ marginTop: theme.spacing.m }} />
      </Card>

      <SectionHeader title={t('history')} />
      {group.expenses.length === 0 ? (
        <Card><EmptyState icon="receipt-outline" title={t('noSharedExpenses')} /></Card>
      ) : (
        <Card style={{ paddingVertical: theme.spacing.xs }}>
          {group.expenses.map((e, i) => (
            <TouchableOpacity key={e.id} onLongPress={() => remove(e)} activeOpacity={0.8} style={[styles.expRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
              <View style={[styles.expIcon, { backgroundColor: (e.isTransfer ? theme.colors.success : theme.colors.primary) + '26' }]}>
                <Icon name={e.isTransfer ? 'swap-horizontal' : 'receipt-outline'} size={18} color={e.isTransfer ? theme.colors.success : theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.expTitle} numberOfLines={1}>{e.isTransfer ? `${nameOf(e.payerId)} → ${nameOf(e.receiverId)}` : e.title}</Text>
                <Text style={styles.expSub}>{e.isTransfer ? t('transfer') : nameOf(e.payerId)} · {friendlyDate(e.date, t, language)}</Text>
              </View>
              <Text style={styles.expAmount}>{formatMoney(e.amount, language)}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <Button title={t('leaveGroup')} variant="danger" onPress={leave} style={{ marginTop: theme.spacing.xl }} />
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  inviteCard: { flexDirection: 'row', alignItems: 'center' },
  cap: { ...theme.font.caption, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  code: { ...theme.font.h1, fontSize: 19, color: theme.colors.text, letterSpacing: 2, marginTop: 4 },
  members: { flexDirection: 'row', marginTop: theme.spacing.l },
  member: { alignItems: 'center', marginRight: theme.spacing.l, width: 64 },
  memberName: { ...theme.font.small, color: theme.colors.text, marginTop: 6 },
  settled: { ...theme.font.body, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.s },
  debtRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.m },
  debtText: { ...theme.font.body, color: theme.colors.text, flex: 1 },
  bold: { fontWeight: '800', color: theme.colors.text },
  toggle: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.s },
  toggleText: { ...theme.font.small, color: theme.colors.text, marginLeft: 8, flex: 1 },
  expRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.m },
  expIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.m },
  expTitle: { ...theme.font.body, color: theme.colors.text, fontWeight: '600' },
  expSub: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: 2 },
  expAmount: { ...theme.font.body, color: theme.colors.text, fontWeight: '800' },
});
