import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radii, space, shadowSoft } from '../../utils';
import AppIcon from '../AppIcon';

/**
 * Large tappable tile for primary navigation (e.g. Lost / Found).
 * @param {{ width: number, height: number, colors: object, iconName: string, iconColor: string, title: string, subtitle: string, tint: string, onPress: () => void }} props
 */
const QuickAccessTile = ({ width, height, colors, iconName, iconColor, title, subtitle, tint, onPress }) => (
  <TouchableOpacity
    style={[
      styles.tile,
      {
        width,
        height,
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      shadowSoft,
    ]}
    onPress={onPress}
    activeOpacity={0.72}
  >
    <View style={[styles.iconWrap, { backgroundColor: tint }]}>
      <AppIcon name={iconName} size={34} color={iconColor} />
    </View>
    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    <View style={styles.chevronWrap}>
      <AppIcon name="chevronForward" size={22} color={colors.primary} style={{ opacity: 0.85 }} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  chevronWrap: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
  },
});

export default QuickAccessTile;
