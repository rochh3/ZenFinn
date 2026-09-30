import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SYMBOLS = ['$', '€', '£', '¥', '₿', '¢'];

const MatrixDrop = ({ delay, duration, x, size, symbol }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const translateY = useSharedValue(-100);
  
  useEffect(() => {
    translateY.value = withDelay(
      delay, 
      withRepeat(
        withTiming(SCREEN_HEIGHT + 100, { duration, easing: Easing.linear }), 
        -1, 
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[
      styles.matrixSymbol, 
      animatedStyle, 
      { left: x, fontSize: size, opacity: Math.random() * 0.4 + 0.1 }
    ]}>
      {symbol}
    </Animated.Text>
  );
};

export const SplashScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  // Generate random matrix drops
  const drops = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 2000,
    duration: 1500 + Math.random() * 2000,
    size: 14 + Math.random() * 12,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000); // 3 seconds to enjoy the matrix effect
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Background Matrix Rain */}
      {drops.map(drop => (
        <MatrixDrop key={drop.id} {...drop} />
      ))}

      {/* Foreground Content */}
      <Animated.View entering={ZoomIn.duration(1200).springify().damping(12)} exiting={FadeOut.duration(500)} style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✦</Text>
        </View>
        <Animated.Text entering={FadeIn.delay(600).duration(1000)} style={styles.title}>
          ZENFIN
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(1200).duration(1000)} style={styles.subtitle}>
          Personal Finance Reimagined
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  matrixSymbol: {
    position: 'absolute',
    top: 0,
    color: theme.colors.primary,
    fontWeight: '300',
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  iconText: {
    fontSize: 40,
    color: theme.colors.text,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 32,
    letterSpacing: 8,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 3,
  },
});
