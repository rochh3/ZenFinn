import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';

export const CalendarScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { transactions } = useApp();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Build calendar grid for current month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7; // Monday first

  const MONTH_NAMES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Get transactions for selected day
  const formatDateKey = (d) => {
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const selectedKey = formatDateKey(selectedDate);
  const dayTransactions = transactions.filter(tx => tx.date === selectedKey);

  // Has transactions indicator
  const hasTransactions = (day) => {
    if (!day) return false;
    const d = new Date(year, month, day);
    const key = formatDateKey(d);
    return transactions.some(tx => tx.date === key);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map(d => (
          <Text key={d} style={styles.dayNameHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarCells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
          const hasTx = hasTransactions(day);

          return (
            <TouchableOpacity
              key={day}
              style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday]}
              onPress={() => setSelectedDate(new Date(year, month, day))}
            >
              <Text style={[styles.cellText, isSelected && styles.cellTextSelected, isToday && !isSelected && styles.cellTextToday]}>
                {day}
              </Text>
              {hasTx && <View style={[styles.dot, isSelected && { backgroundColor: '#FFF' }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day transactions */}
      <View style={styles.txSection}>
        <Text style={styles.txSectionTitle}>
          {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]} — MOVIMIENTOS
        </Text>

        {dayTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Sin movimientos este día</Text>
        ) : (
          <FlatList
            data={dayTransactions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 60)}>
                <View style={styles.txRow}>
                  <View>
                    <Text style={styles.txName}>{item.note || item.category}</Text>
                    <Text style={styles.txCat}>{item.category}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: item.type === 'income' ? theme.colors.success : theme.colors.text }]}>
                    {item.type === 'income' ? '+' : '-'}{parseFloat(item.amount).toFixed(2)} €
                  </Text>
                </View>
              </Animated.View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.l },
  navBtn: { padding: theme.spacing.m },
  navBtnText: { color: theme.colors.text, fontSize: 28, fontWeight: '200' },
  monthTitle: { ...theme.typography.h2, color: theme.colors.text, letterSpacing: 3 },
  dayNamesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing.s },
  dayNameHeader: { ...theme.typography.caption, color: theme.colors.textSecondary, width: '14.28%', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.l, borderTopWidth: 1, borderTopColor: theme.colors.border },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  cellSelected: { backgroundColor: theme.colors.primary, borderRadius: 4 },
  cellToday: { borderRadius: 4, borderWidth: 1, borderColor: theme.colors.primary },
  cellText: { ...theme.typography.caption, color: theme.colors.text, fontSize: 13 },
  cellTextSelected: { color: '#FFF', fontWeight: '600' },
  cellTextToday: { color: theme.colors.primary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.primary, marginTop: 2 },
  txSection: { flex: 1 },
  txSectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 2, marginBottom: theme.spacing.m },
  emptyText: { ...theme.typography.caption, color: theme.colors.textSecondary, opacity: 0.5, marginTop: theme.spacing.m },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  txName: { ...theme.typography.body, color: theme.colors.text },
  txCat: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 3 },
  txAmount: { ...theme.typography.h2 },
});
