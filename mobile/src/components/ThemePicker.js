import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { THEME_LIST } from '../theme/themes';
import { Icon } from './ui';

/** Selector visual de tema: cada opción es una mini-vista previa con sus colores reales. */
export const ThemePicker = ({ value, onChange }) => {
  const styles = useStyles(makeStyles);
  const { theme } = useSettings();
  return (
    <View style={styles.grid}>
      {THEME_LIST.map((th) => {
        const active = th.id === value;
        return (
          <TouchableOpacity key={th.id} activeOpacity={0.85} onPress={() => onChange(th.id)} style={[styles.item, active && { borderColor: theme.colors.primary }]}>
            <View style={[styles.preview, { backgroundColor: th.colors.background, borderColor: th.colors.border }]}>
              <View style={[styles.bar, { backgroundColor: th.colors.surface, borderColor: th.colors.border }]} />
              <View style={styles.dots}>
                <View style={[styles.dot, { backgroundColor: th.colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: th.colors.success }]} />
                <View style={[styles.dot, { backgroundColor: th.colors.danger }]} />
              </View>
              {active && (
                <View style={[styles.check, { backgroundColor: theme.colors.primary }]}>
                  <Icon name="checkmark" size={14} color={theme.colors.onPrimary} />
                </View>
              )}
            </View>
            <Text style={[styles.name, active && { color: theme.colors.text, fontWeight: '700' }]}>{th.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  item: { width: '33.333%', padding: 6, borderRadius: theme.radius.m, borderWidth: 2, borderColor: 'transparent' },
  preview: { height: 64, borderRadius: theme.radius.s, borderWidth: 1, padding: 8, justifyContent: 'space-between' },
  bar: { height: 18, borderRadius: 6, borderWidth: 1 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  check: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { ...theme.font.caption, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6 },
});
