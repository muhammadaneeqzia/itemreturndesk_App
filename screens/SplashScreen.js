import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const { colors } = useTheme();
  
  // Create animated values for bubbles
  const bubbles = useRef(
    Array.from({ length: 15 }, (_, i) => {
      const initialSize = 20 + Math.random() * 60;
      const initialX = Math.random() * width;
      const initialY = Math.random() * height;
      return {
        id: i,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(0.3 + Math.random() * 0.4),
        duration: 3000 + Math.random() * 4000,
        initialSize,
        initialX,
        initialY,
      };
    })
  ).current;

  // Create animated value for logo/text
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // Loading dots animation
  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate bubbles
    const bubbleAnimations = bubbles.map((bubble) => {
      // Vertical movement - bubbles float up (using translateY)
      const moveY = Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.translateY, {
            toValue: -height - bubble.initialSize - 100,
            duration: bubble.duration,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.translateY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      // Horizontal movement - slight drift (using translateX)
      const driftAmount = 50 + Math.random() * 100;
      const moveX = Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.translateX, {
            toValue: driftAmount,
            duration: bubble.duration,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.translateX, {
            toValue: -driftAmount,
            duration: bubble.duration,
            useNativeDriver: true,
          }),
        ])
      );

      // Pulse animation - bubbles grow and shrink (using scale)
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.scale, {
            toValue: 1.3,
            duration: bubble.duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.scale, {
            toValue: 1,
            duration: bubble.duration / 2,
            useNativeDriver: true,
          }),
        ])
      );

      return Animated.parallel([moveY, moveX, pulse]);
    });

    // Start all bubble animations
    Animated.parallel(bubbleAnimations).start();

    // Animate logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Animate loading dots with staggered pulse
    const createDotAnimation = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1.5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dot1Scale, 0).start();
    createDotAnimation(dot2Scale, 200).start();
    createDotAnimation(dot3Scale, 400).start();
  }, []);

  const getBubbleColor = (index) => {
    const colorsArray = [
      colors.primary,
      colors.primaryLight,
      colors.secondary,
      colors.secondaryLight,
      colors.accent,
      colors.accentLight,
    ];
    return colorsArray[index % colorsArray.length];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Bubbles */}
      {bubbles.map((bubble, index) => {
        const bubbleColor = getBubbleColor(index);
        return (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.initialX,
                top: bubble.initialY,
                width: bubble.initialSize,
                height: bubble.initialSize,
                borderRadius: bubble.initialSize / 2,
                backgroundColor: bubbleColor,
                opacity: bubble.opacity,
                transform: [
                  { translateX: bubble.translateX },
                  { translateY: bubble.translateY },
                  { scale: bubble.scale },
                ],
              },
            ]}
          />
        );
      })}

      {/* Logo/App Name */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.textInverse }]}>
              IRD
            </Text>
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.appName,
            { color: colors.text, opacity: textOpacity },
          ]}
        >
          Item Return Desk
        </Animated.Text>

        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: textOpacity },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingDot,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: dot1Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                backgroundColor: colors.secondary,
                transform: [{ scale: dot2Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                backgroundColor: colors.accent,
                transform: [{ scale: dot3Scale }],
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
});

export default SplashScreen;

