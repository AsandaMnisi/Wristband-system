import React, { useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, PanResponder, Platform, TouchableOpacity
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

/**
 * VitalSlider
 *
 * Robust, cross-platform vital slider.
 * On Web: utilizes high-fidelity HTML5 range input + quick +/- stepper buttons.
 * On Native: uses PanResponder with bounds clamping + quick +/- stepper buttons.
 */
const TRACK_H = 6;
const THUMB_R = 14;

export default function VitalSlider({
  label           = 'VITAL',
  unit            = '',
  value           = 0,
  min             = 0,
  max             = 100,
  step            = 1,
  onChange,
  dangerThreshold = null,
}) {
  const isDangerous = dangerThreshold !== null && value > dangerThreshold;
  const accent      = isDangerous ? COLORS.red : COLORS.cyan;

  const fraction = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handleStepDown = () => {
    const next = Math.max(min, Number((value - (step < 1 ? 0.5 : 5)).toFixed(1)));
    onChange?.(next);
  };

  const handleStepUp = () => {
    const next = Math.min(max, Number((value + (step < 1 ? 0.5 : 5)).toFixed(1)));
    onChange?.(next);
  };

  const displayValue = typeof value === 'number'
    ? (step < 1 ? value.toFixed(1) : Math.round(value).toString())
    : value;

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <Text style={styles.labelText}>{label}</Text>
        </View>

        {/* Stepper + Value display */}
        <View style={styles.valueRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={handleStepDown}
            activeOpacity={0.7}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>

          <Text style={[styles.valueText, { color: accent }]}>
            {displayValue}<Text style={styles.unitText}> {unit}</Text>
          </Text>

          <TouchableOpacity
            style={styles.stepBtn}
            onPress={handleStepUp}
            activeOpacity={0.7}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Track / Slider Control ────────────────────────────────────────── */}
      {Platform.OS === 'web' ? (
        <View style={styles.webSliderContainer}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange?.(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: accent,
              height: 24,
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      ) : (
        <NativeTrack
          min={min}
          max={max}
          step={step}
          value={value}
          fraction={fraction}
          accent={accent}
          dangerThreshold={dangerThreshold}
          onChange={onChange}
        />
      )}

      {/* ── Min / Max bounds & Limit label ───────────────────────────────── */}
      <View style={styles.boundRow}>
        <Text style={styles.bound}>{min}</Text>
        {dangerThreshold !== null && (
          <Text style={styles.limitBadge}>
            LIMIT: {dangerThreshold} {unit}
          </Text>
        )}
        <Text style={styles.bound}>{max}</Text>
      </View>
    </View>
  );
}

function NativeTrack({ min, max, step, fraction, accent, dangerThreshold, onChange }) {
  const trackWidth = useRef(0);

  const fractionToValue = useCallback((f) => {
    const raw = min + f * (max - min);
    const snapped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }, [min, max, step]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const w = trackWidth.current;
        if (!w) return;
        onChange?.(fractionToValue(locationX / w));
      },
      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        const w = trackWidth.current;
        if (!w) return;
        const clamped = Math.max(0, Math.min(w, locationX));
        onChange?.(fractionToValue(clamped / w));
      },
    })
  ).current;

  return (
    <View
      style={styles.trackWrapper}
      onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
      hitSlop={{ top: 16, bottom: 16 }}
    >
      <View style={styles.trackBg} />
      <View style={[styles.trackFill, { width: `${fraction * 100}%`, backgroundColor: accent }]} />
      <View
        style={[
          styles.thumb,
          {
            left: `${fraction * 100}%`,
            marginLeft: -THUMB_R,
            borderColor: accent,
            shadowColor: accent,
          },
        ]}
      />
      {dangerThreshold !== null && (
        <View
          style={[
            styles.thresholdLine,
            { left: `${((dangerThreshold - min) / (max - min)) * 100}%` },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:   COLORS.panelBg,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       COLORS.panelBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    marginVertical:    SPACING.xs,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: 3,
    marginRight:  6,
  },
  labelText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         COLORS.textSecondary,
    letterSpacing: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  stepBtn: {
    backgroundColor: COLORS.metal,
    width:           24,
    height:          24,
    borderRadius:    4,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     COLORS.metalLight,
  },
  stepBtnText: {
    color:      COLORS.textPrimary,
    fontFamily: FONTS.mono,
    fontSize:   14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  valueText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.lg,
    fontWeight:    '700',
    letterSpacing: 1,
    minWidth:      60,
    textAlign:     'right',
  },
  unitText: {
    fontFamily: FONTS.mono,
    fontSize:   FONTS.size.xs,
    color:      COLORS.textSecondary,
  },
  webSliderContainer: {
    paddingVertical: 2,
    width:           '100%',
  },
  trackWrapper: {
    height:         THUMB_R * 2,
    justifyContent: 'center',
    marginBottom:   4,
  },
  trackBg: {
    position:      'absolute',
    left:          0,
    right:         0,
    height:        TRACK_H,
    borderRadius:  TRACK_H / 2,
    backgroundColor: COLORS.metal,
  },
  trackFill: {
    position:     'absolute',
    left:         0,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position:        'absolute',
    width:           THUMB_R * 2,
    height:          THUMB_R * 2,
    borderRadius:    THUMB_R,
    borderWidth:     2,
    backgroundColor: COLORS.chassis,
  },
  thresholdLine: {
    position:        'absolute',
    width:           2,
    height:          THUMB_R * 2,
    backgroundColor: COLORS.orange,
    opacity:         0.8,
  },
  boundRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      2,
  },
  bound: {
    fontFamily: FONTS.mono,
    fontSize:   FONTS.size.xs,
    color:      COLORS.metalBright,
  },
  limitBadge: {
    fontFamily:    FONTS.mono,
    fontSize:      9,
    color:         COLORS.orange,
    letterSpacing: 1,
  },
});
