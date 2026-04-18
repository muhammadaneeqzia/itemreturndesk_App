import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radii, space, shadowSoft } from '../../utils/layout';
import AppIcon from '../AppIcon';

/**
 * List row for a recent post with type badge and chevron.
 */
const RecentPostRow = ({ colors, post, onPress }) => {
  const isLost = post.type === 'Lost';
  const badgeBg = isLost ? colors.warning + '22' : colors.success + '22';
  const badgeColor = isLost ? colors.warning : colors.success;
  const barColor = isLost ? colors.warning : colors.success;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadowSoft,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.accentBar, { backgroundColor: barColor }]} />
      <View style={styles.inner}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{post.type}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {post.title}
          </Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>{post.time}</Text>
        </View>
        <AppIcon name="chevronForward" size={20} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: space.sm + 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md - 2,
    paddingRight: space.md,
    paddingLeft: space.sm + 2,
    gap: space.sm,
  },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RecentPostRow;
