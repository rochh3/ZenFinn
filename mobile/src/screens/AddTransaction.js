import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Alert } from '../utils/alert';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useData } from '../context/DataContext';
import { Screen, Button, Chip, Label, Field, IconButton, Segmented, Icon, ConfirmSheet } from '../components/ui';
import { todayISO, addDays, friendlyDate, parseAmount } from '../utils/format';

export const AddTransaction = ({ navigation, route }) => {
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { transactions, activeCategories, categoriesById, addTransaction, updateTransaction, deleteTransaction } = useData();

  const editing = route.params?.txId ? transactions.find((x) => x.id === route.params.txId) : null;
  const [type, setType] = useState(editing?.type || route.params?.type || 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount).replace('.', ',') : '');
  const [note, setNote] = useState(editing?.note || '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId || null);
  const [date, setDate] = useState(editing?.date || todayISO());
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isIncome = type === 'income';
  const tint = isIncome ? theme.colors.success : theme.colors.danger;
  // Si la categoría del movimiento está archivada, se sigue mostrando para no perderla al editar.
  const options = editing?.categoryId && !activeCategories.some((c) => c.id === editing.categoryId) && categoriesById[editing.categoryId]
    ? [...activeCategories, categoriesById[editing.categoryId]] : activeCategories;

  const save = async () => {
    const value = parseAmount(amount);
    if (isNaN(value)) return Alert.alert(t('error'), t('invalidAmount'));
    setBusy(true);
    try {
      const payload = { amount: value, type, note: note.trim(), categoryId, date };
      if (editing) await updateTransaction(editing.id, payload);
      else await addTransaction(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert(t('error'), e.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    const id = editing?.id;
    if (!id) return;
    setBusy(true);
    try {
      await deleteTransaction(id);
      setConfirmOpen(false);
      navigation.goBack();
    } catch (e) {
      setBusy(false);
      setConfirmOpen(false);
      Alert.alert(t('error'), e.message);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>{editing ? t('editTransaction') : t('newTransaction')}</Text>
          <IconButton name="close" onPress={() => navigation.goBack()} />
        </View>

        <Segmented
          value={type}
          onChange={setType}
          options={[{ value: 'expense', label: t('expense') }, { value: 'income', label: t('income') }]}
        />

        <View style={styles.amountBox}>
          <TextInput
            style={[styles.amountInput, { color: tint }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
            autoFocus={!editing}
            selectionColor={tint}
            maxLength={12}
          />
          <Text style={[styles.currency, { color: tint }]}>€</Text>
        </View>

        <Label>{t('category')}</Label>
        {options.length === 0 ? (
          <Button title={t('createCategoryFirst')} variant="secondary" onPress={() => navigation.navigate('Main', { screen: 'More', params: { screen: 'Categories' } })} style={{ marginBottom: theme.spacing.l }} />
        ) : (
          <View style={styles.chips}>
            {options.map((c) => (
              <Chip key={c.id} icon={c.icon} label={c.name} color={c.color} active={categoryId === c.id} onPress={() => setCategoryId(categoryId === c.id ? null : c.id)} />
            ))}
          </View>
        )}

        <Label style={{ marginTop: theme.spacing.s }}>{t('date')}</Label>
        <View style={styles.dateRow}>
          <IconButton name="chevron-back" onPress={() => setDate(addDays(date, -1))} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.dateText}>{friendlyDate(date, t, language)}</Text>
            {date !== todayISO() && (
              <TouchableOpacity onPress={() => setDate(todayISO())}><Text style={styles.todayLink}>{t('today')}</Text></TouchableOpacity>
            )}
          </View>
          <IconButton name="chevron-forward" onPress={() => date < todayISO() && setDate(addDays(date, 1))} color={date >= todayISO() ? theme.colors.border : undefined} />
        </View>

        <Field label={t('note')} value={note} onChangeText={setNote} placeholder={t('notePlaceholder')} maxLength={80} style={{ marginTop: theme.spacing.xl }} />

        <Button title={t('saveTransaction')} onPress={save} loading={busy} />
        {editing && <Button title={t('delete')} variant="danger" icon="trash-outline" onPress={() => setConfirmOpen(true)} style={{ marginTop: theme.spacing.m }} />}
      </KeyboardAvoidingView>

      <ConfirmSheet
        visible={confirmOpen}
        title={t('deleteTxTitle')}
        message={t('deleteTxMsg')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.l },
  title: { ...theme.font.h1, color: theme.colors.text },
  amountBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl },
  amountInput: { ...theme.font.amountXL, fontSize: 52, minWidth: 80, textAlign: 'center', padding: 0 },
  currency: { ...theme.font.amountXL, fontSize: 40, marginLeft: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, borderRadius: theme.radius.m, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.s, minHeight: 56 },
  dateText: { ...theme.font.body, color: theme.colors.text, fontWeight: '700', textTransform: 'capitalize' },
  todayLink: { ...theme.font.caption, color: theme.colors.primary, marginTop: 2 },
});
