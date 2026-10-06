import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { supabase } from '../config/supabase';
import { Icon, ScreenTitle, MAX_CONTENT_WIDTH } from '../components/ui';
import { formatMoney, todayISO } from '../utils/format';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export const ChatScreen = () => {
  const { t, theme, language } = useSettings();
  const styles = useStyles(makeStyles);
  const { profile } = useAuth();
  const { activeCategories, addTransaction } = useData();

  const [messages, setMessages] = useState(() => [{ id: 'hello', role: 'assistant', text: '' }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80); }, [messages, sending]);

  const greeting = `${t('assistantHello', { name: profile?.name ? `, ${profile.name}` : '' })}\n\n${t('assistantExamples')}`;

  const ask = async (history) => {
    if (!API_URL) throw new Error(t('apiMissing'));
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: history, categories: activeCategories.map((c) => c.name), today: todayISO() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok && !json.message) throw new Error(json.error || `HTTP ${res.status}`);
      return json;
    } finally {
      clearTimeout(timer);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { id: `u${Date.now()}`, role: 'user', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const history = next.filter((m) => m.id !== 'hello').map((m) => ({ role: m.role, content: m.text }));
      const reply = await ask(history);

      // Un mensaje puede traer varios movimientos: se guardan los que tienen categoría
      // y se avisa de los que faltan por clasificar.
      const saved = [];
      const pending = [];
      if (reply.is_transaction) {
        for (const tx of reply.transactions || []) {
          const cat = tx.category && activeCategories.find((c) => c.name.toLowerCase() === tx.category.toLowerCase());
          if (!cat) { pending.push(tx); continue; }
          await addTransaction({ amount: tx.amount, type: tx.type, note: tx.note, categoryId: cat.id, date: tx.date }, 'ai');
          saved.push({ ...tx, category: cat });
        }
      }
      let text = reply.message || '…';
      if (pending.length) {
        text += `

${t('needCategory')}: ${pending.map((p) => `${p.note || ''} (${formatMoney(p.amount, language)})`).join(', ')}`;
      }
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: 'assistant', text, saved }]);
    } catch (e) {
      console.warn('Chat error:', e.message);
      setMessages((m) => [...m, { id: `e${Date.now()}`, role: 'assistant', text: e.message === t('apiMissing') ? e.message : t('aiError'), error: true }]);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const mine = item.role === 'user';
    const text = item.id === 'hello' ? greeting : item.text;
    return (
      <Animated.View entering={FadeInDown.duration(220)} style={[styles.msgRow, mine && { justifyContent: 'flex-end' }]}>
        {!mine && <View style={styles.avatar}><Icon name="sparkles" size={14} color={theme.colors.onPrimary} /></View>}
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleAi, item.error && { borderColor: theme.colors.danger }]}>
          <Text style={[styles.bubbleText, mine && { color: theme.colors.onPrimary }]}>{text}</Text>
          {item.saved?.length > 0 && (
            <View style={styles.savedBox}>
              <Text style={styles.savedHead}>{t('registered')} ({item.saved.length})</Text>
              {item.saved.map((tx, i) => (
                <View key={i} style={styles.savedRow}>
                  <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.savedText}>
                    {tx.type === 'income' ? '+' : '−'}{formatMoney(tx.amount, language)} · {tx.category.icon} {tx.category.name}{tx.note ? ` · ${tx.note}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={{ flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>
      <View style={{ padding: theme.spacing.l, paddingBottom: 0 }}><ScreenTitle title={t('assistantTitle')} /></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: theme.spacing.l }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={sending ? <View style={styles.typing}><ActivityIndicator color={theme.colors.primary} size="small" /></View> : null}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('typeMessage')}
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="send"
            onSubmitEditing={send}
            onKeyPress={(e) => {
              // En web, Enter envía (Shift+Enter hace salto de línea)
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) { e.preventDefault(); send(); }
            }}
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={send} disabled={!input.trim() || sending} activeOpacity={0.8} style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}>
            <Icon name="arrow-up" size={22} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: theme.spacing.m },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bubble: { maxWidth: '82%', borderRadius: theme.radius.l, padding: theme.spacing.m, paddingHorizontal: theme.spacing.l },
  bubbleMine: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 6 },
  bubbleAi: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 6 },
  bubbleText: { ...theme.font.body, color: theme.colors.text, lineHeight: 21 },
  savedBox: { marginTop: theme.spacing.m, paddingTop: theme.spacing.m, borderTopWidth: 1, borderTopColor: theme.colors.border },
  savedHead: { ...theme.font.caption, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  savedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  savedText: { ...theme.font.small, color: theme.colors.text, marginLeft: 6, flex: 1, fontWeight: '700' },
  typing: { alignSelf: 'flex-start', marginLeft: 36, padding: theme.spacing.m },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: theme.spacing.m, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background },
  input: { flex: 1, maxHeight: 110, backgroundColor: theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.l, paddingTop: 12, paddingBottom: 12, color: theme.colors.text, ...theme.font.body, fontSize: 16 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
