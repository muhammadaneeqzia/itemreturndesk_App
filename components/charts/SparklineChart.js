import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { space } from '../../utils/layout';

const PAD = 10;
const DEFAULT_H = 96;


const SparklineChart = ({ values, colors, lineColor, title, width: wProp, height = DEFAULT_H }) => {
  const width = wProp ?? 280;
  const chartW = width - PAD * 2;
  const chartH = height - PAD * 2;
  const strokeColor = lineColor || colors.primary;

  const { linePath, areaPath, minV, maxV } = useMemo(() => {
    const v = values.length >= 2 ? values : [0, 0, 0, 0, 0];
    const min = Math.min(...v);
    const max = Math.max(...v);
    const span = max - min || 1;
    const n = v.length;
    const pts = v.map((val, i) => {
      const x = PAD + (i / (n - 1)) * chartW;
      const y = PAD + chartH - ((val - min) / span) * chartH;
      return { x, y };
    });
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const baseY = PAD + chartH;
    const area = `${line} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
    return { linePath: line, areaPath: area, minV: min, maxV: max };
  }, [values, chartW, chartH]);

  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    fade.setValue(0);
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        delay: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [values, progress, fade]);

  const gradientIdRef = useRef(`spark_${Math.random().toString(36).slice(2, 10)}`);
  const gradientId = gradientIdRef.current;

  return (
    <View style={[styles.wrap, { width }]}>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
      <Animated.View style={{ opacity: fade, transform: [{ translateY: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 0],
      }) }] }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${gradientId})`} />
          <Path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textTertiary }]}>low {minV}</Text>
        <Text style={[styles.meta, { color: colors.textTertiary }]}>high {maxV}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: space.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default SparklineChart;
