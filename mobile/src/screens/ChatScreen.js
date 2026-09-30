import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const buildSystemPrompt = (categories) => {
  const catList = categories.map(c => c.name).join(', ') || 'Sin categorías';
  const today = new Date().toISOString().split('T')[0];
  
  return `Eres un asistente financiero personal para la app ZenFinance. 
Hoy es ${today}. El usuario te enviará mensajes sobre sus finanzas.

Tu tarea:
1. Identificar si el usuario quiere registrar una transacción.
2. Si es una transacción, extraer los datos y responder en JSON.
3. Fechas: Si el usuario menciona "ayer" o "hace 2 días", calcula la fecha correcta (YYYY-MM-DD). Si no dice fecha, usa ${today}.
4. Categorías: Solo puedes usar estas categorías: ${catList}. Si no sabes en cuál meterla, asigna null a category.

SI detectas o estás completando una transacción, responde en este JSON:
{
  "is_transaction": true,
  "transaction": {
    "type": "expense" | "income",
    "amount": <número>,
    "note": "<descripción>",
    "category": "<categoría de la lista o null>",
    "date": "<YYYY-MM-DD>"
  },
  "message": "<mensaje confirmando. Si category es null, dile que no sabes qué categoría poner y pregúntale en cuál de las suyas quiere meterlo>"
}

SI NO es una transacción (ej. el usuario solo responde a tu pregunta, o es una charla normal), responde:
{
  "is_transaction": false,
  "message": "<tu respuesta conversacional>"
}

DEBES devolver ÚNICAMENTE el JSON.`;
};

export const ChatScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { categories, addTransaction, user, currentUser } = useApp();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: `Hola${user?.name ? `, ${user.name}` : ''}! 👋 Soy tu asistente financiero IA. Dime en lenguaje natural cualquier gasto o ingreso y lo registraré automáticamente.\n\nEjemplos:\n• "Ayer gasté 45€ en cena"\n• "Cobré la nómina 2100"\n• "Supermercado 74.50"`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for the AI
      const apiMessages = [
        { role: 'system', content: buildSystemPrompt(categories) },
        ...messages.map(m => ({ role: m.role, content: m.text })),
        { role: 'user', content: text }
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: apiMessages,
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Error en Groq API');

      const rawText = data.choices[0].message.content;
      const parsed = JSON.parse(rawText);

      let assistantText = parsed.message || 'He procesado tu mensaje.';
      let txAdded = false;

      // Only save if it's a transaction AND category is not null
      if (parsed.is_transaction && parsed.transaction && parsed.transaction.category) {
        const tx = parsed.transaction;
        addTransaction({
          amount: Math.abs(tx.amount),
          type: tx.type,
          note: tx.note,
          category: tx.category,
          date: tx.date || new Date().toISOString().split('T')[0]
        });
        txAdded = true;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: assistantText,
        txAdded,
        txData: txAdded ? parsed.transaction : null,
      }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Lo siento, la IA de Groq está saturada o hubo un error. Inténtalo de nuevo.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View
        entering={FadeInDown.delay(50).springify().damping(14)}
        style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAssistant]}
      >
        {!isUser && (
          <View style={styles.avatarDot}>
            <Text style={{ fontSize: 12 }}>✦</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          {item.txAdded && item.txData && (
            <View style={styles.txConfirmBox}>
              <Text style={styles.txConfirmLabel}>TRANSACCIÓN REGISTRADA</Text>
              <Text style={styles.txConfirmLine}>
                {item.txData.type === 'income' ? '+ ' : '- '}{Math.abs(item.txData.amount).toFixed(2)} € · {item.txData.category}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerDot} />
        <View>
          <Text style={styles.headerTitle}>ASISTENTE IA</Text>
          <Text style={styles.headerSub}>Powered by Grok • Registra gastos hablando</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {loading && (
        <Animated.View entering={FadeInUp} style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.typingText}>Analizando con IA...</Text>
        </Animated.View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ej: Ayer gasté 30€ en cena..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.m,
  },
  headerDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  headerTitle: { ...theme.typography.caption, color: theme.colors.text, letterSpacing: 3 },
  headerSub: { ...theme.typography.caption, color: theme.colors.textSecondary, fontSize: 9, letterSpacing: 0, marginTop: 2 },
  listContent: { padding: theme.spacing.l, paddingBottom: theme.spacing.m },
  msgWrapper: { flexDirection: 'row', marginBottom: theme.spacing.l, alignItems: 'flex-end', gap: 8 },
  msgWrapperUser: { justifyContent: 'flex-end' },
  msgWrapperAssistant: { justifyContent: 'flex-start' },
  avatarDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: theme.spacing.m,
  },
  bubbleUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
  },
  bubbleTextUser: { color: '#FFF' },
  txConfirmBox: {
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  txConfirmLabel: {
    ...theme.typography.caption,
    color: theme.colors.success,
    letterSpacing: 1,
    fontSize: 9,
    marginBottom: 4,
  },
  txConfirmLine: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.s,
  },
  typingText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.s,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#FFF', fontSize: 20, fontWeight: '300' },
});
