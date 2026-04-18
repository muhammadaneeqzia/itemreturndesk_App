import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { space } from '../../utils/layout';

/**
 * Section heading with optional right-side actions (e.g. link).
 */
const SectionTitleRow = ({ title, colors, right }) => (
  <View style={styles.row}>
    <View style={styles.titleBlock}>
      <View style={[styles.mark, { backgroundColor: colors.primary }]} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
    {right ? <View style={styles.right}>{right}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
    gap: space.sm,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flex: 1,
    minWidth: 0,
  },
  mark: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 0,
  },
});

export default SectionTitleRow;
