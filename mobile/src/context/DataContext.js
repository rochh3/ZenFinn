import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { legacyDateToISO } from '../utils/format';
import { DemoDataProvider } from './DemoData';

export const DataContext = createContext(null);

const EMPTY = { categories: [], transactions: [], budgets: [], recurring: [], groups: [] };
const TABLES = ['transactions', 'categories', 'budgets', 'recurring_items', 'shared_group_members', 'shared_expenses'];

// ─── Mapeo fila de BD -> objeto de la app ───────────────────────────────────
const mapCategory = (r) => ({ id: r.id, name: r.name, icon: r.icon, color: r.color, isActive: r.is_active });
const mapTx = (r) => ({
  id: r.id, amount: Number(r.amount), type: r.transaction_type, note: r.note || '',
  categoryId: r.category_id, date: r.date, source: r.source,
});
const mapBudget = (r) => ({ id: r.id, categoryId: r.category_id, limit: Number(r.limit_amount) });
const mapRecurring = (r) => ({ id: r.id, kind: r.kind, name: r.name, amount: Number(r.amount), frequency: r.frequency, day: r.day });
const mapExpense = (r) => ({
  id: r.id, title: r.title, amount: Number(r.amount), payerId: r.payer_id, receiverId: r.receiver_id,
  isTransfer: r.is_transfer, date: r.date, createdBy: r.created_by, createdAt: r.created_at,
});
const mapGroup = (r) => ({
  id: r.id, name: r.name, inviteCode: r.invite_code,
  members: (r.shared_group_members || []).map((m) => ({ id: m.user_id, name: m.users?.name || '—' })),
  expenses: (r.shared_expenses || []).map(mapExpense)
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt)),
});

const check = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const DataProvider = ({ children }) => {
  const { demo } = useAuth();
  return demo ? <DemoDataProvider>{children}</DemoDataProvider> : <SupabaseDataProvider>{children}</SupabaseDataProvider>;
};

const SupabaseDataProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const cacheKey = userId ? `zenfin_cache_v2_${userId}` : null;
  const reloadTimer = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!userId || !supabase) return;
    if (!silent) setLoading(true);
    try {
      const [cats, txs, bgs, rec, grp] = await Promise.all([
        supabase.from('categories').select('*').order('created_at').then(check),
        supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }).limit(5000).then(check),
        supabase.from('budgets').select('*').then(check),
        supabase.from('recurring_items').select('*').order('name').then(check),
        supabase.from('shared_groups')
          .select('id,name,invite_code,shared_group_members(user_id,users(id,name)),shared_expenses(*)')
          .order('created_at').then(check),
      ]);
      const next = {
        categories: cats.map(mapCategory), transactions: txs.map(mapTx), budgets: bgs.map(mapBudget),
        recurring: rec.map(mapRecurring), groups: grp.map(mapGroup),
      };
      setData(next);
      setOffline(false);
      AsyncStorage.setItem(cacheKey, JSON.stringify(next)).catch(() => {});
    } catch (e) {
      console.warn('No se pudieron cargar los datos:', e.message);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [userId, cacheKey]);

  // Al entrar: mostrar caché al instante y refrescar desde Supabase.
  useEffect(() => {
    if (!userId) { setData(EMPTY); return undefined; }
    let alive = true;
    AsyncStorage.getItem(cacheKey)
      .then((raw) => { if (alive && raw) setData({ ...EMPTY, ...JSON.parse(raw) }); })
      .catch(() => {})
      .finally(() => { if (alive) load(); });
    return () => { alive = false; };
  }, [userId, cacheKey, load]);

  // Tiempo real: cualquier cambio (hecho desde otro dispositivo) refresca los datos.
  useEffect(() => {
    if (!userId || !supabase) return undefined;
    const schedule = () => {
      clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => load(true), 500);
    };
    let channel = supabase.channel(`zenfin-sync-${userId}`);
    TABLES.forEach((table) => { channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, schedule); });
    channel.subscribe();
    const appSub = AppState.addEventListener('change', (s) => { if (s === 'active') load(true); });
    return () => {
      clearTimeout(reloadTimer.current);
      appSub.remove();
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  // ─── Índices derivados ────────────────────────────────────────────────────
  const categoriesById = useMemo(() => Object.fromEntries(data.categories.map((c) => [c.id, c])), [data.categories]);
  const activeCategories = useMemo(() => data.categories.filter((c) => c.isActive), [data.categories]);

  // ─── Transacciones ────────────────────────────────────────────────────────
  const txPayload = (tx) => ({
    amount: tx.amount, transaction_type: tx.type, note: tx.note || '', category_id: tx.categoryId || null,
    date: tx.date, recurrence_type: 'variable',
  });

  const addTransaction = useCallback(async (tx, source = 'app') => {
    const row = check(await supabase.from('transactions').insert({ ...txPayload(tx), user_id: userId, source }).select().single());
    setData((d) => ({ ...d, transactions: [mapTx(row), ...d.transactions].sort((a, b) => b.date.localeCompare(a.date)) }));
    return mapTx(row);
  }, [userId]);

  const updateTransaction = useCallback(async (id, tx) => {
    const row = check(await supabase.from('transactions').update(txPayload(tx)).eq('id', id).select().single());
    setData((d) => ({
      ...d,
      transactions: d.transactions.map((t) => (t.id === id ? mapTx(row) : t)).sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const rows = check(await supabase.from('transactions').delete().eq('id', id).select('id'));
    if (!rows || rows.length === 0) {
      await load(true);
      throw new Error('No se pudo eliminar: el movimiento ya no existe o no tienes permiso.');
    }
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
  }, [load]);

  // ─── Categorías ───────────────────────────────────────────────────────────
  const addCategory = useCallback(async (cat) => {
    const row = check(await supabase.from('categories').insert({ user_id: userId, name: cat.name, icon: cat.icon, color: cat.color }).select().single());
    setData((d) => ({ ...d, categories: [...d.categories, mapCategory(row)] }));
    return mapCategory(row);
  }, [userId]);

  const addCategories = useCallback(async (cats) => {
    if (!cats.length) return [];
    const rows = check(await supabase.from('categories').insert(cats.map((c) => ({ user_id: userId, name: c.name, icon: c.icon, color: c.color }))).select());
    setData((d) => ({ ...d, categories: [...d.categories, ...rows.map(mapCategory)] }));
    return rows.map(mapCategory);
  }, [userId]);

  const updateCategory = useCallback(async (id, cat) => {
    const row = check(await supabase.from('categories').update({ name: cat.name, icon: cat.icon, color: cat.color }).eq('id', id).select().single());
    setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? mapCategory(row) : c)) }));
  }, []);

  /** Archivar = ocultar sin perder el historial de movimientos. */
  const archiveCategory = useCallback(async (id) => {
    check(await supabase.from('categories').update({ is_active: false }).eq('id', id));
    check(await supabase.from('budgets').delete().eq('category_id', id));
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, isActive: false } : c)),
      budgets: d.budgets.filter((b) => b.categoryId !== id),
    }));
  }, []);

  // ─── Presupuestos y recurrentes ───────────────────────────────────────────
  const setBudget = useCallback(async (categoryId, limit) => {
    const row = check(await supabase.from('budgets')
      .upsert({ user_id: userId, category_id: categoryId, limit_amount: limit }, { onConflict: 'user_id,category_id' }).select().single());
    setData((d) => ({ ...d, budgets: [...d.budgets.filter((b) => b.categoryId !== categoryId), mapBudget(row)] }));
  }, [userId]);

  const deleteBudget = useCallback(async (id) => {
    check(await supabase.from('budgets').delete().eq('id', id));
    setData((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) }));
  }, []);

  const addRecurring = useCallback(async (item) => {
    const row = check(await supabase.from('recurring_items').insert({
      user_id: userId, kind: item.kind, name: item.name, amount: item.amount, day: item.day, frequency: 'monthly',
    }).select().single());
    setData((d) => ({ ...d, recurring: [...d.recurring, mapRecurring(row)] }));
  }, [userId]);

  const addRecurringMany = useCallback(async (items) => {
    if (!items.length) return;
    const rows = check(await supabase.from('recurring_items').insert(
      items.map((i) => ({ user_id: userId, kind: i.kind, name: i.name, amount: i.amount, day: i.day || 1, frequency: 'monthly' }))).select());
    setData((d) => ({ ...d, recurring: [...d.recurring, ...rows.map(mapRecurring)] }));
  }, [userId]);

  const deleteRecurring = useCallback(async (id) => {
    check(await supabase.from('recurring_items').delete().eq('id', id));
    setData((d) => ({ ...d, recurring: d.recurring.filter((r) => r.id !== id) }));
  }, []);

  // ─── Cuentas compartidas ──────────────────────────────────────────────────
  const createGroup = useCallback(async (name) => {
    check(await supabase.rpc('create_shared_group', { group_name: name }));
    await load(true);
  }, [load]);

  const joinGroup = useCallback(async (code) => {
    check(await supabase.rpc('join_shared_group', { code }));
    await load(true);
  }, [load]);

  const leaveGroup = useCallback(async (groupId) => {
    check(await supabase.rpc('leave_shared_group', { gid: groupId }));
    setData((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== groupId) }));
  }, []);

  const addSharedExpense = useCallback(async (groupId, e) => {
    check(await supabase.from('shared_expenses').insert({
      group_id: groupId, title: e.title, amount: e.amount, payer_id: e.payerId, receiver_id: e.receiverId || null,
      is_transfer: !!e.isTransfer, date: e.date, created_by: userId,
    }));
    await load(true);
  }, [userId, load]);

  const deleteSharedExpense = useCallback(async (id) => {
    check(await supabase.from('shared_expenses').delete().eq('id', id));
    await load(true);
  }, [load]);

  // ─── Importar datos antiguos (versión sin cuentas, guardados en el móvil) ──
  const findLegacy = useCallback(async () => {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((k) => /^zenfin_[^_]+_txs$/.test(k)).map((k) => k.replace(/_txs$/, '_'));
  }, [userId]);

  const importLegacy = useCallback(async (prefix) => {
    const read = async (suffix) => {
      try { return JSON.parse((await AsyncStorage.getItem(prefix + suffix)) || '[]'); } catch { return []; }
    };
    const [txs, cats, fixed, rec, bgs] = await Promise.all([read('txs'), read('cats'), read('fixed'), read('rec'), read('bgs')]);

    // 1. Categorías (por nombre, sin duplicar)
    const byName = new Map(data.categories.map((c) => [c.name.toLowerCase(), c]));
    const wanted = new Map();
    cats.forEach((c) => wanted.set(String(c.name).toLowerCase(), c));
    txs.forEach((t) => { if (t.category && t.category !== 'Sin categoría' && !wanted.has(String(t.category).toLowerCase())) wanted.set(String(t.category).toLowerCase(), { name: t.category, icon: '📦', color: t.categoryColor || '#64748B' }); });
    const toCreate = [...wanted.entries()].filter(([k]) => !byName.has(k)).map(([, c]) => ({ name: c.name, icon: c.icon || '📦', color: c.color || '#64748B' }));
    const created = await addCategories(toCreate);
    created.forEach((c) => byName.set(c.name.toLowerCase(), c));
    const idOf = (name) => byName.get(String(name || '').toLowerCase())?.id || null;

    // 2. Movimientos
    const rows = txs.filter((t) => Number(t.amount) > 0).map((t) => ({
      user_id: userId, amount: Number(t.amount), transaction_type: t.type === 'income' ? 'income' : 'expense',
      note: t.note || '', category_id: idOf(t.category), date: legacyDateToISO(t.date), source: 'import',
    }));
    for (let i = 0; i < rows.length; i += 200) check(await supabase.from('transactions').insert(rows.slice(i, i + 200)));

    // 3. Fijos / recurrentes / límites
    await addRecurringMany([
      ...fixed.map((f) => ({ kind: 'expense', name: f.name, amount: Number(f.amount), day: parseInt(f.day, 10) || 1 })),
      ...rec.map((f) => ({ kind: 'income', name: f.name, amount: Number(f.amount), day: parseInt(f.day, 10) || 1 })),
    ].filter((i) => i.amount > 0));
    for (const b of bgs) { const id = idOf(b.category); if (id && Number(b.limit) > 0) await setBudget(id, Number(b.limit)); }

    await AsyncStorage.multiRemove(['txs', 'cats', 'fixed', 'rec', 'bgs'].map((s) => prefix + s));
    await load(true);
    return rows.length;
  }, [data.categories, userId, addCategories, addRecurringMany, setBudget, load]);

  const value = useMemo(() => ({
    ...data, categoriesById, activeCategories, loading, offline, reload: load,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, addCategories, updateCategory, archiveCategory,
    setBudget, deleteBudget, addRecurring, addRecurringMany, deleteRecurring,
    createGroup, joinGroup, leaveGroup, addSharedExpense, deleteSharedExpense,
    findLegacy, importLegacy,
  }), [data, categoriesById, activeCategories, loading, offline, load, addTransaction, updateTransaction, deleteTransaction,
    addCategory, addCategories, updateCategory, archiveCategory, setBudget, deleteBudget, addRecurring, addRecurringMany,
    deleteRecurring, createGroup, joinGroup, leaveGroup, addSharedExpense, deleteSharedExpense, findLegacy, importLegacy]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
