import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

export const BudgetsScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const {
    fixedExpenses, addFixedExpense, deleteFixedExpense,
    recurringIncomes, addRecurringIncome, deleteRecurringIncome,
    budgets, addBudget, deleteBudget,
    categories, transactions,
  } = useApp();

  const [fixedModal, setFixedModal] = useState(false);
  const [incomeModal, setIncomeModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);

  const [newExpName, setNewExpName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpFreq, setNewExpFreq] = useState('');
  const [newExpDay, setNewExpDay] = useState('');

  const [newIncName, setNewIncName] = useState('');
  const [newIncAmount, setNewIncAmount] = useState('');
  const [newIncFreq, setNewIncFreq] = useState('');
  const [newIncDay, setNewIncDay] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetLimit, setBudgetLimit] = useState('');

  const handleAddFixed = () => {
    if (!newExpName.trim() || !newExpAmount) { Alert.alert('Error', 'Rellena todos los campos'); return; }
    addFixedExpense({ 
      name: newExpName.trim().toUpperCase(), 
      amount: parseFloat(newExpAmount),
      frequency: newExpFreq || 'Mensual',
      day: newExpDay || '1'
    });
    setNewExpName(''); setNewExpAmount(''); setNewExpFreq(''); setNewExpDay('');
    setFixedModal(false);
  };

  const handleAddIncome = () => {
    if (!newIncName.trim() || !newIncAmount) { Alert.alert('Error', 'Rellena todos los campos'); return; }
    addRecurringIncome({ 
      name: newIncName.trim().toUpperCase(), 
      amount: parseFloat(newIncAmount),
      frequency: newIncFreq || 'Mensual',
      day: newIncDay || '1'
    });
    setNewIncName(''); setNewIncAmount(''); setNewIncFreq(''); setNewIncDay('');
    setIncomeModal(false);
  };

  const handleAddBudget = () => {
    if (!selectedCategory || !budgetLimit) { Alert.alert('Error', 'Selecciona categoría y límite'); return; }
    addBudget({ category: selectedCategory.name, color: selectedCategory.color, limit: parseFloat(budgetLimit) });
    setSelectedCategory(null); setBudgetLimit('');
    setBudgetModal(false);
  };

  const getSpent = (categoryName) => {
    return transactions
      .filter(tx => tx.type === 'expense' && tx.category === categoryName)
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
  };

  const totalFixed = fixedExpenses.reduce((a, e) => a + e.amount, 0);
  const totalIncome = recurringIncomes.reduce((a, i) => a + i.amount, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>PLANES Y LÍMITES</Text>

      {/* ── Summary Cards ── */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderTopColor: theme.colors.danger }]}>
          <Text style={styles.summaryLabel}>GASTOS FIJOS</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.danger }]}>
            -{totalFixed.toFixed(2)} €
          </Text>
          <Text style={styles.summaryCaption}>/ mes</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: theme.colors.success }]}>
          <Text style={styles.summaryLabel}>INGRESOS FIJOS</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
            +{totalIncome.toFixed(2)} €
          </Text>
          <Text style={styles.summaryCaption}>/ mes</Text>
        </View>
      </View>

      {/* Balance mensual estimado */}
      <View style={styles.balanceBar}>
        <Text style={styles.balanceBarLabel}>MARGEN MENSUAL ESTIMADO</Text>
        <Text style={[styles.balanceBarAmount, { color: (totalIncome - totalFixed) >= 0 ? theme.colors.success : theme.colors.danger }]}>
          {(totalIncome - totalFixed) >= 0 ? '+' : ''}{(totalIncome - totalFixed).toFixed(2)} €
        </Text>
      </View>

      {/* ── GASTOS FIJOS ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>GASTOS FIJOS MENSUALES</Text>
        <TouchableOpacity onPress={() => setFixedModal(true)}>
          <Text style={styles.addBtn}>+ AÑADIR</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {fixedExpenses.length === 0 ? (
          <Text style={styles.emptyText}>Sin gastos fijos registrados</Text>
        ) : fixedExpenses.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(index * 50)} style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowDot, { backgroundColor: theme.colors.danger }]} />
              <View>
                <Text style={styles.rowName}>{item.name}</Text>
                {item.frequency && <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>{item.frequency}, día {item.day}</Text>}
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowAmount}>{item.amount.toFixed(2)} €</Text>
              <TouchableOpacity onPress={() => deleteFixedExpense(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* ── INGRESOS RECURRENTES ── */}
      <View style={[styles.sectionHeaderRow, { marginTop: theme.spacing.xl }]}>
        <Text style={styles.sectionTitle}>INGRESOS RECURRENTES</Text>
        <TouchableOpacity onPress={() => setIncomeModal(true)}>
          <Text style={[styles.addBtn, { color: theme.colors.success }]}>+ AÑADIR</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {recurringIncomes.length === 0 ? (
          <Text style={styles.emptyText}>Sin ingresos recurrentes registrados</Text>
        ) : recurringIncomes.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(index * 50)} style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowDot, { backgroundColor: theme.colors.success }]} />
              <View>
                <Text style={styles.rowName}>{item.name}</Text>
                {item.frequency && <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>{item.frequency}, día {item.day}</Text>}
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowAmount, { color: theme.colors.success }]}>+{item.amount.toFixed(2)} €</Text>
              <TouchableOpacity onPress={() => deleteRecurringIncome(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* ── LÍMITES POR CATEGORÍA ── */}
      <View style={[styles.sectionHeaderRow, { marginTop: theme.spacing.xl }]}>
        <Text style={styles.sectionTitle}>LÍMITES POR CATEGORÍA</Text>
        <TouchableOpacity onPress={() => setBudgetModal(true)}>
          <Text style={styles.addBtn}>+ NUEVO PLAN</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {budgets.length === 0 ? (
          <Text style={styles.emptyText}>Sin planes de gasto configurados</Text>
        ) : budgets.map((plan, index) => {
          const spent = getSpent(plan.category);
          const pct = Math.min((spent / plan.limit) * 100, 100);
          const isWarn = pct > 85;
          return (
            <Animated.View key={plan.id} entering={FadeInUp.delay(index * 100)} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planCategory}>{plan.category}</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Text style={styles.planFractions}>{spent.toFixed(0)} / {plan.limit} €</Text>
                  <TouchableOpacity onPress={() => deleteBudget(plan.id)}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: isWarn ? theme.colors.danger : plan.color }]} />
              </View>
              <Text style={styles.planLeft}>Te quedan {(plan.limit - spent).toFixed(2)} € este mes</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* ─── MODALES ─── */}

      {/* Modal gasto fijo */}
      <Modal visible={fixedModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NUEVO GASTO FIJO</Text>
            <TextInput style={styles.modalInput} placeholder="Nombre (ej. Alquiler)" placeholderTextColor={theme.colors.textSecondary} value={newExpName} onChangeText={setNewExpName} />
            <TextInput style={styles.modalInput} placeholder="Importe mensual" placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" value={newExpAmount} onChangeText={setNewExpAmount} />
            
            <View style={{ marginBottom: theme.spacing.l }}>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 5 }}>Frecuencia</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                {['Mensual', 'Semanal'].map(f => (
                  <TouchableOpacity key={f} onPress={() => setNewExpFreq(f)} style={[styles.pill, newExpFreq === f && styles.pillActive]}>
                    <Text style={[styles.pillText, newExpFreq === f && styles.pillTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 5 }}>Día de cobro/pago</Text>
              {(newExpFreq || 'Mensual') === 'Semanal' ? (
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <TouchableOpacity key={d} onPress={() => setNewExpDay(d)} style={[styles.pill, newExpDay === d && styles.pillActive, { paddingHorizontal: 12 }]}>
                      <Text style={[styles.pillText, newExpDay === d && styles.pillTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput style={styles.modalInput} placeholder="Día del mes (1-31)" placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" maxLength={2} value={newExpDay} onChangeText={setNewExpDay} />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setFixedModal(false)}><Text style={styles.cancelBtnText}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddFixed}><Text style={styles.saveBtnText}>GUARDAR</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal ingreso recurrente */}
      <Modal visible={incomeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NUEVO INGRESO RECURRENTE</Text>
            <TextInput style={styles.modalInput} placeholder="Nombre (ej. Nómina, Alquiler cobrado)" placeholderTextColor={theme.colors.textSecondary} value={newIncName} onChangeText={setNewIncName} />
            <TextInput style={styles.modalInput} placeholder="Importe mensual" placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" value={newIncAmount} onChangeText={setNewIncAmount} />
            
            <View style={{ marginBottom: theme.spacing.l }}>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 5 }}>Frecuencia</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                {['Mensual', 'Semanal'].map(f => (
                  <TouchableOpacity key={f} onPress={() => setNewIncFreq(f)} style={[styles.pill, newIncFreq === f && styles.pillActive]}>
                    <Text style={[styles.pillText, newIncFreq === f && styles.pillTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 5 }}>Día de cobro/pago</Text>
              {(newIncFreq || 'Mensual') === 'Semanal' ? (
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <TouchableOpacity key={d} onPress={() => setNewIncDay(d)} style={[styles.pill, newIncDay === d && styles.pillActive, { paddingHorizontal: 12 }]}>
                      <Text style={[styles.pillText, newIncDay === d && styles.pillTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput style={styles.modalInput} placeholder="Día del mes (1-31)" placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" maxLength={2} value={newIncDay} onChangeText={setNewIncDay} />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIncomeModal(false)}><Text style={styles.cancelBtnText}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.success }]} onPress={handleAddIncome}><Text style={styles.saveBtnText}>GUARDAR</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal plan */}
      <Modal visible={budgetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NUEVO LÍMITE</Text>
            {categories.length === 0 ? (
              <Text style={styles.emptyText}>Primero crea categorías</Text>
            ) : (
              <View style={{ gap: 8, marginBottom: theme.spacing.l }}>
                {categories.map(cat => (
                  <TouchableOpacity key={cat.id} style={[styles.catOption, selectedCategory?.id === cat.id && { borderColor: cat.color }]} onPress={() => setSelectedCategory(cat)}>
                    <Text style={{ color: theme.colors.text }}>{cat.icon} {cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput style={styles.modalInput} placeholder="Límite mensual (€)" placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" value={budgetLimit} onChangeText={setBudgetLimit} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBudgetModal(false)}><Text style={styles.cancelBtnText}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddBudget}><Text style={styles.saveBtnText}>GUARDAR</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l },
  header: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl, textAlign: 'center', letterSpacing: 4 },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.m, marginBottom: theme.spacing.m },
  summaryCard: { flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.m, padding: theme.spacing.m, borderTopWidth: 2 },
  summaryLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 4 },
  summaryAmount: { ...theme.typography.h2, fontWeight: '600' },
  summaryCaption: { ...theme.typography.caption, color: theme.colors.textSecondary, fontSize: 9, opacity: 0.6 },
  balanceBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.m, padding: theme.spacing.m, marginBottom: theme.spacing.xl },
  balanceBarLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  balanceBarAmount: { ...theme.typography.h2, fontWeight: '600' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m },
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 2 },
  addBtn: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },
  listContainer: { marginBottom: theme.spacing.l },
  emptyText: { ...theme.typography.caption, color: theme.colors.textSecondary, opacity: 0.5, paddingVertical: theme.spacing.m },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowDot: { width: 6, height: 6, borderRadius: 3 },
  rowName: { ...theme.typography.body, color: theme.colors.text },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowAmount: { ...theme.typography.body, fontWeight: '600', color: theme.colors.textSecondary },
  deleteBtn: { padding: 4 },
  deleteBtnText: { color: theme.colors.danger, fontSize: 14 },
  planCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.m },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.m, alignItems: 'center' },
  planCategory: { ...theme.typography.caption, color: theme.colors.text, letterSpacing: 1 },
  planFractions: { ...theme.typography.caption, color: theme.colors.textSecondary },
  progressTrack: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: theme.spacing.s },
  progressFill: { height: '100%', borderRadius: 2 },
  planLeft: { ...theme.typography.caption, fontSize: 10, color: theme.colors.textSecondary, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: theme.spacing.xl, paddingBottom: 40 },
  modalTitle: { ...theme.typography.caption, color: theme.colors.text, textAlign: 'center', letterSpacing: 3, marginBottom: theme.spacing.xl },
  modalInput: { ...theme.typography.body, color: theme.colors.text, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: theme.spacing.s, marginBottom: theme.spacing.l },
  catOption: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.m, padding: theme.spacing.m },
  modalButtons: { flexDirection: 'row', gap: theme.spacing.m },
  cancelBtn: { flex: 1, paddingVertical: theme.spacing.m, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.m },
  cancelBtnText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: theme.spacing.m, alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.m },
  saveBtnText: { ...theme.typography.caption, color: '#FFF', fontWeight: '600' },
  pill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  pillText: { ...theme.typography.caption, color: theme.colors.text },
  pillTextActive: { ...theme.typography.caption, color: '#FFF' },
});
