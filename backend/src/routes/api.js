const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateUser } = require('../middleware/auth');
const { chat } = require('../controllers/chatController');

const router = express.Router();

// Máx. 20 mensajes/minuto por usuario (evita agotar la cuota de Groq).
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || 'anon',
  message: { is_transaction: false, message: 'Demasiados mensajes seguidos. Espera un momento.' },
});

router.post('/chat', authenticateUser, chatLimiter, chat);

module.exports = router;
