import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Lazy import Supabase to avoid crashing if there are init errors
let supabase = null;
try {
  supabase = require('../config/supabase').supabase;
} catch (e) {
  console.warn('Supabase init failed, running in offline mode:', e.message);
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ─── Auth ────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);

  // ─── Local state ─────────────────────────────────
  const MOCK_CATEGORIES = [
    { id: '1', name: 'Alimentación', icon: '🛒', color: '#FF6B6B' },
    { id: '2', name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
    { id: '3', name: 'Ocio', icon: '🍻', color: '#FFE66D' },
    { id: '4', name: 'Sueldo', icon: '💰', color: '#68B0AB' },
    { id: '5', name: 'Otros', icon: '📦', color: '#C7CEEA' }
  ];

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [recurringIncomes, setRecurringIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // profile info (name etc.)
  const [language, setLanguage] = useState('es');

  // ─── Load from local storage ────────
  useEffect(() => {
    if (!currentUser) return;
    const init = async () => {
      await loadAllData();
    };
    init();
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const keyPrefix = `zenfin_${currentUser.id}_`;
      const txsStr = await AsyncStorage.getItem(`${keyPrefix}txs`);
      const catsStr = await AsyncStorage.getItem(`${keyPrefix}cats`);
      const fixedStr = await AsyncStorage.getItem(`${keyPrefix}fixed`);
      const recStr = await AsyncStorage.getItem(`${keyPrefix}rec`);
      const bgsStr = await AsyncStorage.getItem(`${keyPrefix}bgs`);
      
      if (txsStr) setTransactions(JSON.parse(txsStr));
      else setTransactions([]);

      if (catsStr) setCategories(JSON.parse(catsStr));
      else setCategories(MOCK_CATEGORIES);

      if (fixedStr) setFixedExpenses(JSON.parse(fixedStr));
      if (recStr) setRecurringIncomes(JSON.parse(recStr));
      if (bgsStr) setBudgets(JSON.parse(bgsStr));
      
    } catch (e) {
      console.warn('Error loading local data:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const save = async () => {
      const keyPrefix = `zenfin_${currentUser.id}_`;
      try {
        await AsyncStorage.setItem(`${keyPrefix}txs`, JSON.stringify(transactions));
        await AsyncStorage.setItem(`${keyPrefix}cats`, JSON.stringify(categories));
        await AsyncStorage.setItem(`${keyPrefix}fixed`, JSON.stringify(fixedExpenses));
        await AsyncStorage.setItem(`${keyPrefix}rec`, JSON.stringify(recurringIncomes));
        await AsyncStorage.setItem(`${keyPrefix}bgs`, JSON.stringify(budgets));
      } catch (e) { console.warn(e); }
    };
    // Debounce or just save directly since the app is small
    save();
  }, [transactions, categories, fixedExpenses, recurringIncomes, budgets, currentUser]);

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // ─── Transactions ────────────────────────────────
  const addTransaction = async (tx) => {
    // Si viene date (ej: YYYY-MM-DD desde la IA), la usamos. Si no, usamos hoy.
    const isoDateString = tx.date ? new Date(tx.date).toISOString() : new Date().toISOString();
    const dateDisplay = formatDateDisplay(isoDateString);

    const newTx = {
      ...tx,
      id: Date.now().toString(),
      date: dateDisplay,
    };
    setTransactions(prev => [newTx, ...prev]);

    if (!supabase) return;
    try {
      const cat = categories.find(c => c.name === tx.category);
      await supabase.from('transactions').insert([{
        user_id: currentUser?.id,
        category_id: cat?.id || null,
        amount: tx.amount,
        transaction_type: tx.type,
        recurrence_type: 'variable',
        date: isoDateString.split('T')[0],
        note: tx.note || '',
        source: 'app',
      }]);
    } catch (e) {
      console.warn('Error saving transaction:', e.message);
    }
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (!supabase) return;
    try {
      await supabase.from('transactions').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting transaction:', e.message);
    }
  };

  // ─── Categories ──────────────────────────────────
  const addCategory = async (cat) => {
    const newCat = { ...cat, id: cat.id || Date.now().toString() };
    setCategories(prev => [...prev, newCat]);

    if (!supabase) return;
    try {
      await supabase.from('categories').insert([{
        name: cat.name,
        icon_name: cat.icon,
        color: cat.color,
        is_active: true,
      }]);
    } catch (e) {
      console.warn('Error saving category:', e.message);
    }
  };

  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

  // ─── Fixed Expenses ──────────────────────────────
  const addFixedExpense = (exp) =>
    setFixedExpenses(prev => [...prev, { ...exp, id: exp.id || Date.now().toString() }]);
  const deleteFixedExpense = (id) => setFixedExpenses(prev => prev.filter(e => e.id !== id));

  // ─── Recurring Incomes ───────────────────────────
  const addRecurringIncome = (inc) =>
    setRecurringIncomes(prev => [...prev, { ...inc, id: inc.id || Date.now().toString() }]);
  const deleteRecurringIncome = (id) => setRecurringIncomes(prev => prev.filter(i => i.id !== id));

  // ─── Budgets ─────────────────────────────────────
  const addBudget = (budget) =>
    setBudgets(prev => [...prev, { ...budget, id: Date.now().toString() }]);
  const deleteBudget = (id) => setBudgets(prev => prev.filter(b => b.id !== id));

  // ─── Balance ─────────────────────────────────────
  const balance = transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
  }, 0);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      user, setUser,
      transactions, addTransaction, deleteTransaction,
      categories, addCategory, deleteCategory,
      fixedExpenses, addFixedExpense, deleteFixedExpense,
      recurringIncomes, addRecurringIncome, deleteRecurringIncome,
      budgets, addBudget, deleteBudget,
      balance, loading, loadAllData,
      language, setLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
