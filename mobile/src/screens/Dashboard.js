import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { t } from '../config/i18n';

export const Dashboard = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user, transactions, balance, deleteTransaction, language } = useApp();

  const formatBalance = (num) => {
    const sign = num >= 0 ? '' : '-';
    return `${sign}${Math.abs(num).toFixed(2)} €`;
  };

  const confirmDelete = (id) => {
    Alert.alert(t('deleteTxTitle', language), t('deleteTxMsg', language), [
      { text: t('cancel', language), style: 'cancel' },
      { text: t('delete', language), style: 'destructive', onPress: () => deleteTransaction(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('hello', language)}, {user?.name || 'Usuario'} 👋</Text>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>{t('currentBalance', language)}</Text>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? theme.colors.text : theme.colors.danger }]}>
          {formatBalance(balance)}
        </Text>
      </View>

      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Add')}
        >
          <Text style={styles.actionButtonText}>{t('addExpense', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.colors.success }]}
          onPress={() => navigation.navigate('Add')}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>{t('addIncome', language)}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('history', language)}</Text>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>{t('noTransactions', language)}</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(14)}>
              <TouchableOpacity onLongPress={() => confirmDelete(item.id)}>
                <Card style={styles.transactionCard}>
                  <View>
                    <Text style={styles.txName}>{item.note || item.category || 'Transacción'}</Text>
                    <Text style={styles.txDate}>{item.date}</Text>
                  </View>
                  <Text style={[
                    styles.txAmount,
                    { color: item.type === 'income' ? theme.colors.success : theme.colors.text }
                  ]}>
                    {item.type === 'income' ? '+' : '-'}{parseFloat(item.amount).toFixed(2)} €
                  </Text>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.l,
  },
  header: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xxl,
    textAlign: 'center',
    letterSpacing: 2,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  balanceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  balanceAmount: { ...theme.typography.h1 },
  rowButtons: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  actionButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    letterSpacing: 1,
    fontWeight: '600',
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    letterSpacing: 2,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    opacity: 0.6,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.l,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    borderColor: theme.colors.border,
    marginVertical: 0,
    paddingHorizontal: 0,
  },
  txName: { ...theme.typography.body, color: theme.colors.text },
  txDate: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 6 },
  txAmount: { ...theme.typography.h2 },
});
