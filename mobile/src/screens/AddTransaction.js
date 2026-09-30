import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

export const AddTransaction = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { addTransaction, categories } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Introduce un importe válido');
      return;
    }
    addTransaction({
      amount: parseFloat(amount),
      note: note.trim(),
      type,
      category: selectedCategory?.name || 'Sin categoría',
      categoryColor: selectedCategory?.color,
    });
    Alert.alert('✓ Guardado', 'Transacción añadida correctamente', [
      { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>NUEVA TRANSACCIÓN</Text>

      <Animated.View entering={FadeInUp.delay(100)} style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>GASTO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>INGRESO</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.inputContainer}>
        <Text style={styles.label}>IMPORTE</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00 €"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300)} style={styles.inputContainer}>
        <Text style={styles.label}>NOTA (OPCIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="¿En qué lo gastaste?"
          placeholderTextColor={theme.colors.textSecondary}
          value={note}
          onChangeText={setNote}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.inputContainer}>
        <Text style={styles.label}>CATEGORÍA</Text>
        {categories.length === 0 ? (
          <TouchableOpacity
            style={styles.categorySelect}
            onPress={() => navigation.navigate('Categories')}
          >
            <Text style={styles.categorySelectText}>Crea primero una categoría →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  selectedCategory?.id === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '20' }
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={styles.catChipText}>{cat.icon} {cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>GUARDAR TRANSACCIÓN</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: theme.spacing.xl,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: 4,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    borderRadius: theme.borderRadius.m,
  },
  typeButtonActive: { backgroundColor: theme.colors.border },
  typeText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  typeTextActive: { color: theme.colors.text, fontWeight: '600' },
  inputContainer: { marginBottom: theme.spacing.xl },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    letterSpacing: 1,
  },
  amountInput: {
    ...theme.typography.h1,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.s,
  },
  textInput: {
    ...theme.typography.body,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.s,
  },
  categorySelect: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  categorySelectText: { ...theme.typography.body, color: theme.colors.primary },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  catChipText: { ...theme.typography.caption, color: theme.colors.text },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    borderRadius: theme.borderRadius.m,
    marginTop: 'auto',
    marginBottom: theme.spacing.xxl,
  },
  saveButtonText: {
    ...theme.typography.body,
    color: '#FFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
});
