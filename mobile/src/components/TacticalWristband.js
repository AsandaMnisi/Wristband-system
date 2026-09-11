import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

import WatchStrap     from './WatchStrap';
import WatchCase      from './WatchCase';
import WatchBezel3D   from './WatchBezel3D';
import SapphireGlass  from './SapphireGlass';
import StepArcGauge   from './StepArcGauge';

export default function TacticalWristband({
  vitals,
  shiftSteps = 0,
  isAnomaly = false,
  isSyncing = false,
  minerId = 'MINER_001',
  viewMode3D = true,
  onEmergencyPress,
  onSensorPress,
}) {
  const accent = isAnomaly ? COLORS.red : COLORS.cyan;

  const perspectiveTransform = viewMode3D ? [
    { perspective: 1100 },
    { rotateX: '9deg' },
    { rotateY: '-4deg' },
    { scale: 0.96 },
  ] : [];

  return (
    <View style={styles.outerWrapper}>
      <View style={[styles.tableShadow, viewMode3D && styles.tableShadow3D]} />

      <View style={[styles.watchAssembly, { transform: perspectiveTransform }]}>
        <WatchStrap position="top" width={175} height={78} />

        <WatchCase
          isAnomaly={isAnomaly}
          onEmergencyPress={onEmergencyPress}
          onSensorPress={onSensorPress}
        >
          <WatchBezel3D size={278} isAnomaly={isAnomaly}>
            <View style={styles.oledFace}>
              <View style={styles.oledHeader}>
                <Text style={styles.minerTag}>◈ {minerId}</Text>
                <View style={styles.beaconPill}>
                  <View style={[styles.beaconDot, { backgroundColor: isSyncing ? COLORS.orange : accent }]} />
                  <Text style={styles.beaconText}>{isSyncing ? 'SYNC' : 'LIVE'}</Text>
                </View>
              </View>

              <View style={styles.stepGaugeWrapper}>
                <StepArcGauge
                  steps={shiftSteps}
                  size={126}
                  isAnomaly={isAnomaly}
                />
              </View>

              <View style={styles.vitalStrip}>
                <View style={styles.vitalCell}>
                  <Text style={[styles.vitalIcon, { color: vitals.heart_rate > 130 ? COLORS.red : COLORS.cyan }]}>♥</Text>
                  <Text style={[styles.vitalVal, { color: vitals.heart_rate > 130 ? COLORS.red : COLORS.cyan }]}>
                    {vitals.heart_rate}
                  </Text>
                  <Text style={styles.vitalUnit}>BPM</Text>
                </View>

                <View style={styles.vitalSep} />

                <View style={styles.vitalCell}>
                  <Text style={[styles.vitalIcon, { color: COLORS.cyan }]}>~</Text>
                  <Text style={[styles.vitalVal, { color: COLORS.cyan }]}>
                    {vitals.breathing_rate}
                  </Text>
                  <Text style={styles.vitalUnit}>RPM</Text>
                </View>

                <View style={styles.vitalSep} />

                <View style={styles.vitalCell}>
                  <Text style={[styles.vitalIcon, { color: vitals.skin_temp > 38.5 ? COLORS.red : COLORS.cyan }]}>◉</Text>
                  <Text style={[styles.vitalVal, { color: vitals.skin_temp > 38.5 ? COLORS.red : COLORS.cyan }]}>
                    {vitals.skin_temp.toFixed(1)}
                  </Text>
                  <Text style={styles.vitalUnit}>°C</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { borderColor: accent }]}>
                <Text style={[styles.statusBadgeText, { color: accent }]}>
                  {isAnomaly ? '⚠ ANOMALY' : '✓ NOMINAL'}
                </Text>
              </View>
            </View>
          </WatchBezel3D>
        </WatchCase>

        <WatchStrap position="bottom" width={175} height={82} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position:       'relative',
  },
  tableShadow: {
    position:        'absolute',
    width:           280,
    height:          420,
    borderRadius:    60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    boxShadow:       '0 25px 60px rgba(0, 0, 0, 0.95)',
    zIndex:          0,
  },
  tableShadow3D: {
    transform:       [{ perspective: 1100 }, { rotateX: '9deg' }, { rotateY: '-4deg' }, { translateY: 15 }, { scale: 0.94 }],
  },
  watchAssembly: {
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:          2,
  },

  oledFace: {
    width:          '100%',
    height:         '100%',
    backgroundColor:'#07080a',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  oledHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    width:          '90%',
    paddingTop:     4,
  },
  minerTag: {
    fontFamily:    FONTS.mono,
    fontSize:      8.5,
    color:         '#868a96',
    letterSpacing: 1.5,
    fontWeight:    '700',
  },
  beaconPill: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3.5,
  },
  beaconDot: {
    width:        5,
    height:       5,
    borderRadius: 2.5,
    boxShadow:    '0 0 5px currentColor',
  },
  beaconText: {
    fontFamily:    FONTS.mono,
    fontSize:      7.5,
    color:         '#868a96',
    letterSpacing: 1,
    fontWeight:    '700',
  },

  stepGaugeWrapper: {
    alignItems:     'center',
    justifyContent: 'center',
    marginVertical: -4,
  },

  vitalStrip: {
    flexDirection:    'row',
    width:            '88%',
    backgroundColor:  '#0f1116',
    borderRadius:     6,
    borderWidth:      1,
    borderColor:      '#1f2129',
    paddingVertical:  4,
    paddingHorizontal: 4,
    alignItems:       'center',
  },
  vitalCell: {
    flex:        1,
    alignItems:  'center',
  },
  vitalIcon: {
    fontSize: 9,
    lineHeight: 11,
  },
  vitalVal: {
    fontFamily: FONTS.mono,
    fontSize:   14,
    fontWeight: '800',
  },
  vitalUnit: {
    fontFamily: FONTS.mono,
    fontSize:   6.5,
    color:      '#717582',
    letterSpacing: 0.5,
  },
  vitalSep: {
    width:           1,
    height:          18,
    backgroundColor: '#232630',
  },

  statusBadge: {
    borderWidth:       1,
    borderRadius:      10,
    paddingVertical:   2,
    paddingHorizontal: 12,
    marginBottom:      2,
  },
  statusBadgeText: {
    fontFamily:    FONTS.mono,
    fontSize:      8,
    fontWeight:    '800',
    letterSpacing: 1.5,
  },
});
