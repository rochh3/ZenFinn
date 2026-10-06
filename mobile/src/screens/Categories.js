import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Alert } from '../utils/alert';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useData } from '../context/DataContext';
import { ICONS, COLORS } from '../config/defaults';
import { Screen, Card, Button, Field, Label, Sheet, EmptyState, Icon } from '../components/ui';

export const Categories = () => {
  const { t, theme } = useSettings();
  const styles = useStyles(makeStyles);
  const { activeCategories, addCategory, updateCategory, archiveCategory } = useData();

  const [sheet, setSheet] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);

  const openNew = () => { setEditingId(null); setName(''); setIcon(ICONS[0]); setColor(COLORS[0]); setSheet(true); };
  const openEdit = (c) => { setEditingId(c.id); setName(c.name); setIcon(c.icon); setColor(c.color); setSheet(true); };

  const save = async () => {
    if (!name.trim()) return Alert.alert(t('error'), t('required'));
    setBusy(true);
    try {
      const payload = { name: name.trim(), icon, color };
      if (editingId) await updateCategory(editingId, payload);
      else await addCategory(payload);
      setSheet(false);
    } catch (e) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const archive = () =>
    Alert.alert(t('delete'), t('archiveCategoryMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => { try { await archiveCategory(editingId); setSheet(false); } catch (e) { Alert.alert(t('error'), e.message); } } },
    ]);

  return (
    <Screen edges={[]}>
      <Text style={styles.hint}>{t('categoriesHint')}</Text>

      {activeCategories.length === 0 ? (
        <Card><EmptyState icon="pricetags-outline" title={t('createCategoryFirst')} actionLabel={t('newCategory')} onAction={openNew} /></Card>
      ) : (
        <View style={styles.grid}>
          {activeCategories.map((c) => (
            <View key={c.id} style={styles.cellWrap}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => openEdit(c)} style={[styles.cell, { borderColor: c.color + '66' }]}>
                <View style={[styles.iconBox, { backgroundColor: c.color + '26' }]}><Text style={{ fontSize: 26 }}>{c.icon}</Text></View>
                <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.cellWrap}>
            <TouchableOpacity activeOpacity={0.85} onPress={openNew} style={[styles.cell, styles.addCell]}>
              <Icon name="add" size={30} color={theme.colors.primary} />
              <Text style={[styles.name, { color: theme.colors.primary }]}>{t('newCategory')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Sheet visible={sheet} onClose={() => setSheet(false)} title={editingId ? t('editCategory') : t('newCategory')}>
        <Field label={t('categoryName')} value={name} onChangeText={setName} maxLength={24} autoFocus />
        <Label>{t('icon')}</Label>
        <View style={styles.pickRow}>
          {ICONS.map((i) => (
            <TouchableOpacity key={i} onPress={() => setIcon(i)} style={[styles.pick, icon === i && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={{ fontSize: 22 }}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Label style={{ marginTop: theme.spacing.l }}>{t('color')}</Label>
        <View style={styles.pickRow}>
          {COLORS.map((c) => (
            <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}>
              {color === c && <Icon name="checkmark" size={18} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>
        <Button title={t('save')} onPress={save} loading={busy} style={{ marginTop: theme.spacing.xl }} />
        {editingId && <Button title={t('delete')} variant="danger" onPress={archive} style={{ marginTop: theme.spacing.m }} />}
      </Sheet>
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  hint: { ...theme.font.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.l },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cellWrap: { width: '50%', padding: 6 },
  cell: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l, borderWidth: 1.5, padding: theme.spacing.l, alignItems: 'center', height: 124, justifyContent: 'center' },
  addCell: { borderStyle: 'dashed', borderColor: theme.colors.primary + '88', backgroundColor: 'transparent' },
  iconBox: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.s },
  name: { ...theme.font.body, color: theme.colors.text, fontWeight: '700' },
  pickRow: { flexDirection: 'row', flexWrap: 'wrap' },
  pick: { width: 48, height: 48, borderRadius: 14, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 6, marginBottom: 6 },
  swatch: { width: 38, height: 38, borderRadius: 19, marginRight: 10, marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: 3, borderColor: theme.colors.text },
});
