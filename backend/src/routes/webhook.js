const crypto = require('crypto');
const express = require('express');
const { adminClient } = require('../config/supabase');
const { parseTransactionText } = require('../services/aiService');
const { sendWhatsAppReply } = require('../services/whatsappService');

const router = express.Router();

const safeEqual = (a, b) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

/** Verifica la firma X-Hub-Signature-256 que Meta añade a cada petición. */
const verifySignature = (req, res, next) => {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('WHATSAPP_APP_SECRET no configurado: webhook rechazado');
      return res.sendStatus(500);
    }
    console.warn('⚠️  WHATSAPP_APP_SECRET no configurado: firma sin verificar (solo desarrollo)');
    return next();
  }
  const header = req.headers['x-hub-signature-256'] || '';
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex');
  if (!safeEqual(header, expected)) return res.sendStatus(403);
  next();
};

router.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && process.env.VERIFY_TOKEN && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

router.post('/', verifySignature, async (req, res) => {
  res.sendStatus(200); // Meta reintenta si no respondemos rápido

  try {
    if (!adminClient) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada');

    const change = req.body?.entry?.[0]?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message || message.type !== 'text') return;

    const from = message.from;
    const text = String(message.text?.body || '').slice(0, 500);
    const phoneNumberId = change.value.metadata.phone_number_id;

    const { data: profile } = await adminClient
      .from('users')
      .select('id')
      .eq('whatsapp_number', from)
      .maybeSingle();

    if (!profile) {
      await sendWhatsAppReply(
        phoneNumberId,
        from,
        '❌ Tu número no está vinculado a ninguna cuenta de ZenFin. Abre la app → Perfil → WhatsApp y añádelo.'
      );
      return;
    }

    const { data: categories } = await adminClient
      .from('categories')
      .select('id,name')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    const parsed = await parseTransactionText(text, (categories || []).map((c) => c.name));

    if (!parsed.is_transaction) {
      await sendWhatsAppReply(phoneNumberId, from, `🤔 ${parsed.message}`);
      return;
    }

    const lines = [];
    for (const tx of parsed.transactions) {
      const category = (categories || []).find((c) => c.name === tx.category);
      const { error } = await adminClient.from('transactions').insert({
        user_id: profile.id,
        category_id: category?.id ?? null,
        amount: tx.amount,
        transaction_type: tx.type,
        recurrence_type: 'variable',
        date: tx.date,
        note: tx.note,
        source: 'whatsapp',
      });
      if (error) throw error;
      lines.push(`${tx.type === 'expense' ? '💸' : '💰'} ${tx.note || '—'} · ${tx.amount.toFixed(2)} € · ${category?.name || 'Sin categoría'} · ${tx.date}`);
    }

    const title = lines.length === 1 ? 'Registrado' : `${lines.length} movimientos registrados`;
    await sendWhatsAppReply(phoneNumberId, from, ['✅ *' + title + '*', '', ...lines].join(String.fromCharCode(10)));
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

module.exports = router;
