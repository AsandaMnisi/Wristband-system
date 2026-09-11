import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export const HEAT_STROKE_VITALS = {
  heart_rate:     155,
  breathing_rate: 38,
  skin_temp:      39.2,
};

export default function HeatStrokeSwitch({ onTrigger, isActive = false, onReset }) {
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const coverAnim  = useRef(new Animated.Value(0)).current;
  const [coverOpen, setCoverOpen] = useState(false);

  const shakeChassis = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  8, duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  5, duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 50,  useNativeDriver: true }),
    ]).start();
  };

  const liftCover = () => {
    Animated.timing(coverAnim, {
      toValue:         1,
      duration:        300,
      useNativeDriver: false,
    }).start(() => setCoverOpen(true));
  };

  const closeCover = () => {
    setCoverOpen(false);
    Animated.timing(coverAnim, {
      toValue:         0,
      duration:        250,
      useNativeDriver: false,
    }).start();
  };

  const handleFirstPress = () => {
    if (navigator?.vibrate) navigator.vibrate(50);
    if (!coverOpen) {
      liftCover();
    }
  };

  const handleActivate = () => {
    if (navigator?.vibrate) navigator.vibrate([100, 50, 100]);
    shakeChassis();
    onTrigger?.();
  };

  const handleReset = () => {
    closeCover();
    onReset?.();
  };

  const coverHeight = coverAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [36, 0],
  });
  const coverOpacity = coverAnim.interpolate({
    inputRange:  [0, 0.6, 1],
    outputRange: [1, 0.3, 0],
  });

  return (
    <Animated.View style={[styles.outer, { transform: [{ translateX: shakeAnim }] }]}>
      <View style={styles.labelRow}>
        <View style={styles.warningStripe} />
        <Text style={styles.label}>⚠  HEAT STROKE OVERRIDE</Text>
        <View style={styles.warningStripe} />
      </View>

      <View style={styles.switchBody}>
        <TouchableOpacity onPress={handleFirstPress} activeOpacity={0.8}>
          <Animated.View style={[styles.cover, { height: coverHeight, opacity: coverOpacity }]}>
            <Text style={styles.coverText}>LIFT TO ARM</Text>
          </Animated.View>
        </TouchableOpacity>

        {isActive ? (
          <TouchableOpacity onPress={handleReset} style={[styles.btn, styles.btnReset]}>
            <Text style={styles.btnText}>■  CANCEL / RESET</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleActivate}
            style={[styles.btn, styles.btnArmed, !coverOpen && styles.btnHidden]}
            disabled={!coverOpen}
          >
            <Text style={styles.btnText}>● ACTIVATE HEAT STROKE</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: isActive ? COLORS.red : COLORS.metal }]} />
        <Text style={[styles.statusText, { color: isActive ? COLORS.red : COLORS.textSecondary }]}>
          {isActive ? 'CRITICAL VITALS ACTIVE' : 'SYSTEM NOMINAL'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth:     2,
    borderColor:     COLORS.redDim,
    borderRadius:    10,
    backgroundColor: '#1A0505',
    overflow:        'hidden',
    marginVertical:  SPACING.md,
  },
  labelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: '#2A0505',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  warningStripe: {
    flex:   1,
    height: 4,
    backgroundColor: COLORS.orange,
    borderRadius:    2,
    opacity:         0.7,
  },
  label: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         COLORS.orange,
    letterSpacing: 2,
    marginHorizontal: SPACING.sm,
  },
  switchBody: {
    padding: SPACING.md,
    gap:     SPACING.sm,
  },
  cover: {
    backgroundColor: COLORS.redDim,
    borderRadius:    6,
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },
  coverText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         '#FFA0A0',
    letterSpacing: 3,
  },
  btn: {
    borderRadius:   6,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnArmed: {
    backgroundColor: COLORS.red,
    borderWidth:     1,
    borderColor:     COLORS.redBright,
  },
  btnReset: {
    backgroundColor: COLORS.metal,
    borderWidth:     1,
    borderColor:     COLORS.metalBright,
  },
  btnHidden: {
    opacity: 0,
  },
  btnText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.sm,
    color:         COLORS.textPrimary,
    letterSpacing: 2,
    fontWeight:    '700',
  },
  statusRow: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: SPACING.md,
    paddingBottom:    SPACING.sm,
    gap:              SPACING.xs,
  },
  statusDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    letterSpacing: 2,
  },
});
