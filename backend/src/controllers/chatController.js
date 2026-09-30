const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Chat endpoint - processes a free-form message and returns a response
 * with optional transaction data extracted by Gemini
 */
async function chat(req, res) {
  const { message, categories = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const catList = categories.map(c => c.name).join(', ') || 'General';

  const prompt = `Eres un asistente financiero personal para la app ZenFinance. El usuario te enviará mensajes en lenguaje natural describiendo gastos o ingresos.

Tu tarea:
1. Identificar si el mensaje describe una transacción financiera.
2. Si es una transacción, extraer los datos y responder en JSON estructurado.
3. Si NO es una transacción, responde como asistente financiero amigable en español.

Categorías disponibles del usuario: ${catList}

Responde SIEMPRE en este formato JSON exacto si detectas una transacción:
{
  "is_transaction": true,
  "transaction": {
    "type": "expense" or "income",
    "amount": <número>,
    "note": "<descripción corta>",
    "category": "<categoría de la lista o la más cercana>"
  },
  "message": "<mensaje amigable confirmando lo registrado, en español, máximo 2 frases>"
}

Si NO es una transacción, responde:
{
  "is_transaction": false,
  "message": "<tu respuesta como asistente financiero, en español>"
}

Devuelve ÚNICAMENTE el JSON sin markdown ni explicaciones.
Mensaje del usuario: "${message}"`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { is_transaction: false, message: rawText };
    }

    res.json(parsed);
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    res.status(500).json({
      is_transaction: false,
      message: 'Error al procesar con IA. Comprueba la clave de API de Gemini.',
      error: err.message,
    });
  }
}

module.exports = { chat };
