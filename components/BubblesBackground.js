import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const BubblesBackground = () => {
  const { colors } = useTheme();

  // Bubble 1 - Top Left
  const bubble1Scale = useRef(new Animated.Value(1)).current;
  const bubble1Opacity = useRef(new Animated.Value(0.15)).current;
  const bubble1TranslateY = useRef(new Animated.Value(0)).current;
  const bubble1TranslateX = useRef(new Animated.Value(0)).current;

  // Bubble 2 - Bottom Right
  const bubble2Scale = useRef(new Animated.Value(1)).current;
  const bubble2Opacity = useRef(new Animated.Value(0.15)).current;
  const bubble2TranslateY = useRef(new Animated.Value(0)).current;
  const bubble2TranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bubble 1 animations - Top Left
    const bubble1Animations = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bubble1Scale, {
              toValue: 1.2,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble1TranslateY, {
              toValue: -30,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble1TranslateX, {
              toValue: -20,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(bubble1Scale, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble1TranslateY, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble1TranslateX, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
    ]);

    // Bubble 2 animations - Bottom Right
    const bubble2Animations = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bubble2Scale, {
              toValue: 1.2,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(bubble2TranslateY, {
              toValue: 30,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(bubble2TranslateX, {
              toValue: 20,
              duration: 3500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(bubble2Scale, {
              toValue: 1,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(bubble2TranslateY, {
              toValue: 0,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(bubble2TranslateX, {
              toValue: 0,
              duration: 3500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
    ]);

    bubble1Animations.start();
    bubble2Animations.start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Bubble 1 - Top Left */}
      <Animated.View
        style={[
          styles.bubble,
          styles.bubble1,
          {
            backgroundColor: colors.primaryLight,
            opacity: bubble1Opacity,
            transform: [
              { scale: bubble1Scale },
              { translateX: bubble1TranslateX },
              { translateY: bubble1TranslateY },
            ],
          },
        ]}
      />

      {/* Bubble 2 - Bottom Right */}
      <Animated.View
        style={[
          styles.bubble,
          styles.bubble2,
          {
            backgroundColor: colors.secondaryLight,
            opacity: bubble2Opacity,
            transform: [
              { scale: bubble2Scale },
              { translateX: bubble2TranslateX },
              { translateY: bubble2TranslateY },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 1000,
  },
  bubble1: {
    width: 200,
    height: 200,
    top: -50,
    left: -50,
  },
  bubble2: {
    width: 250,
    height: 250,
    bottom: -80,
    right: -80,
  },
});

export default BubblesBackground;

