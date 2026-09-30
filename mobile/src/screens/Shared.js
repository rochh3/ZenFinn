import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { t } from '../config/i18n';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../components/Card';

export const SharedScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { language, user, addTransaction } = useApp();

  const [groups, setGroups] = useState([
    { id: '1', name: 'Pareja', members: ['Alberto', 'Mora'], expenses: [] }
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('Alberto, Mora');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePayer, setNewExpensePayer] = useState('');

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const members = newGroupMembers.split(',').map(m => m.trim()).filter(m => m);
    if (members.length < 2) {
      Alert.alert('Error', 'Debe haber al menos 2 miembros');
      return;
    }
    if (!members.includes('Tú') && members.length < 2) members.unshift('Tú');
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      members,
      expenses: []
    };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupMembers('Alberto, Mora');
  };

  const handleDeleteGroup = () => {
    Alert.alert('Borrar Cuenta', '¿Estás seguro de que quieres borrar esta cuenta compartida?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => {
          setGroups(groups.filter(g => g.id !== selectedGroup.id));
          setSelectedGroup(null);
      }}
    ]);
  };

  const _addExpenseToGroup = (group, title, amount, payer, isTransfer = false, receiver = null) => {
    const updatedGroup = {
      ...group,
      expenses: [...group.expenses, { id: Date.now().toString() + Math.random(), title, amount, payer, isTransfer, receiver }]
    };
    setGroups(prev => prev.map(g => g.id === group.id ? updatedGroup : g));
    setSelectedGroup(updatedGroup);
  };

  const handleAddExpense = () => {
    if (!newExpenseTitle.trim() || !newExpenseAmount.trim()) return;
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return;
    const payer = newExpensePayer || selectedGroup.members[0];

    _addExpenseToGroup(selectedGroup, newExpenseTitle, amount, payer, false, null);

    if (payer === 'Tú') {
      addTransaction({ amount, type: 'expense', note: `Comp: ${newExpenseTitle}`, category: 'Otros' });
    }

    setNewExpenseTitle('');
    setNewExpenseAmount('');
    Alert.alert('Gasto Añadido', `Has añadido ${amount}€ pagado por ${payer}.`);
  };

  const handleSettleDebt = (debt) => {
    Alert.alert('Saldar deuda', `¿Marcar como pagado (Bizum/Efectivo) los ${debt.amount.toFixed(2)}€ que ${debt.from} debe a ${debt.to}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Saldar', onPress: () => {
          _addExpenseToGroup(selectedGroup, `Pago de ${debt.from} a ${debt.to}`, debt.amount, debt.from, true, debt.to);
          
          if (debt.from === 'Tú') {
            addTransaction({ amount: debt.amount, type: 'expense', note: `Bizum a ${debt.to}`, category: 'Otros' });
          } else if (debt.to === 'Tú') {
            addTransaction({ amount: debt.amount, type: 'income', note: `Bizum de ${debt.from}`, category: 'Otros' });
          }
      }}
    ]);
  };

  const calculateDebts = (group) => {
    if (!group || group.expenses.length === 0) return [];
    
    const normalExpenses = group.expenses.filter(e => !e.isTransfer);
    const totalSpent = normalExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const splitAmount = group.members.length > 0 ? totalSpent / group.members.length : 0;

    // Calculate balances
    const balances = group.members.map(member => {
      const paidNormal = normalExpenses.filter(e => e.payer === member).reduce((acc, e) => acc + e.amount, 0);
      const paidTransfers = group.expenses.filter(e => e.isTransfer && e.payer === member).reduce((acc, e) => acc + e.amount, 0);
      const receivedTransfers = group.expenses.filter(e => e.isTransfer && e.receiver === member).reduce((acc, e) => acc + e.amount, 0);
      
      const balance = paidNormal - splitAmount + paidTransfers - receivedTransfers;
      return { member, balance };
    });

    const debts = [];
    const debtors = balances.filter(b => b.balance < -0.01).sort((a,b) => a.balance - b.balance);
    const creditors = balances.filter(b => b.balance > 0.01).sort((a,b) => b.balance - a.balance);
    
    let i = 0; let j = 0;
    while(i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.balance, creditor.balance);
      
      debts.push({ from: debtor.member, to: creditor.member, amount });
      
      debtor.balance += amount;
      creditor.balance -= amount;
      
      if (debtor.balance >= -0.01) i++;
      if (creditor.balance <= 0.01) j++;
    }
    return debts;
  };

  if (selectedGroup) {
    const debts = calculateDebts(selectedGroup);

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedGroup(null)}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleDeleteGroup}>
            <Text style={[styles.backText, { color: theme.colors.danger }]}>Borrar Cuenta</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.header}>{selectedGroup.name.toUpperCase()}</Text>
        
        <View style={styles.debtsBox}>
          <Text style={styles.sectionTitle}>CÓMO AJUSTAR CUENTAS</Text>
          {debts.length === 0 ? (
            <Text style={styles.debtText}>Todo está saldado ✨</Text>
          ) : (
            debts.map((d, i) => (
              <View key={i} style={styles.debtRow}>
                <Text style={styles.debtText}>
                  <Text style={{ fontWeight: 'bold' }}>{d.from}</Text> debe a <Text style={{ fontWeight: 'bold' }}>{d.to}</Text> {d.amount.toFixed(2)}€
                </Text>
                <TouchableOpacity style={styles.settleButton} onPress={() => handleSettleDebt(d)}>
                  <Text style={styles.settleText}>Saldar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>NUEVO GASTO</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Concepto (ej. Cena)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newExpenseTitle}
            onChangeText={setNewExpenseTitle}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 10 }]}
            placeholder="30.00"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            value={newExpenseAmount}
            onChangeText={setNewExpenseAmount}
          />
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 5 }}>¿Quién pagó?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedGroup.members.map(m => (
              <TouchableOpacity 
                key={m} 
                style={[styles.memberPill, (newExpensePayer || selectedGroup.members[0]) === m && styles.memberPillActive]}
                onPress={() => setNewExpensePayer(m)}
              >
                <Text style={[(newExpensePayer || selectedGroup.members[0]) === m ? { color: theme.colors.background } : { color: theme.colors.text }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Text style={styles.addText}>AÑADIR GASTO</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>HISTORIAL DE GASTOS</Text>
        <FlatList
          data={selectedGroup.expenses.slice().reverse()}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => (
            <Card style={styles.expenseCard}>
              <View>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expensePayer}>Pagado por: {item.payer}</Text>
              </View>
              <Text style={styles.expenseAmount}>{item.amount.toFixed(2)}€</Text>
            </Card>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('sharedGroups', language)}</Text>
      
      <View style={styles.createGroupCard}>
        <Text style={styles.sectionTitle}>{t('newGroup', language).toUpperCase()}</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la cuenta (ej. Pareja)"
          placeholderTextColor={theme.colors.textSecondary}
          value={newGroupName}
          onChangeText={setNewGroupName}
        />
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 5 }}>Miembros (separados por coma):</Text>
          <TextInput
            style={styles.input}
            placeholder="Alberto, Mora"
            placeholderTextColor={theme.colors.textSecondary}
            value={newGroupMembers}
            onChangeText={setNewGroupMembers}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateGroup}>
          <Text style={styles.addText}>CREAR CUENTA</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
            <TouchableOpacity onPress={() => setSelectedGroup(item)}>
              <Card style={styles.groupCard}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupMeta}>{item.members.length} personas • {item.expenses.length} gastos</Text>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l },
  header: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxl, marginBottom: theme.spacing.m, textAlign: 'center', letterSpacing: 4 },
  subtext: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl },
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 2, marginBottom: theme.spacing.m },
  
  createGroupCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border },
  input: { backgroundColor: theme.colors.background, color: theme.colors.text, padding: 12, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border, marginTop: 8 },
  inputRow: { flexDirection: 'row', marginBottom: 10 },
  addButton: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: theme.borderRadius.m, alignItems: 'center', marginTop: 15 },
  addText: { ...theme.typography.caption, color: theme.colors.background, fontWeight: '700' },

  groupCard: { padding: theme.spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupName: { ...theme.typography.h2, color: theme.colors.text },
  groupMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },

  backButton: { marginTop: theme.spacing.xl, marginBottom: 10 },
  backText: { color: theme.colors.primary, ...theme.typography.body },
  
  debtsBox: { backgroundColor: theme.colors.surface, padding: 15, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.primary + '55' },
  debtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  debtText: { ...theme.typography.body, color: theme.colors.text, flex: 1 },
  settleButton: { backgroundColor: theme.colors.success + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.s, borderWidth: 1, borderColor: theme.colors.success },
  settleText: { ...theme.typography.caption, color: theme.colors.success, fontWeight: 'bold' },
  memberPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, marginRight: 10, backgroundColor: theme.colors.surface },
  memberPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },

  expenseCard: { padding: theme.spacing.m, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseTitle: { ...theme.typography.body, color: theme.colors.text },
  expensePayer: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
  expenseAmount: { ...theme.typography.h2, color: theme.colors.danger },
});
