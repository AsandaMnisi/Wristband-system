import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { usePedometer }     from '../hooks/usePedometer';
import { useTelemetrySync } from '../hooks/useTelemetrySync';

import WristbandModel3D from '../components/WristbandModel3D';
import TacticalWristband from '../components/TacticalWristband';
import AlertBanner      from '../components/AlertBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL  = process.env.EXPO_PUBLIC_API_URL ?? '';

function getWorkerId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlWorker = params.get('worker');
    if (urlWorker) return urlWorker;

    const stored = localStorage.getItem('wristband_worker_id');
    if (stored) return stored;

    const generated = `MINER_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    localStorage.setItem('wristband_worker_id', generated);
    return generated;
  } catch {
    return 'MINER_001';
  }
}
const DEFAULT_VITALS = {
  heart_rate:     72,
  breathing_rate: 16,
  skin_temp:      36.5,
};

export default function HUDScreen() {
  const [vitals, setVitals]                     = useState(DEFAULT_VITALS);
  const [heatStrokeActive, setHeatStrokeActive] = useState(false);
  const [viewMode3D, setViewMode3D]             = useState(true);
   const [isPoweredOn, setIsPoweredOn]           = useState(false);
   const [bandRemoved, setBandRemoved]           = useState(false);
   const [batteryLevel] = useState(85);
   const [batteryCharging] = useState(false);

   const [workerId] = useState(() => getWorkerId());
   const rfidWorkerId = workerId;

   const { totalSteps } = usePedometer();
  const { serverResponse, isSyncing, lastSyncAt, connectionStatus } = useTelemetrySync(
    vitals,
    totalSteps,
    workerId,
    API_URL,
    batteryLevel,
    batteryCharging,
    rfidWorkerId,
    isPoweredOn,
    bandRemoved,
  );

  const isAnomaly     = serverResponse.is_anomaly;
  const anomalyReason = serverResponse.anomaly_reason;
  const shiftSteps    = serverResponse.calculated_shift_steps > 0
    ? serverResponse.calculated_shift_steps
    : totalSteps;

  const bgAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isAnomaly) {
      try {
        if (navigator?.vibrate) navigator.vibrate(200);
      } catch (_) {}
    }

    Animated.timing(bgAnim, {
      toValue:         isAnomaly ? 1 : 0,
      duration:        500,
      useNativeDriver: false,
    }).start();
  }, [isAnomaly]);

  const bgColor = bgAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [COLORS.black, COLORS.crimson],
  });

  const triggerHeatStroke = useCallback(() => {
    setVitals({ heart_rate: 155, breathing_rate: 38, skin_temp: 39.2 });
    setHeatStrokeActive(true);
  }, []);

  const resetHeatStroke = useCallback(() => {
    setVitals(DEFAULT_VITALS);
    setHeatStrokeActive(false);
  }, []);

  const togglePower = useCallback(() => {
    setIsPoweredOn(prev => !prev);
    if (!isPoweredOn) {
      setBandRemoved(false);
    }
  }, [isPoweredOn]);

  const toggleBandRemoved = useCallback(() => {
    setBandRemoved(prev => !prev);
  }, [bandRemoved]);

  return (
    <Animated.View style={[styles.root, { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <AlertBanner
          isAnomaly={isAnomaly}
          reason={anomalyReason}
          source={serverResponse.source}
          lastSyncAt={lastSyncAt}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.topControlBar}>
            <View style={styles.sysInfoBlock}>
              <Text style={styles.sysTitle}>TACTICAL WEARABLE SIMULATOR</Text>
              <Text style={styles.sysSubtitle}>MINE SAFETY DIVISION // LEVEL 4</Text>
            </View>

            <TouchableOpacity
              style={[styles.powerBtn, isPoweredOn ? styles.powerBtnOn : styles.powerBtnOff]}
              onPress={togglePower}
              activeOpacity={0.7}
            >
              <Text style={[styles.powerBtnText, isPoweredOn && styles.powerBtnTextOn]}>
                {isPoweredOn ? '⏻ ON' : '⭕ OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {isPoweredOn && (
            <>
              {viewMode3D ? (
                 <WristbandModel3D
                  vitals={vitals}
                  shiftSteps={shiftSteps}
                  isAnomaly={isAnomaly}
                  isSyncing={isSyncing}
                   minerId={workerId}
                   lastSyncAt={lastSyncAt}
                  connectionStatus={connectionStatus}
                  bandRemoved={bandRemoved}
                  powerOn={isPoweredOn}
                  onEmergencyPress={triggerHeatStroke}
                />
              ) : (
                <TacticalWristband
                  vitals={vitals}
                  shiftSteps={shiftSteps}
                  isAnomaly={isAnomaly}
                  isSyncing={isSyncing}
                   minerId={workerId}
                   viewMode3D={false}
                  onEmergencyPress={triggerHeatStroke}
                  onSensorPress={resetHeatStroke}
                />
              )}

              <View style={styles.controls}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>◈  VITAL SIGNS SIMULATION</Text>
                  <Text style={styles.crownHint}>[SIMULATE DANGER STATES]</Text>
                </View>

                <View style={styles.presetSection}>
                  <Text style={styles.presetHeading}>RAPID TELEMETRY PRESETS</Text>
                  <View style={styles.presetRow}>
                    <TouchableOpacity
                      style={[styles.presetBtn, styles.presetNominal]}
                      onPress={() => setVitals({ heart_rate: 72, breathing_rate: 16, skin_temp: 36.5 })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetBtnText}>✓ NOMINAL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetBtn, styles.presetWarning]}
                      onPress={() => setVitals({ heart_rate: 142, breathing_rate: 22, skin_temp: 36.8 })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetBtnText}>⚠ CARDIAC SPIKE</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.presetRow}>
                    <TouchableOpacity
                      style={[styles.presetBtn, styles.presetWarning]}
                      onPress={() => setVitals({ heart_rate: 110, breathing_rate: 20, skin_temp: 39.0 })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetBtnText}>🔥 HEAT SPIKE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetBtn, styles.presetDanger]}
                      onPress={triggerHeatStroke}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetBtnDangerText}>⚡ HEAT STROKE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetBtn, bandRemoved ? styles.presetDanger : styles.presetNominal]}
                      onPress={toggleBandRemoved}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetBtnText}>
                        {bandRemoved ? '⚠️ BAND OFF' : '⌚ BAND ON'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:   1,
    width:  '100%',
    height: '100%',
  },
  safeArea: {
    flex:  1,
    width: '100%',
  },
  scrollView: {
    flex:  1,
    width: '100%',
  },
  scroll: {
    paddingBottom: SPACING.xxl,
    alignItems:    'center',
    width:         '100%',
  },

  topControlBar: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    width:            '100%',
    maxWidth:         Math.min(SCREEN_WIDTH, 420),
    paddingHorizontal: SPACING.md,
    paddingTop:       SPACING.sm,
    paddingBottom:    SPACING.xs,
  },
  sysInfoBlock: {
    flex: 1,
  },
  sysTitle: {
    fontFamily:    FONTS.mono,
    fontSize:      9,
    color:         COLORS.orange,
    letterSpacing: 1.5,
    fontWeight:    '800',
  },
  sysSubtitle: {
    fontFamily:    FONTS.mono,
    fontSize:      7.5,
    color:         '#606470',
    letterSpacing: 1,
    marginTop:     1,
  },
  powerBtn: {
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      4,
    borderWidth:       1,
  },
  powerBtnOn: {
    backgroundColor: '#002528',
    borderColor:     COLORS.cyan,
  },
  powerBtnOff: {
    backgroundColor: '#1b1d22',
    borderColor:     '#333742',
  },
  powerBtnText: {
    fontFamily:    FONTS.mono,
    fontSize:      9,
    color:         '#868a96',
    letterSpacing: 1,
    fontWeight:    '700',
  },
  powerBtnTextOn: {
    color: COLORS.cyan,
  },

  controls: {
    width:             '100%',
    maxWidth:          420,
    alignSelf:         'center',
    paddingHorizontal: SPACING.lg,
    marginTop:         SPACING.xs,
  },
  sectionHeaderRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    SPACING.xs,
    marginTop:       SPACING.sm,
  },
  sectionTitle: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         COLORS.orange,
    letterSpacing: 2,
  },
  crownHint: {
    fontFamily:    FONTS.mono,
    fontSize:      8,
    color:         '#808594',
    letterSpacing: 0.5,
  },

  presetSection: {
    backgroundColor: COLORS.panelBg,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     COLORS.panelBorder,
    padding:         SPACING.sm,
    marginBottom:    SPACING.sm,
  },
  presetHeading: {
    fontFamily:    FONTS.mono,
    fontSize:      8.5,
    color:         COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom:  6,
    textAlign:     'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap:           6,
    marginBottom:  6,
  },
  presetBtn: {
    flex:           1,
    paddingVertical: 8,
    borderRadius:   6,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
  },
  presetNominal: {
    backgroundColor: '#002528',
    borderColor:     COLORS.cyanDim,
  },
  presetWarning: {
    backgroundColor: '#301800',
    borderColor:     COLORS.orange,
  },
  presetDanger: {
    backgroundColor: '#380000',
    borderColor:     COLORS.redBright,
  },
  presetBtnText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         COLORS.textPrimary,
    letterSpacing: 1,
    fontWeight:    'bold',
  },
  presetBtnDangerText: {
    fontFamily:    FONTS.mono,
    fontSize:      FONTS.size.xs,
    color:         COLORS.redBright,
    letterSpacing: 1,
    fontWeight:    'bold',
  },
});
