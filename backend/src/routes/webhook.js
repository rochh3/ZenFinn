const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { processTransactionText } = require('../services/geminiService');
const { sendWhatsAppReply } = require('../services/whatsappService');

// ─── Webhook Verification ──────────────────────────────────────────────────
router.get('/', (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verify_token) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ─── Receive WhatsApp Messages ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  // Always respond 200 immediately so Meta doesn't retry
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const from = message.from; // Sender's phone number
    const text = message.text.body;
    const phoneNumberId = change.value.metadata.phone_number_id;

    console.log(`📱 Message from ${from}: "${text}"`);

    // 1. Find the user in Supabase by their WhatsApp number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('whatsapp_number', from)
      .single();

    if (userError || !userData) {
      console.log(`⚠️  No user found for number ${from}`);
      await sendWhatsAppReply(phoneNumberId, from,
        '❌ Tu número de WhatsApp no está vinculado a ninguna cuenta de ZenFinance. Abre la app y vincúlalo en tu perfil.'
      );
      return;
    }

    // 2. Get user's categories from Supabase for context
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('couple_group_id', userData.couple_group_id)
      .eq('is_active', true);

    // 3. Process text with Gemini AI
    const parsed = await processTransactionText(text, categories || []);

    // 4. Save transaction to Supabase
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userData.id,
        couple_group_id: userData.couple_group_id,
        category_id: parsed.category_id,
        amount: parsed.amount,
        transaction_type: parsed.transaction_type,
        recurrence_type: 'variable',
        date: parsed.date,
        note: parsed.note,
        source: 'whatsapp',
      }])
      .select()
      .single();

    if (txError) throw txError;

    // 5. Reply confirming the transaction
    const emoji = parsed.transaction_type === 'expense' ? '💸' : '💰';
    const typeLabel = parsed.transaction_type === 'expense' ? 'Gasto' : 'Ingreso';
    const catName = categories?.find(c => c.id === parsed.category_id)?.name || 'Sin categoría';

    const reply = `${emoji} *${typeLabel} registrado*\n\n` +
      `📝 ${parsed.note}\n` +
      `💶 ${parsed.amount.toFixed(2)} €\n` +
      `📂 ${catName}\n` +
      `📅 ${parsed.date}\n\n` +
      `_Añadido automáticamente en ZenFinance ✦_`;

    await sendWhatsAppReply(phoneNumberId, from, reply);
    console.log(`✅ Transaction saved for user ${userData.id}: ${parsed.amount}€`);

  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
  }
});

module.exports = router;
