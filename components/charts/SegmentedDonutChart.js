import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { pieSlicePath, START_ANGLE } from './chartMath';
import { space } from '../../utils/layout';

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 78;
const R_INNER = 48;

/**
 * Donut-style chart: pie slices + inner circle (hole).
 * @param {{ label: string, value: number, color: string }[]} props.segments
 * @param {object} props.colors — useTheme().colors
 */
const SegmentedDonutChart = ({ segments, colors }) => {
  const total = useMemo(() => segments.reduce((s, x) => s + Math.max(0, x.value), 0), [segments]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [segments, total, scaleAnim, fadeAnim]);

  const { slices, fullCircle } = useMemo(() => {
    if (total <= 0) return { slices: [], fullCircle: false };
    const nonZero = segments.filter((s) => s.value > 0);
    if (nonZero.length === 1 && nonZero[0].value >= total) {
      return { slices: [{ ...nonZero[0], path: null }], fullCircle: true };
    }
    let angle = START_ANGLE;
    const slices = nonZero.map((s) => {
      const sweep = (s.value / total) * Math.PI * 2;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return {
        ...s,
        path: pieSlicePath(CX, CY, R_OUTER, start, end),
      };
    });
    return { slices, fullCircle: false };
  }, [segments, total]);

  const empty = total <= 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.svgBox}>
        <Animated.View
          style={[
            styles.svgInner,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {!empty ? (
              <G>
                {fullCircle ? (
                  <Circle cx={CX} cy={CY} r={R_OUTER} fill={slices[0].color} opacity={0.94} />
                ) : (
                  slices.map((s, idx) => (
                    <Path key={`${s.label}-${idx}`} d={s.path} fill={s.color} opacity={0.94} />
                  ))
                )}
                <Circle cx={CX} cy={CY} r={R_INNER} fill={colors.surface} stroke={colors.border} strokeWidth={1} />
              </G>
            ) : (
              <G>
                <Circle cx={CX} cy={CY} r={R_OUTER} fill={colors.surfaceMuted || colors.border} opacity={0.45} />
                <Circle cx={CX} cy={CY} r={R_INNER} fill={colors.surface} />
              </G>
            )}
          </Svg>
        </Animated.View>

        <View style={styles.centerLabels} pointerEvents="none">
          <Text style={[styles.centerValue, { color: colors.text }]}>{empty ? '—' : total}</Text>
          <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>total</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map((s) => (
          <View key={s.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]} numberOfLines={1}>
              {s.label}
            </Text>
            <Text style={[styles.legendVal, { color: colors.text }]}>{s.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  svgBox: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgInner: {
    position: 'absolute',
  },
  centerLabels: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  legend: {
    marginTop: space.md,
    width: '100%',
    maxWidth: 280,
    gap: space.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  legendVal: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SegmentedDonutChart;
