export const ICONS = ['🛒', '🍽️', '🚗', '🏠', '💡', '📱', '🎟️', '💊', '✈️', '🎓', '👕', '🐶', '🎁', '💰', '🏋️', '📦'];
export const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#64748B'];

const ES = [
  ['Alimentación', '🛒', '#10B981'], ['Restaurantes', '🍽️', '#F59E0B'], ['Transporte', '🚗', '#3B82F6'],
  ['Hogar', '🏠', '#8B5CF6'], ['Ocio', '🎟️', '#EC4899'], ['Salud', '💊', '#EF4444'],
  ['Compras', '👕', '#06B6D4'], ['Viajes', '✈️', '#F97316'], ['Sueldo', '💰', '#84CC16'], ['Otros', '📦', '#64748B'],
];
const EN = [
  ['Groceries', '🛒', '#10B981'], ['Dining', '🍽️', '#F59E0B'], ['Transport', '🚗', '#3B82F6'],
  ['Home', '🏠', '#8B5CF6'], ['Leisure', '🎟️', '#EC4899'], ['Health', '💊', '#EF4444'],
  ['Shopping', '👕', '#06B6D4'], ['Travel', '✈️', '#F97316'], ['Salary', '💰', '#84CC16'], ['Other', '📦', '#64748B'],
];

export const suggestedCategories = (lang) =>
  (lang === 'en' ? EN : ES).map(([name, icon, color]) => ({ name, icon, color }));
