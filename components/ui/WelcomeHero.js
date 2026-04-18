import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, space } from '../../utils/layout';

/**
 * Gradient welcome header with soft decorative shapes.
 */
const WelcomeHero = ({ colors, userName, tagline = 'Find or report lost items on campus' }) => {
  const gradient = colors.heroGradient || [colors.primary, colors.primaryDark];

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.glow} pointerEvents="none" />
      <View style={[styles.orb, styles.orbTop]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbBottom]} pointerEvents="none" />

      <Text style={styles.kicker}>Welcome back</Text>
      <Text style={styles.name}>{userName}!</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radii.xxl,
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  orbTop: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },
  orbBottom: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -10,
  },
  kicker: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  name: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: space.sm,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '92%',
  },
});

export default WelcomeHero;
