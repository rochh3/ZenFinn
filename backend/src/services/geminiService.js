const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Processes a natural language text from WhatsApp and extracts structured financial data.
 * @param {string} text - The natural language message (e.g., "30 euros de cena anoche")
 * @param {Array} userCategories - Array of category objects available for the user
 * @returns {Object} JSON payload with { amount, category_id, transaction_type, note, date }
 */
async function processTransactionText(text, userCategories) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // We pass the user's custom categories to the prompt so Gemini can map the expense accurately
    const categoriesContext = userCategories.map(c => `ID: ${c.id}, Nombre: ${c.name}`).join('\n');

    const prompt = `
      Eres un asistente financiero inteligente. 
      Analiza el siguiente texto escrito por el usuario por WhatsApp y extrae los datos de la transacción en formato JSON estricto.
      
      Texto del usuario: "${text}"
      
      Categorías disponibles del usuario:
      ${categoriesContext}
      
      Reglas:
      1. transaction_type debe ser "expense" (gasto) o "income" (ingreso). Por defecto asume gasto a menos que diga "ingreso", "cobré", "nómina", etc.
      2. amount debe ser un número decimal (ej. 30.00). No incluyas símbolos de moneda.
      3. date debe ser la fecha de la transacción en formato YYYY-MM-DD. Si dice "ayer", calcula la fecha de ayer. Si no dice fecha, usa hoy. (Hoy es: ${new Date().toISOString().split('T')[0]})
      4. category_id debe ser EXACTAMENTE el ID de la categoría que más se ajuste al gasto. Si ninguna encaja bien, usa la de ocio o varios si existe, o null.
      5. note debe ser un breve resumen (max 5 palabras).
      
      Devuelve ÚNICAMENTE el JSON. Sin formato markdown ni explicaciones adicionales.
      Ejemplo de salida:
      {"amount": 30.00, "category_id": "uuid-here", "transaction_type": "expense", "date": "2023-10-24", "note": "Cena"}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error in Gemini processing:", error);
    throw new Error("Failed to process text with Gemini AI");
  }
}

module.exports = {
  processTransactionText
};
