import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { space } from '../../utils/layout';

const BAR_MAX = 132;
const BAR_WIDTH = 36;
const GAP = 14;

/**
 * Vertical bars with staggered height animation.
 * @param {{ label: string, value: number, color: string }[]} props.data
 * @param {object} props.colors — useTheme().colors
 * @param {number} [props.height=156]
 */
const AnimatedBarChart = ({ data, colors, height = 156 }) => {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const progress = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    progress.forEach((p) => p.setValue(0));
    const animations = data.map((d, i) =>
      Animated.timing(progress[i], {
        toValue: d.value / maxVal,
        duration: 720,
        delay: i * 85,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, [data, maxVal, progress]);

  return (
    <View style={[styles.wrap, { height }]}>
      <View style={styles.barsRow}>
        {data.map((item, i) => {
          const h = progress[i].interpolate({
            inputRange: [0, 1],
            outputRange: [8, BAR_MAX],
          });
          return (
            <View key={item.label} style={styles.barCol}>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceMuted || colors.border }]}>
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      height: h,
                      backgroundColor: item.color,
                      shadowColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: GAP,
    flex: 1,
  },
  barCol: {
    alignItems: 'center',
    width: BAR_WIDTH + 8,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: BAR_MAX,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    minHeight: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  barValue: {
    marginTop: space.sm,
    fontSize: 15,
    fontWeight: '800',
  },
  barLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AnimatedBarChart;
