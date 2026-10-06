const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isIsoDate = (s) => typeof s === 'string' && ISO_DATE.test(s) && !Number.isNaN(Date.parse(s));

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Extrae el primer objeto JSON de un texto (por si el modelo añade ruido). */
const extractJson = (raw) => {
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
};

const MAX_TX = 10;

const sanitizeOne = (tx, categoryNames, fallbackDate) => {
  if (!tx || typeof tx !== 'object') return null;
  const amount = Math.abs(Number(String(tx.amount).replace(',', '.')));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) return null;
  return {
    type: tx.type === 'income' ? 'income' : 'expense',
    amount: Math.round(amount * 100) / 100,
    note: String(tx.note || '').slice(0, 80),
    category: categoryNames.find((c) => c.toLowerCase() === String(tx.category || '').toLowerCase()) || null,
    date: isIsoDate(tx.date) ? tx.date : fallbackDate,
  };
};

/**
 * Normaliza lo que devuelve la IA a una forma segura y conocida:
 * { is_transaction, transactions: [{type, amount, note, category, date}], message }
 * Nunca confiamos en el JSON del modelo tal cual. Acepta "transactions" (lista) o
 * el formato antiguo "transaction" (uno solo).
 */
const sanitizeAiResult = (obj, categoryNames = [], fallbackDate = todayISO()) => {
  if (!obj || typeof obj !== 'object') {
    return { is_transaction: false, message: 'No he podido entender la respuesta. Inténtalo de nuevo.' };
  }
  const message = String(obj.message || '').slice(0, 600) || 'Listo.';
  const raw = Array.isArray(obj.transactions) ? obj.transactions : obj.transaction ? [obj.transaction] : [];
  const transactions = raw.slice(0, MAX_TX).map((tx) => sanitizeOne(tx, categoryNames, fallbackDate)).filter(Boolean);

  if (!obj.is_transaction || transactions.length === 0) return { is_transaction: false, message };
  return { is_transaction: true, transactions, message };
};

module.exports = { isIsoDate, todayISO, extractJson, sanitizeAiResult };
