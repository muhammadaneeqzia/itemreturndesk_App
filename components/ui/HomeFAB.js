import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import AppIcon from '../AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { shadowMedium } from '../../utils';

/**
 * Primary floating action for creating a post.
 */
const HomeFAB = ({ colors, onPress, style }) => {
  const gradient = colors.heroGradient || [colors.primary, colors.primaryDark];

  return (
    <TouchableOpacity
      style={[styles.wrap, shadowMedium, style]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Create new post"
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.innerRing}>
          <AppIcon name="add" size={30} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    zIndex: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeFAB;
