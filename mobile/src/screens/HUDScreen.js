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
const MINER_ID = 'MINER_001';
const API_URL  = process.env.EXPO_PUBLIC_API_URL ?? '';

const DEFAULT_VITALS = {
  heart_rate:     72,
  breathing_rate: 16,
  skin_temp:      36.5,
};

export default function HUDScreen() {
  const [vitals, setVitals]                     = useState(DEFAULT_VITALS);
  const [heatStrokeActive, setHeatStrokeActive] = useState(false);
  const [viewMode3D, setViewMode3D]             = useState(true);

  const { totalSteps } = usePedometer();
  const { serverResponse, isSyncing, lastSyncAt } = useTelemetrySync(
    vitals,
    totalSteps,
    MINER_ID,
    API_URL,
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
              style={[styles.viewModeBtn, viewMode3D ? styles.viewModeBtnActive : styles.viewModeBtnInactive]}
              onPress={() => setViewMode3D(!viewMode3D)}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewModeText, viewMode3D && styles.viewModeTextActive]}>
                {viewMode3D ? '⚡ 3D WEBGL MODEL' : '▣ 2D SCHEMATIC'}
              </Text>
            </TouchableOpacity>
          </View>

          {viewMode3D ? (
            <WristbandModel3D
              vitals={vitals}
              shiftSteps={shiftSteps}
              isAnomaly={isAnomaly}
              isSyncing={isSyncing}
              minerId={MINER_ID}
              lastSyncAt={lastSyncAt}
              onEmergencyPress={triggerHeatStroke}
            />
          ) : (
            <TacticalWristband
              vitals={vitals}
              shiftSteps={shiftSteps}
              isAnomaly={isAnomaly}
              isSyncing={isSyncing}
              minerId={MINER_ID}
              viewMode3D={false}
              onEmergencyPress={triggerHeatStroke}
              onSensorPress={resetHeatStroke}
            />
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
  viewModeBtn: {
    paddingHorizontal: 10,
    paddingVertical:   6,
    borderRadius:      4,
    borderWidth:       1,
  },
  viewModeBtnActive: {
    backgroundColor: '#002528',
    borderColor:     COLORS.cyan,
  },
  viewModeBtnInactive: {
    backgroundColor: '#1b1d22',
    borderColor:     '#333742',
  },
  viewModeText: {
    fontFamily:    FONTS.mono,
    fontSize:      8.5,
    color:         '#868a96',
    letterSpacing: 1,
    fontWeight:    '700',
  },
  viewModeTextActive: {
    color: COLORS.cyan,
  },
});
