import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radii, shadowSoft, space } from '../../utils';

/**
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {object} props.colors — theme palette from useTheme()
 * @param {React.ReactNode} props.children
 */
const ChartCard = ({ title, subtitle, colors, children, style }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: colors.surface, borderColor: colors.border },
      shadowSoft,
      style,
    ]}
  >
    {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
    {subtitle ? (
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    ) : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
    marginBottom: space.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: space.md,
    lineHeight: 18,
  },
});

export default ChartCard;
