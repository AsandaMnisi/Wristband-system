import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/theme';

/**
 * WatchBezel3D
 *
 * 3D multi-layered tactical watch bezel with:
 * - Gunmetal knurled rim.
 * - Engraved tactical cardinal markings: 00, 15, 30, 45 + 60-second minute hash marks.
 * - Glowing 3D LED alert ring (Cyan = Nominal, Stark Red strobe = Anomaly).
 * - Inner shadow depression for recessed watch face depth.
 *
 * Props:
 *   size: number (default 290)
 *   isAnomaly: boolean
 *   children: ReactNode (watch face content)
 */
export default function WatchBezel3D({ size = 290, isAnomaly = false, children }) {
  const flashAnim = useRef(new Animated.Value(1)).current;
  const loopRef   = useRef(null);

  useEffect(() => {
    if (isAnomaly) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 0.2, duration: 250, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 1,   duration: 250, useNativeDriver: false }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    }
    return () => loopRef.current?.stop();
  }, [isAnomaly]);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const ledR   = outerR - 12;
  const innerR = ledR - 8;

  const accentColor = isAnomaly ? COLORS.red : COLORS.cyan;

  // Generate 60 minute tick lines around the bezel
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const tickLen = isMajor ? 8 : 4;
    const r1 = outerR - 4;
    const r2 = r1 - tickLen;
    const x1 = cx + r1 * Math.sin(angle);
    const y1 = cy - r1 * Math.cos(angle);
    const x2 = cx + r2 * Math.sin(angle);
    const y2 = cy - r2 * Math.cos(angle);
    ticks.push(
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isMajor ? '#9498a4' : '#454852'}
        strokeWidth={isMajor ? 1.5 : 1}
      />
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* ── Outer 3D Bezel Graphics Layer ─────────────────────────────── */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Bezel Metallic Rim Gradient */}
          <RadialGradient id="bezelRim" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="88%" stopColor="#25272e" />
            <Stop offset="94%" stopColor="#434752" />
            <Stop offset="98%" stopColor="#18191d" />
            <Stop offset="100%" stopColor="#0a0a0c" />
          </RadialGradient>
          {/* Inner Recess Shadow */}
          <RadialGradient id="innerRecess" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="85%" stopColor="#000000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
          </RadialGradient>
        </Defs>

        {/* Outer Metallic Ring */}
        <Circle cx={cx} cy={cy} r={outerR} fill="url(#bezelRim)" stroke="#525662" strokeWidth={1.5} />

        {/* Minute Ticks */}
        {ticks}

        {/* Cardinal Engraved Markings: 00, 15, 30, 45 */}
        <SvgText x={cx} y={22} fill={COLORS.orange} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">00</SvgText>
        <SvgText x={size - 18} y={cy + 3} fill="#a5a8b2" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">15</SvgText>
        <SvgText x={cx} y={size - 12} fill="#a5a8b2" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">30</SvgText>
        <SvgText x={18} y={cy + 3} fill="#a5a8b2" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">45</SvgText>

        {/* Chapter Ring Groove */}
        <Circle cx={cx} cy={cy} r={ledR + 4} fill="none" stroke="#121316" strokeWidth={3} />
      </Svg>

      {/* ── Glowing 3D LED Light Pipe Ring ────────────────────────────── */}
      <Animated.View
        style={[
          styles.ledRingWrapper,
          {
            width: size,
            height: size,
            opacity: flashAnim,
          },
        ]}
      >
        <Svg width={size} height={size}>
          {/* Glow Bloom Circle */}
          <Circle
            cx={cx}
            cy={cy}
            r={ledR}
            stroke={accentColor}
            strokeWidth={5}
            fill="none"
            opacity={0.85}
          />
          {/* Intense Core Line */}
          <Circle
            cx={cx}
            cy={cy}
            r={ledR}
            stroke="#ffffff"
            strokeWidth={1.2}
            fill="none"
            opacity={0.9}
          />
        </Svg>
      </Animated.View>

      {/* ── Inner Display Cavity with Recessed Shading ─────────────────── */}
      <View
        style={[
          styles.innerDisplayWell,
          {
            width: innerR * 2,
            height: innerR * 2,
            borderRadius: innerR,
            backgroundColor: '#0a0b0d',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  ledRingWrapper: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  innerDisplayWell: {
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
    borderWidth:    2,
    borderColor:    '#1c1d22',
    boxShadow:      'inset 0 4px 15px rgba(0,0,0,0.9)',
    zIndex:          2,
  },
});

