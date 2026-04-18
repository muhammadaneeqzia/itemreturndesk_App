import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radii, space } from '../../utils/layout';

/**
 * Compact two-option segmented control.
 */
const PillSegmented = ({ colors, value, onChange, options }) => {
  const muted = colors.surfaceMuted || colors.background;

  return (
    <View style={[styles.track, { backgroundColor: muted }]}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.segment,
              active && { backgroundColor: colors.surface },
              active && styles.segmentActive,
            ]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.textTertiary },
                active && styles.labelActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radii.full,
    padding: 3,
  },
  segment: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    minWidth: 44,
    alignItems: 'center',
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
});

export default PillSegmented;
