import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Modal, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, useStyles } from '../theme/SettingsContext';

// Ancho máximo del contenido: en tablets/pantallas grandes se centra en vez de estirarse.
export const MAX_CONTENT_WIDTH = 720;
const centered = (max) => ({ width: '100%', maxWidth: max, alignSelf: 'center' });

export const Icon = ({ name, size = 20, color, style }) => {
  const { theme } = useSettings();
  return <Ionicons name={name} size={size} color={color || theme.colors.text} style={style} />;
};

/** Contenedor de pantalla: respeta zonas seguras, fondo del tema y (opcional) scroll con pull-to-refresh. */
export const Screen = ({ children, scroll = true, edges = ['top'], onRefresh, refreshing = false, contentStyle, style }) => {
  const { theme } = useSettings();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[{ padding: theme.spacing.l, paddingBottom: theme.spacing.xxl * 2 }, centered(MAX_CONTENT_WIDTH), contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: theme.spacing.l }, centered(MAX_CONTENT_WIDTH), contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {body}
    </SafeAreaView>
  );
};

export const Card = ({ children, style, onPress, tone = 'surface' }) => {
  const styles = useStyles(makeStyles);
  const base = [styles.card, tone === 'alt' && styles.cardAlt, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
};

export const Button = ({ title, onPress, variant = 'primary', icon, loading, disabled, style, small }) => {
  const { theme } = useSettings();
  const styles = useStyles(makeStyles);
  const c = theme.colors;
  const scheme = {
    primary: { bg: c.primary, fg: c.onPrimary, border: c.primary },
    secondary: { bg: c.surfaceAlt, fg: c.text, border: c.border },
    ghost: { bg: 'transparent', fg: c.primary, border: 'transparent' },
    danger: { bg: 'transparent', fg: c.danger, border: c.danger },
  }[variant];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, small && styles.buttonSmall, { backgroundColor: scheme.bg, borderColor: scheme.border, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={scheme.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={scheme.fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.buttonText, { color: scheme.fg }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const IconButton = ({ name, onPress, color, size = 22, style }) => {
  const styles = useStyles(makeStyles);
  return (
    <TouchableOpacity onPress={onPress} hitSlop={10} style={[styles.iconButton, style]} activeOpacity={0.7}>
      <Icon name={name} size={size} color={color} />
    </TouchableOpacity>
  );
};

export const Field = ({ label, style, inputStyle, ...props }) => {
  const { theme } = useSettings();
  const styles = useStyles(makeStyles);
  return (
    <View style={[{ marginBottom: theme.spacing.l }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        selectionColor={theme.colors.primary}
        {...props}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
};

export const Label = ({ children, style }) => {
  const styles = useStyles(makeStyles);
  return <Text style={[styles.label, style]}>{children}</Text>;
};

export const Segmented = ({ options, value, onChange, style }) => {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.segmented, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity key={o.value} activeOpacity={0.8} onPress={() => onChange(o.value)} style={[styles.segment, active && styles.segmentActive]}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const Chip = ({ label, icon, active, color, onPress, style }) => {
  const { theme } = useSettings();
  const styles = useStyles(makeStyles);
  const tint = color || theme.colors.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && { borderColor: tint, backgroundColor: tint + '22' }, style]}
    >
      {icon ? <Text style={{ marginRight: 6 }}>{icon}</Text> : null}
      <Text style={[styles.chipText, active && { color: theme.colors.text, fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const SectionHeader = ({ title, actionLabel, onAction, style }) => {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const EmptyState = ({ icon = 'sparkles-outline', title, text, actionLabel, onAction }) => {
  const { theme } = useSettings();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name={icon} size={30} color={theme.colors.primary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} small style={{ marginTop: theme.spacing.l }} /> : null}
    </View>
  );
};

export const ProgressBar = ({ value, color, style }) => {
  const { theme } = useSettings();
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <View style={[{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color || theme.colors.primary }} />
    </View>
  );
};

export const Avatar = ({ name, size = 44, color }) => {
  const { theme } = useSettings();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color || theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: size * 0.42 }}>{(name || '?').trim().charAt(0).toUpperCase() || '?'}</Text>
    </View>
  );
};

/** Hoja inferior deslizante para formularios cortos. */
export const Sheet = ({ visible, onClose, title, children }) => {
  const styles = useStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, centered(600)]}>
          <View style={styles.grabber} />
          {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const Banner = ({ text, tone = 'warning' }) => {
  const { theme } = useSettings();
  return (
    <View style={{ backgroundColor: theme.colors[tone] + '22', borderRadius: theme.radius.m, padding: theme.spacing.m, marginBottom: theme.spacing.l, flexDirection: 'row', alignItems: 'center' }}>
      <Icon name="cloud-offline-outline" size={18} color={theme.colors[tone]} style={{ marginRight: 8 }} />
      <Text style={{ color: theme.colors.text, flex: 1, ...theme.font.small }}>{text}</Text>
    </View>
  );
};

export const ScreenTitle = ({ title, subtitle }) => {
  const styles = useStyles(makeStyles);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l, padding: theme.spacing.l, borderWidth: 1, borderColor: theme.colors.border },
  cardAlt: { backgroundColor: theme.colors.surfaceAlt },
  button: { minHeight: 52, borderRadius: theme.radius.m, borderWidth: 1, paddingHorizontal: theme.spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonSmall: { minHeight: 40, paddingHorizontal: theme.spacing.l, borderRadius: theme.radius.s },
  buttonText: { ...theme.font.h2, fontSize: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { ...theme.font.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.s, textTransform: 'uppercase' },
  input: { backgroundColor: theme.colors.surface, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.m, paddingHorizontal: theme.spacing.l, minHeight: 52, ...theme.font.body, fontSize: 16 },
  segmented: { flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.m, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: theme.radius.s, alignItems: 'center' },
  segmentActive: { backgroundColor: theme.colors.surface, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segmentText: { ...theme.font.small, color: theme.colors.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: theme.colors.text, fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.l, paddingVertical: 10, borderRadius: theme.radius.pill, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, marginRight: theme.spacing.s, marginBottom: theme.spacing.s },
  chipText: { ...theme.font.small, color: theme.colors.textSecondary, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xl, marginBottom: theme.spacing.m },
  sectionTitle: { ...theme.font.h2, color: theme.colors.text },
  sectionAction: { ...theme.font.small, color: theme.colors.primary, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: theme.spacing.xxl * 1.5, paddingHorizontal: theme.spacing.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.l },
  emptyTitle: { ...theme.font.h2, color: theme.colors.text, textAlign: 'center' },
  emptyText: { ...theme.font.small, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl, maxHeight: '85%' },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: theme.spacing.l },
  sheetTitle: { ...theme.font.h1, color: theme.colors.text, marginBottom: theme.spacing.l },
  screenTitle: { ...theme.font.title, color: theme.colors.text },
  screenSubtitle: { ...theme.font.small, color: theme.colors.textSecondary, marginTop: 4 },
});
