import React, { useCallback, useMemo, useState } from 'react';
import { DataContext } from './DataContext';
import { toISODate } from '../utils/format';

// Datos de ejemplo en memoria para probar la app sin cuenta. Nada se guarda ni se envía.
const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toISODate(d); };
let seq = 100;
const uid = () => `demo-${seq++}`;

const seed = () => ({
  categories: [
    { id: 'c1', name: 'Alimentación', icon: '🛒', color: '#10B981', isActive: true },
    { id: 'c2', name: 'Restaurantes', icon: '🍽️', color: '#F59E0B', isActive: true },
    { id: 'c3', name: 'Transporte', icon: '🚗', color: '#3B82F6', isActive: true },
    { id: 'c4', name: 'Ocio', icon: '🎟️', color: '#EC4899', isActive: true },
    { id: 'c5', name: 'Hogar', icon: '🏠', color: '#8B5CF6', isActive: true },
    { id: 'c6', name: 'Sueldo', icon: '💰', color: '#84CC16', isActive: true },
  ],
  transactions: [
    { id: 't1', amount: 45.5, type: 'expense', note: 'Cena con amigos', categoryId: 'c2', date: day(0) },
    { id: 't2', amount: 74.2, type: 'expense', note: 'Supermercado', categoryId: 'c1', date: day(0) },
    { id: 't3', amount: 2100, type: 'income', note: 'Nómina', categoryId: 'c6', date: day(1) },
    { id: 't4', amount: 38, type: 'expense', note: 'Gasolina', categoryId: 'c3', date: day(2) },
    { id: 't5', amount: 12.9, type: 'expense', note: 'Cine', categoryId: 'c4', date: day(3) },
    { id: 't6', amount: 750, type: 'expense', note: 'Alquiler', categoryId: 'c5', date: day(4) },
    { id: 't7', amount: 29.9, type: 'expense', note: 'Compra semanal', categoryId: 'c1', date: day(6) },
    { id: 't8', amount: 18, type: 'expense', note: 'Pizzas', categoryId: 'c2', date: day(8) },
    { id: 't9', amount: 60, type: 'expense', note: 'Concierto', categoryId: 'c4', date: day(12) },
    { id: 't10', amount: 2100, type: 'income', note: 'Nómina mes anterior', categoryId: 'c6', date: day(33) },
    { id: 't11', amount: 210, type: 'expense', note: 'Compra mensual', categoryId: 'c1', date: day(35) },
  ],
  budgets: [{ id: 'b1', categoryId: 'c1', limit: 300 }, { id: 'b2', categoryId: 'c4', limit: 60 }],
  recurring: [
    { id: 'r1', kind: 'expense', name: 'Alquiler', amount: 750, day: 1 },
    { id: 'r2', kind: 'expense', name: 'Internet', amount: 39.9, day: 5 },
    { id: 'r3', kind: 'income', name: 'Nómina', amount: 2100, day: 28 },
  ],
  groups: [{
    id: 'g1', name: 'Pareja', inviteCode: 'DEMO1234',
    members: [{ id: 'demo', name: 'Demo' }, { id: 'partner', name: 'Mora' }],
    expenses: [
      { id: 'e1', title: 'Cena', amount: 60, payerId: 'demo', receiverId: null, isTransfer: false, date: day(1), createdAt: '2' },
      { id: 'e2', title: 'Compra', amount: 90, payerId: 'partner', receiverId: null, isTransfer: false, date: day(3), createdAt: '1' },
    ],
  }],
});

export const DemoDataProvider = ({ children }) => {
  const [data, setData] = useState(seed);
  const set = useCallback((key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) })), []);

  const api = useMemo(() => ({
    reload: async () => {}, findLegacy: async () => [], importLegacy: async () => 0,
    addTransaction: async (tx) => { const row = { id: uid(), amount: tx.amount, type: tx.type, note: tx.note || '', categoryId: tx.categoryId || null, date: tx.date }; set('transactions', (l) => [row, ...l].sort((a, b) => b.date.localeCompare(a.date))); return row; },
    updateTransaction: async (id, tx) => set('transactions', (l) => l.map((x) => (x.id === id ? { ...x, ...tx } : x)).sort((a, b) => b.date.localeCompare(a.date))),
    deleteTransaction: async (id) => set('transactions', (l) => l.filter((x) => x.id !== id)),
    addCategory: async (c) => { const row = { ...c, id: uid(), isActive: true }; set('categories', (l) => [...l, row]); return row; },
    addCategories: async (cs) => { const rows = cs.map((c) => ({ ...c, id: uid(), isActive: true })); set('categories', (l) => [...l, ...rows]); return rows; },
    updateCategory: async (id, c) => set('categories', (l) => l.map((x) => (x.id === id ? { ...x, ...c } : x))),
    archiveCategory: async (id) => { set('categories', (l) => l.map((x) => (x.id === id ? { ...x, isActive: false } : x))); set('budgets', (l) => l.filter((b) => b.categoryId !== id)); },
    setBudget: async (categoryId, limit) => set('budgets', (l) => [...l.filter((b) => b.categoryId !== categoryId), { id: uid(), categoryId, limit }]),
    deleteBudget: async (id) => set('budgets', (l) => l.filter((b) => b.id !== id)),
    addRecurring: async (i) => set('recurring', (l) => [...l, { ...i, id: uid() }]),
    addRecurringMany: async (is) => set('recurring', (l) => [...l, ...is.map((i) => ({ ...i, id: uid() }))]),
    deleteRecurring: async (id) => set('recurring', (l) => l.filter((x) => x.id !== id)),
    createGroup: async (name) => set('groups', (l) => [...l, { id: uid(), name, inviteCode: 'DEMO' + Math.floor(1000 + Math.random() * 9000), members: [{ id: 'demo', name: 'Demo' }], expenses: [] }]),
    joinGroup: async () => { throw new Error('invalid code'); },
    leaveGroup: async (id) => set('groups', (l) => l.filter((g) => g.id !== id)),
    addSharedExpense: async (groupId, e) => set('groups', (l) => l.map((g) => (g.id !== groupId ? g : {
      ...g, expenses: [{ id: uid(), title: e.title, amount: e.amount, payerId: e.payerId, receiverId: e.receiverId || null, isTransfer: !!e.isTransfer, date: e.date, createdAt: String(seq) }, ...g.expenses],
    }))),
    deleteSharedExpense: async (id) => set('groups', (l) => l.map((g) => ({ ...g, expenses: g.expenses.filter((x) => x.id !== id) }))),
  }), [set]);

  const value = useMemo(() => {
    const activeCategories = data.categories.filter((c) => c.isActive);
    return {
      ...data, ...api, activeCategories, categoriesById: Object.fromEntries(data.categories.map((c) => [c.id, c])),
      loading: false, offline: false,
    };
  }, [data, api]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
