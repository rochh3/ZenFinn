import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

const ICONS = ['🛒', '🚗', '🏠', '🎟️', '💊', '✈️', '📱', '🍽️', '💡', '🎓'];
const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const TOTAL_STEPS = 4;

export const Onboarding = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { setUser, currentUser, addCategory, addFixedExpense } = useApp();

  // Step 1 - Name
  const [name, setName] = useState('');

  // Step 2 - Categories
  const [categories, setCategoriesLocal] = useState([]);
  const [catName, setCatName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛒');
  const [selectedColor, setSelectedColor] = useState('#10B981');

  // Step 3 - Fixed expenses
  const [fixedList, setFixedList] = useState([]);
  const [fixedName, setFixedName] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');

  const [step, setStep] = useState(1);

  const addLocalCategory = () => {
    if (!catName.trim()) return;
    setCategoriesLocal(prev => [...prev, { id: Date.now().toString(), name: catName.trim().toUpperCase(), icon: selectedIcon, color: selectedColor }]);
    setCatName('');
  };

  const addLocalFixed = () => {
    if (!fixedName.trim() || !fixedAmount) return;
    setFixedList(prev => [...prev, { id: Date.now().toString(), name: fixedName.trim().toUpperCase(), amount: parseFloat(fixedAmount) }]);
    setFixedName(''); setFixedAmount('');
  };

  const handleNext = async () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Requerido', 'Por favor introduce tu nombre');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Commit all collected data to global state
      setUser({ name: name.trim() });
      categories.forEach(c => addCategory(c));
      fixedList.forEach(f => addFixedExpense(f));
      // Mark onboarding as done for this user so it won't show again
      try {
        await SecureStore.setItemAsync(`onboarding_done_${currentUser?.id || 'default'}`, 'true');
      } catch (e) {
        console.warn('SecureStore write failed:', e.message);
      }
      navigation.replace('DrawerNavigator');
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.brandTitle}>ZENFINANCE</Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.stepCount}>{step} / {TOTAL_STEPS}</Text>

      {/* Steps */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* STEP 1: Name */}
        {step === 1 && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
            </View>
            <Text style={styles.stepTitle}>¿CÓMO TE LLAMAS?</Text>
            <Text style={styles.stepSubtitle}>Personaliza tu experiencia</Text>
            <TextInput
              style={styles.mainInput}
              placeholder="Tu nombre"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </Animated.View>
        )}

        {/* STEP 2: Categories */}
        {step === 2 && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>TUS CATEGORÍAS</Text>
            <Text style={styles.stepSubtitle}>Crea las etiquetas para tus gastos (puedes añadir más después)</Text>

            <View style={styles.rowInput}>
              <TextInput
                style={[styles.mainInput, { flex: 1 }]}
                placeholder="Ej. Alimentación"
                placeholderTextColor={theme.colors.textSecondary}
                value={catName}
                onChangeText={setCatName}
              />
              <TouchableOpacity style={styles.addRowBtn} onPress={addLocalCategory}>
                <Text style={styles.addRowBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.miniLabel}>ICONO</Text>
            <View style={styles.iconGrid}>
              {ICONS.map(icon => (
                <TouchableOpacity key={icon} style={[styles.iconOption, selectedIcon === icon && styles.iconOptionSelected]} onPress={() => setSelectedIcon(icon)}>
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.miniLabel}>COLOR</Text>
            <View style={styles.colorGrid}>
              {COLORS.map(color => (
                <TouchableOpacity key={color} style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]} onPress={() => setSelectedColor(color)} />
              ))}
            </View>

            {categories.length > 0 && (
              <View style={styles.listPreview}>
                {categories.map(c => (
                  <View key={c.id} style={[styles.chipPreview, { borderColor: c.color }]}>
                    <Text style={{ color: theme.colors.text, fontSize: 12 }}>{c.icon} {c.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* STEP 3: Fixed Expenses */}
        {step === 3 && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>GASTOS FIJOS</Text>
            <Text style={styles.stepSubtitle}>Añade tus gastos mensuales que no varían (opcional)</Text>

            <View style={styles.rowInput}>
              <TextInput
                style={[styles.mainInput, { flex: 1 }]}
                placeholder="Nombre (ej. Alquiler)"
                placeholderTextColor={theme.colors.textSecondary}
                value={fixedName}
                onChangeText={setFixedName}
              />
            </View>
            <View style={styles.rowInput}>
              <TextInput
                style={[styles.mainInput, { flex: 1 }]}
                placeholder="Importe mensual €"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                value={fixedAmount}
                onChangeText={setFixedAmount}
              />
              <TouchableOpacity style={styles.addRowBtn} onPress={addLocalFixed}>
                <Text style={styles.addRowBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {fixedList.length > 0 && (
              <View style={styles.fixedListPreview}>
                {fixedList.map(f => (
                  <View key={f.id} style={styles.fixedRow}>
                    <Text style={styles.fixedRowName}>{f.name}</Text>
                    <Text style={styles.fixedRowAmount}>{f.amount.toFixed(2)} €</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* STEP 4: Ready */}
        {step === 4 && (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <Text style={styles.readyEmoji}>✦</Text>
            <Text style={styles.stepTitle}>TODO LISTO, {name.toUpperCase()}</Text>
            <Text style={styles.stepSubtitle}>
              {`${categories.length} categorías · ${fixedList.length} gastos fijos\n\nYa puedes empezar a registrar tus finanzas.`}
            </Text>
          </Animated.View>
        )}

      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomRow}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>← ATRÁS</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.nextBtn, step === 1 && { flex: 1 }]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{step === TOTAL_STEPS ? 'COMENZAR →' : 'SIGUIENTE →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l, paddingTop: 60, paddingBottom: 40 },
  brandTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', letterSpacing: 4, marginBottom: theme.spacing.l },
  progressTrack: { height: 2, backgroundColor: theme.colors.border, borderRadius: 1, marginBottom: theme.spacing.s },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 1 },
  stepCount: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'right', marginBottom: theme.spacing.xl },
  content: { flexGrow: 1, paddingBottom: 20 },
  stepContainer: { flex: 1 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: theme.spacing.xl },
  avatarText: { ...theme.typography.h2, color: theme.colors.primary },
  stepTitle: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center', letterSpacing: 2, marginBottom: theme.spacing.s },
  stepSubtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl, lineHeight: 20 },
  mainInput: { ...theme.typography.body, color: theme.colors.text, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: theme.spacing.s, marginBottom: theme.spacing.l },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addRowBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.l },
  addRowBtnText: { color: '#FFF', fontSize: 22, fontWeight: '300' },
  miniLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 1, marginBottom: theme.spacing.s },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.l },
  iconOption: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
  iconOptionSelected: { borderWidth: 2, borderColor: theme.colors.primary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: theme.spacing.xl },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFF' },
  listPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipPreview: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  fixedListPreview: { marginTop: theme.spacing.m },
  fixedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.s, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  fixedRowName: { ...theme.typography.body, color: theme.colors.text },
  fixedRowAmount: { ...theme.typography.body, color: theme.colors.textSecondary },
  readyEmoji: { fontSize: 48, textAlign: 'center', marginBottom: theme.spacing.xl, color: theme.colors.primary },
  bottomRow: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.l },
  backBtn: { paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.l, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  backBtnText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  nextBtn: { flex: 2, paddingVertical: theme.spacing.m, alignItems: 'center', borderRadius: theme.borderRadius.m, backgroundColor: theme.colors.text },
  nextBtnText: { ...theme.typography.body, color: theme.colors.background, fontWeight: '600', letterSpacing: 1 },
});
