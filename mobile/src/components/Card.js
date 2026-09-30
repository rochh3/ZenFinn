import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export const Card = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginVertical: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
