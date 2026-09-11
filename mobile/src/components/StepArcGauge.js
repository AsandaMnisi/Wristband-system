import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';

const STEP_GOAL = 10000;

/**
 * StepArcGauge
 *
 * Dynamically scalable circular arc gauge with:
 * - Proportional track stroke width
 * - 3D depth shadow ring
 * - Accent progress arc with specular highlight
 * - Scaled center step readout
 */
export default function StepArcGauge({ steps = 0, goal = STEP_GOAL, size = 126, isAnomaly = false }) {
  const animatedSteps = useRef(new Animated.Value(0)).current;
  const displaySteps  = useRef(0);

  useEffect(() => {
    Animated.timing(animatedSteps, {
      toValue:         steps,
      duration:        600,
      useNativeDriver: false,
    }).start();
    animatedSteps.addListener(({ value }) => { displaySteps.current = Math.round(value); });
    return () => animatedSteps.removeAllListeners();
  }, [steps]);

  const strokeWidth    = Math.max(6, Math.round(size * 0.08));
  const r              = (size / 2) - strokeWidth - 2;
  const cx             = size / 2;
  const cy             = size / 2;
  const circumference  = 2 * Math.PI * r;
  const progress       = Math.min(steps / goal, 1);
  const arcLength      = circumference * progress;
  const arcGap         = circumference - arcLength;
  const accent         = isAnomaly ? COLORS.red : COLORS.cyan;

  const countFontSize  = Math.max(13, Math.round(size * 0.15));
  const labelFontSize  = Math.max(7, Math.round(size * 0.065));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* ── Background Track 3D Shadow ─────────────────────────────── */}
        <Circle
          cx={cx + 1.5}
          cy={cy + 2}
          r={r}
          stroke="#000000"
          strokeWidth={strokeWidth + 2}
          fill="none"
          opacity={0.5}
        />

        {/* ── Background Track ─────────────────────────────────────────── */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#1b1d24"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* ── Inner Cavity ─────────────────────────────────────────────── */}
        <Circle
          cx={cx}
          cy={cy}
          r={r - strokeWidth / 2 - 1}
          stroke="#252832"
          strokeWidth={1}
          fill="#0c0d11"
        />

        {/* ── Progress Arc (start at 12 o'clock) ────────────────────────── */}
        <G rotation={-90} origin={`${cx},${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${arcGap}`}
            strokeLinecap="round"
          />
          {/* Subtle Inner Arc Highlight */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={accent === COLORS.cyan ? '#d0ffff' : '#ffb3b3'}
            strokeWidth={strokeWidth * 0.3}
            fill="none"
            strokeDasharray={`${arcLength * 0.35} ${circumference}`}
            strokeLinecap="round"
            opacity={0.7}
          />
        </G>
      </Svg>

      {/* ── Centre Readout ────────────────────────────────────────────── */}
      <View style={styles.centreText} pointerEvents="none">
        <Text style={[styles.stepCount, { color: accent, fontSize: countFontSize }]}>
          {steps.toLocaleString()}
        </Text>
        <Text style={[styles.stepLabel, { fontSize: labelFontSize }]}>STEPS</Text>
        <Text style={[styles.goalLabel, { fontSize: labelFontSize }]}>/ {goal.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  centreText: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontFamily:    FONTS.mono,
    fontWeight:    '800',
    letterSpacing: 0.5,
  },
  stepLabel: {
    fontFamily:    FONTS.mono,
    color:         '#767a88',
    letterSpacing: 1.5,
    marginTop:     1,
  },
  goalLabel: {
    fontFamily:    FONTS.mono,
    color:         '#484c56',
    letterSpacing: 0.5,
  },
});
