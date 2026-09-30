import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Modal } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

const ICONS = ['🛒', '🚗', '🏠', '🎟️', '💊', '✈️', '📱', '🎓', '🍽️', '💡'];
const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

export const Categories = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { categories, addCategory, deleteCategory } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛒');
  const [selectedColor, setSelectedColor] = useState('#10B981');

  const handleAdd = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Introduce un nombre para la categoría');
      return;
    }
    addCategory({ name: newName.trim().toUpperCase(), icon: selectedIcon, color: selectedColor });
    setNewName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CATEGORÍAS</Text>
      <Text style={styles.subtitle}>GESTIONA TUS ETIQUETAS</Text>

      {categories.length === 0 ? (
        <Text style={styles.emptyText}>Crea tu primera categoría con el botón +</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View entering={SlideInRight.delay(index * 100).springify().damping(12)} style={styles.cardContainer}>
              <TouchableOpacity
                style={[styles.categoryCard, { borderTopColor: item.color, borderTopWidth: 2 }]}
                onLongPress={() =>
                  Alert.alert('Eliminar', `¿Eliminar "${item.name}"?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteCategory(item.id) }
                  ])
                }
              >
                <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NUEVA CATEGORÍA</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de categoría"
              placeholderTextColor={theme.colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.modalLabel}>ICONO</Text>
            <View style={styles.iconGrid}>
              {ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, selectedIcon === icon && styles.iconOptionSelected]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>COLOR</Text>
            <View style={styles.colorGrid}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l },
  header: { ...theme.typography.caption, color: theme.colors.primary, marginTop: theme.spacing.xxl, textAlign: 'center', letterSpacing: 4 },
  subtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  list: { paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  cardContainer: { width: '48%', marginBottom: theme.spacing.m },
  categoryCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.l, padding: theme.spacing.l, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.m },
  icon: { fontSize: 24 },
  name: { ...theme.typography.caption, color: theme.colors.text, textAlign: 'center' },
  emptyText: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.xxl, opacity: 0.6 },
  fab: { position: 'absolute', bottom: theme.spacing.xl, right: theme.spacing.l, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: '#FFF', fontSize: 28, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: theme.spacing.xl, paddingBottom: 40 },
  modalTitle: { ...theme.typography.caption, color: theme.colors.text, textAlign: 'center', letterSpacing: 3, marginBottom: theme.spacing.xl },
  modalInput: { ...theme.typography.body, color: theme.colors.text, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: theme.spacing.s, marginBottom: theme.spacing.l },
  modalLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.s, letterSpacing: 1 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: theme.spacing.l },
  iconOption: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  iconOptionSelected: { borderWidth: 2, borderColor: theme.colors.primary },
  iconOptionText: { fontSize: 22 },
  colorGrid: { flexDirection: 'row', gap: 10, marginBottom: theme.spacing.xl },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFF' },
  modalButtons: { flexDirection: 'row', gap: theme.spacing.m },
  cancelBtn: { flex: 1, paddingVertical: theme.spacing.m, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.m },
  cancelBtnText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: theme.spacing.m, alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.m },
  saveBtnText: { ...theme.typography.caption, color: '#FFF', fontWeight: '600' },
});
