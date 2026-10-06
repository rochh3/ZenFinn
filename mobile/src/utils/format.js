const pad = (n) => String(n).padStart(2, '0');

/** Date local -> 'YYYY-MM-DD' (sin saltos de zona horaria). */
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());

/** 'YYYY-MM-DD' -> Date local a las 12:00 (evita errores por horario de verano). */
export const parseISO = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12);
};

export const addDays = (iso, n) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

const locale = (lang) => (lang === 'en' ? 'en-GB' : 'es-ES');

export const formatMoney = (n, lang = 'es', opts = {}) => {
  const value = Number(n) || 0;
  try {
    return new Intl.NumberFormat(locale(lang), {
      style: 'currency', currency: 'EUR',
      minimumFractionDigits: opts.compact ? 0 : 2, maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} €`;
  }
};

export const formatDate = (iso, lang = 'es', opts = { day: 'numeric', month: 'short' }) => {
  try {
    return parseISO(iso).toLocaleDateString(locale(lang), opts);
  } catch {
    return iso;
  }
};

/** 'Hoy', 'Ayer' o fecha corta con día de la semana. */
export const friendlyDate = (iso, t, lang) => {
  const today = todayISO();
  if (iso === today) return t('today');
  if (iso === addDays(today, -1)) return t('yesterday');
  return formatDate(iso, lang, { weekday: 'short', day: 'numeric', month: 'short' });
};

export const monthName = (monthIndex, lang, style = 'long') =>
  new Date(2020, monthIndex, 1).toLocaleDateString(locale(lang), { month: style });

export const weekdayInitials = (lang) => {
  // Lunes primero
  const base = new Date(2024, 0, 1); // lunes
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toLocaleDateString(locale(lang), { weekday: 'narrow' }).toUpperCase();
  });
};

/** 'dd/mm/yyyy' (formato antiguo de la app) -> 'YYYY-MM-DD' */
export const legacyDateToISO = (s) => {
  const m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s || '')) return String(s).slice(0, 10);
  return todayISO();
};

/** Acepta '12,5' o '12.5'. Devuelve NaN si no es un número positivo razonable. */
export const parseAmount = (s) => {
  const n = Number(String(s ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n < 1e9 ? Math.round(n * 100) / 100 : NaN;
};
