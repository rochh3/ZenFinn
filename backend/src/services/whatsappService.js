const axios = require('axios');

/**
 * Sends a WhatsApp text message back to the user using Meta's Cloud API
 */
const sendWhatsAppReply = async (phoneNumberId, to, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Failed to send WhatsApp reply:', err?.response?.data || err.message);
  }
};

module.exports = { sendWhatsAppReply };
