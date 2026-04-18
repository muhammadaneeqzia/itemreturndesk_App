import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const EXIT_SCALE_TO = 2.65;
const EXIT_DURATION = 480;

/**
 * @param {object} props
 * @param {boolean} [props.exiting] — when true, plays zoom-out + fade end animation (from App.js timing)
 */
const SplashScreen = ({ exiting = false }) => {
  const { colors } = useTheme();

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

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const iconExitScale = useRef(new Animated.Value(1)).current;
  const iconExitOpacity = useRef(new Animated.Value(1)).current;
  const footerExitOpacity = useRef(new Animated.Value(1)).current;

  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;

  const exitStarted = useRef(false);

  useEffect(() => {
    if (!exiting) exitStarted.current = false;
  }, [exiting]);

  useEffect(() => {
    const bubbleAnimations = bubbles.map((bubble) => {
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

    Animated.parallel(bubbleAnimations).start();

    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 12,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 900,
      delay: 400,
      useNativeDriver: true,
    }).start();

    const createDotAnimation = (dot, delay) =>
      Animated.loop(
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

    createDotAnimation(dot1Scale, 0).start();
    createDotAnimation(dot2Scale, 200).start();
    createDotAnimation(dot3Scale, 400).start();
  }, []);

  useEffect(() => {
    if (!exiting || exitStarted.current) return;
    exitStarted.current = true;

    Animated.parallel([
      Animated.timing(iconExitScale, {
        toValue: EXIT_SCALE_TO,
        duration: EXIT_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(iconExitOpacity, {
        toValue: 0,
        duration: EXIT_DURATION - 40,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(footerExitOpacity, {
        toValue: 0,
        duration: 320,
        delay: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [exiting, iconExitScale, iconExitOpacity, footerExitOpacity]);

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
          <Animated.View
            style={{
              transform: [{ scale: iconExitScale }],
              opacity: iconExitOpacity,
            }}
          >
            <View style={[styles.logoTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
                accessibilityLabel="Item Return Desk app icon"
              />
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ opacity: footerExitOpacity }}>
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
  /** App icon fills this tile — same outer size as before so entrance / exit animations match */
  logoTile: {
    width: 120,
    height: 120,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
