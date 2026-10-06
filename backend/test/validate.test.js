const test = require('node:test');
const assert = require('node:assert');
const { sanitizeAiResult, extractJson } = require('../src/utils/validate');

test('normaliza una transacción válida', () => {
  const r = sanitizeAiResult(
    {
      is_transaction: true,
      transactions: [{ type: 'expense', amount: '12,5', note: 'Cena', category: 'ocio', date: '2025-01-02' }],
      message: 'ok',
    },
    ['Ocio'],
    '2025-01-03'
  );
  assert.deepStrictEqual(r.transactions[0], { type: 'expense', amount: 12.5, note: 'Cena', category: 'Ocio', date: '2025-01-02' });
});

test('descarta importes inválidos y categorías inventadas', () => {
  assert.strictEqual(
    sanitizeAiResult({ is_transaction: true, transactions: [{ amount: 0 }], message: 'x' }, []).is_transaction,
    false
  );
  const r = sanitizeAiResult(
    { is_transaction: true, transactions: [{ amount: 5, category: 'Hack', date: 'mañana' }], message: 'x' },
    ['Ocio'],
    '2025-01-03'
  );
  assert.strictEqual(r.transactions[0].category, null);
  assert.strictEqual(r.transactions[0].date, '2025-01-03');
});

test('extractJson tolera ruido alrededor', () => {
  assert.deepStrictEqual(extractJson('Claro: {"a":1} listo'), { a: 1 });
  assert.strictEqual(extractJson('nada'), null);
});

test('acepta varios gastos en un mensaje y el formato antiguo', () => {
  const r = sanitizeAiResult(
    { is_transaction: true, transactions: [{ amount: 12, category: 'Ocio' }, { amount: 5, category: 'Ocio' }, { amount: 'x' }], message: 'ok' },
    ['Ocio'], '2025-01-03');
  assert.deepStrictEqual(r.transactions.map((x) => x.amount), [12, 5]);
  const old = sanitizeAiResult({ is_transaction: true, transaction: { amount: 3 }, message: 'ok' }, [], '2025-01-03');
  assert.strictEqual(old.transactions.length, 1);
});
