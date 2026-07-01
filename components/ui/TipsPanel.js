import React, { Fragment } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radii, space, shadowSoft } from '../../utils';
import AppIcon from '../AppIcon';

const TipRow = ({ iconName, iconColor, text, colors }) => (
  <View style={styles.tipRow}>
    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
      <AppIcon name={iconName} size={20} color={iconColor || colors.primary} />
    </View>
    <Text style={[styles.tipText, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

/**
 * Card grouping quick tips with icon chips.
 * @param {{ colors: object, tips: Array<{ iconName: string, iconColor?: string, text: string }> }} props
 */
const TipsPanel = ({ colors, tips }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: colors.surface, borderColor: colors.border },
      shadowSoft,
    ]}
  >
    {tips.map((t, i) => (
      <Fragment key={i}>
        <TipRow
          iconName={t.iconName}
          iconColor={t.iconColor}
          text={t.text}
          colors={colors}
        />
        {i < tips.length - 1 ? (
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        ) : null}
      </Fragment>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md - 2,
    gap: space.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
});

export default TipsPanel;
