import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radii, space, shadowSoft } from '../../utils';

const StatCell = ({ label, value, accentColor, colors }) => (
  <View
    style={[
      styles.cell,
      { backgroundColor: colors.surface, borderColor: colors.border },
      shadowSoft,
    ]}
  >
    <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={2}>
      {label}
    </Text>
    <View style={[styles.accent, { backgroundColor: accentColor }]} />
  </View>
);

/**
 * Three compact stat tiles for dashboard summaries.
 */
const StatStrip = ({ colors, lostItems, foundItems, myPosts }) => (
  <View style={styles.row}>
    <StatCell label="Lost items" value={lostItems} accentColor={colors.primary} colors={colors} />
    <StatCell label="Found items" value={foundItems} accentColor={colors.success} colors={colors} />
    <StatCell label="My posts" value={myPosts} accentColor={colors.secondary} colors={colors} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  cell: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  accent: {
    marginTop: space.sm,
    height: 3,
    width: 28,
    borderRadius: 2,
  },
});

export default StatStrip;
