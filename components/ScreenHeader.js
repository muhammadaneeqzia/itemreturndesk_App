import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AppIcon from './AppIcon';
import { space, shadowSoft } from '../utils/layout';

/**
 * Consistent top bar: safe area, optional back, title / subtitle, optional right action.
 * @param {'stack'|'tab'} [props.variant='stack'] — stack: back + centered title; tab: title left (e.g. tab roots).
 */
const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  /** When false (stack only), left slot stays empty — e.g. tab root screens */
  showBack = true,
  rightElement,
  variant = 'stack',
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const topPad = Math.max(insets.top, space.sm);

  if (variant === 'tab') {
    return (
      <View
        style={[
          shadowSoft,
          {
            paddingTop: topPad,
            paddingBottom: space.sm,
            paddingHorizontal: space.md,
            backgroundColor: colors.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.tabRow}>
          <Text style={[styles.tabTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {rightElement ? <View style={styles.tabRight}>{rightElement}</View> : null}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        shadowSoft,
        {
          paddingTop: topPad,
          paddingBottom: space.sm,
          paddingHorizontal: space.md,
          backgroundColor: colors.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.stackRow}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.hit} hitSlop={12} accessibilityRole="button">
            <AppIcon name="arrowBack" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.hit} pointerEvents="none" />
        )}
        <View style={styles.titleBlock}>
          <Text style={[styles.stackTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.stackSubtitle, { color: colors.textTertiary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.rightSlot}>{rightElement}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  hit: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  stackTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
    width: '100%',
  },
  stackSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: space.sm,
  },
  tabTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tabRight: {
    flexShrink: 0,
  },
});

export default ScreenHeader;
