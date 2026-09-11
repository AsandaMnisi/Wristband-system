import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

/**
 * AlertBanner
 *
 * A slide-down status banner that shows anomaly state.
 *
 * - Clear state  → cyan "ALL SYSTEMS NOMINAL" bar slides up (hidden)
 * - Anomaly      → red hazard banner slides down with anomaly_reason text
 *
 * Props:
 *   isAnomaly     – bool
 *   reason        – string | null   anomaly reason from server
 *   source        – 'server' | 'mock' | 'idle'
 *   lastSyncAt    – Date | null
 */
export default function AlertBanner({ isAnomaly = false, reason = null, source = 'idle', lastSyncAt = null }) {
  const slideAnim  = useRef(new Animated.Value(-90)).current;  // starts off-screen
  const flashAnim  = useRef(new Animated.Value(1)).current;
  const loopRef    = useRef(null);

  // Slide in/out
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue:         isAnomaly ? 0 : -90,
      tension:         80,
      friction:        9,
      useNativeDriver: false,
    }).start();
  }, [isAnomaly]);

  // Pulse text opacity on anomaly
  useEffect(() => {
    if (isAnomaly) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 0.4, duration: 500, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 1,   duration: 500, useNativeDriver: false }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      flashAnim.setValue(1);
    }
    return () => loopRef.current?.stop();
  }, [isAnomaly]);

  const timeStr = lastSyncAt
    ? lastSyncAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <Animated.View
      style={[
        styles.banner,
        { transform: [{ translateY: slideAnim }] },
        isAnomaly ? styles.bannerAnomaly : styles.bannerOk,
      ]}
    >
      {/* Icon + primary message */}
      <View style={styles.row}>
        <Animated.Text style={[styles.icon, { opacity: isAnomaly ? flashAnim : 1 }]}>
          {isAnomaly ? '🔴' : '🟢'}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.primary,
            { color: isAnomaly ? COLORS.textPrimary : COLORS.cyan },
            isAnomaly && { opacity: flashAnim },
          ]}
          numberOfLines={2}
        >
          {isAnomaly
            ? (reason ?? 'ANOMALY DETECTED — ALERT SUPERVISOR')
            : 'ALL SYSTEMS NOMINAL'}
        </Animated.Text>
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          SOURCE: <Text style={{ color: COLORS.orange }}>{source.toUpperCase()}</Text>
        </Text>
        <Text style={styles.meta}>SYNC: {timeStr}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
    borderBottomWidth: 2,
    zIndex:            99,
  },
  bannerAnomaly: {
    backgroundColor:  '#1E0000',
    borderBottomColor: COLORS.red,
  },
  bannerOk: {
    backgroundColor:  '#001A1A',
    borderBottomColor: COLORS.cyan,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  primary: {
    flex:          1,
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.sm,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      SPACING.xs,
  },
  meta: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         COLORS.textSecondary,
    letterSpacing: 1,
  },
});

