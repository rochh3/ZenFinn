const { chatTurn } = require('../services/aiService');
const { isIsoDate } = require('../utils/validate');

const MAX_HISTORY = 12;
const MAX_CHARS = 1000;

async function chat(req, res) {
  const { messages, categories, today } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages es obligatorio' });
  }

  const history = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!history.length || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'El último mensaje debe ser del usuario' });
  }

  const categoryNames = (Array.isArray(categories) ? categories : [])
    .filter((c) => typeof c === 'string' && c.trim())
    .slice(0, 50)
    .map((c) => c.slice(0, 40));

  try {
    const result = await chatTurn({
      history,
      categoryNames,
      today: isIsoDate(today) ? today : undefined,
    });
    res.json(result);
  } catch (err) {
    console.error('Chat IA error:', err?.response?.data || err.message);
    res.status(502).json({
      is_transaction: false,
      message: 'La IA no está disponible ahora mismo. Inténtalo de nuevo en un momento.',
    });
  }
}

module.exports = { chat };
