import { toISODate, parseISO, monthName } from './format';

export const summarize = (txs) => {
  let income = 0;
  let expense = 0;
  for (const tx of txs) {
    if (tx.type === 'income') income += tx.amount;
    else expense += tx.amount;
  }
  return { income, expense, net: income - expense };
};

/**
 * Rango [start, end] (ISO, ambos incluidos) de un periodo desplazado `offset` unidades.
 * period: 'day' | 'month' | 'quarter' | 'year'
 */
export const getRange = (period, offset = 0, now = new Date()) => {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === 'day') {
    const d = new Date(y, m, now.getDate() + offset);
    const iso = toISODate(d);
    return { start: iso, end: iso, anchor: d };
  }
  if (period === 'month') {
    const d = new Date(y, m + offset, 1);
    return { start: toISODate(d), end: toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0)), anchor: d };
  }
  if (period === 'quarter') {
    const q = Math.floor(m / 3) + offset;
    const d = new Date(y, q * 3, 1);
    return { start: toISODate(d), end: toISODate(new Date(d.getFullYear(), d.getMonth() + 3, 0)), anchor: d };
  }
  const d = new Date(y + offset, 0, 1);
  return { start: toISODate(d), end: toISODate(new Date(d.getFullYear(), 11, 31)), anchor: d };
};

export const periodLabel = (period, range, lang) => {
  const d = range.anchor;
  if (period === 'day') return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  if (period === 'month') return `${monthName(d.getMonth(), lang)} ${d.getFullYear()}`;
  if (period === 'quarter') return `T${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  return String(d.getFullYear());
};

export const inRange = (iso, range) => iso >= range.start && iso <= range.end;

/** Gasto por categoría, ordenado de mayor a menor. */
export const byCategory = (txs, categoriesById) => {
  const map = new Map();
  for (const tx of txs) {
    if (tx.type !== 'expense') continue;
    const key = tx.categoryId || 'none';
    map.set(key, (map.get(key) || 0) + tx.amount);
  }
  return [...map.entries()]
    .map(([id, value]) => ({ id, value, category: categoriesById[id] || null }))
    .sort((a, b) => b.value - a.value);
};

/** Barras de evolución dentro del periodo (por día o por mes). */
export const buildSeries = (txs, period, range, lang) => {
  const start = parseISO(range.start);
  let buckets;
  if (period === 'month') {
    const days = parseISO(range.end).getDate();
    buckets = Array.from({ length: days }, (_, i) => ({
      key: toISODate(new Date(start.getFullYear(), start.getMonth(), i + 1)),
      label: (i + 1) % 5 === 1 || i + 1 === days ? String(i + 1) : '',
    }));
  } else if (period === 'quarter' || period === 'year') {
    const n = period === 'quarter' ? 3 : 12;
    buckets = Array.from({ length: n }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: monthName(d.getMonth(), lang, 'short').slice(0, 3) };
    });
  } else {
    return [];
  }
  const monthly = period !== 'month';
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  const out = buckets.map((b) => ({ label: b.label, income: 0, expense: 0 }));
  for (const tx of txs) {
    const i = index.get(monthly ? tx.date.slice(0, 7) : tx.date);
    if (i === undefined) continue;
    out[i][tx.type === 'income' ? 'income' : 'expense'] += tx.amount;
  }
  return out;
};

/**
 * Deudas simplificadas de una cuenta compartida.
 * Los gastos normales se reparten a partes iguales; las transferencias (is_transfer) liquidan deuda.
 * Devuelve [{ from, to, amount }] con ids de usuario.
 */
export const computeDebts = (memberIds, expenses) => {
  if (!memberIds.length || !expenses.length) return [];
  const normal = expenses.filter((e) => !e.isTransfer);
  const split = normal.reduce((a, e) => a + e.amount, 0) / memberIds.length;

  const balances = memberIds.map((id) => {
    const paid = normal.filter((e) => e.payerId === id).reduce((a, e) => a + e.amount, 0);
    const sent = expenses.filter((e) => e.isTransfer && e.payerId === id).reduce((a, e) => a + e.amount, 0);
    const received = expenses.filter((e) => e.isTransfer && e.receiverId === id).reduce((a, e) => a + e.amount, 0);
    return { id, balance: paid - split + sent - received };
  });

  const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
  const debts = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].balance, creditors[j].balance);
    debts.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(amount * 100) / 100 });
    debtors[i].balance += amount;
    creditors[j].balance -= amount;
    if (debtors[i].balance >= -0.01) i++;
    if (creditors[j].balance <= 0.01) j++;
  }
  return debts;
};
