import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const FLASH_DURATION = 250; // ms per half-cycle

/**
 * BezelRing
 *
 * An SVG-rendered outer alert-light ring that wraps the wristband display.
 *
 * - Stable state  → calm Electric Cyan glow
 * - Anomaly state → high-frequency Stark Red flashing + red glow halo
 *
 * Props:
 *   isAnomaly  – bool
 *   size       – diameter of the ring in px (default 320)
 *   strokeWidth – ring line thickness (default 10)
 */
export default function BezelRing({ isAnomaly = false, size = 320, strokeWidth = 10 }) {
  const flashAnim  = useRef(new Animated.Value(1)).current;
  const loopRef    = useRef(null);
  const glowAnim   = useRef(new Animated.Value(0)).current; // 0 = cyan, 1 = red

  // ── Animate glow colour transition ───────────────────────────────────────
  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue:         isAnomaly ? 1 : 0,
      duration:        400,
      useNativeDriver: false,
    }).start();
  }, [isAnomaly]);

  // ── Drive flash loop on anomaly ──────────────────────────────────────────
  useEffect(() => {
    if (isAnomaly) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 0.15, duration: FLASH_DURATION, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 1,    duration: FLASH_DURATION, useNativeDriver: false }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    }
    return () => loopRef.current?.stop();
  }, [isAnomaly]);

  const r      = (size / 2) - strokeWidth / 2;
  const center = size / 2;

  // ── Interpolated glow shadow ─────────────────────────────────────────────
  const shadowColor = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [COLORS.cyan, COLORS.red],
  });

  return (
    <View style={styles.wrapper}>
      {/* Outer glow halo via Animated.View shadow */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            width:         size + 30,
            height:        size + 30,
            borderRadius:  (size + 30) / 2,
            shadowColor,
          },
        ]}
      />

      {/* SVG ring */}
      <Animated.View style={{ opacity: flashAnim }}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="cyanGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="85%"  stopColor={COLORS.cyanDim} stopOpacity="0" />
              <Stop offset="100%" stopColor={COLORS.cyan}    stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="redGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="85%"  stopColor={COLORS.redDim}  stopOpacity="0" />
              <Stop offset="100%" stopColor={COLORS.red}      stopOpacity="1" />
            </RadialGradient>
          </Defs>

          {/* Shadow ring (3D depth effect) */}
          <Circle
            cx={center + 2}
            cy={center + 3}
            r={r}
            stroke="#000"
            strokeWidth={strokeWidth + 4}
            fill="none"
            opacity={0.5}
          />

          {/* Main ring — cyan when safe, red when anomaly */}
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={isAnomaly ? COLORS.red : COLORS.cyan}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Inner bright highlight arc (12 o'clock, short) */}
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={isAnomaly ? COLORS.redBright : '#AAFFFF'}
            strokeWidth={strokeWidth * 0.3}
            fill="none"
            strokeDasharray={`${r * 0.5} ${r * Math.PI * 2}`}
            strokeDashoffset={-r * 0.3}
            opacity={0.7}
          />

          {/* Outer dim ring (bezel edge shadow) */}
          <Circle
            cx={center}
            cy={center}
            r={r + strokeWidth * 0.7}
            stroke={COLORS.metal}
            strokeWidth={2}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position:      'absolute',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius:  22,
    elevation:     0,
    backgroundColor: 'transparent',
  },
});

