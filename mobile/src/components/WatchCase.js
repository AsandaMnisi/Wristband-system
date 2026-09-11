import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function WatchCase({
  children,
  onEmergencyPress,
  onSensorPress,
  isAnomaly = false,
}) {
  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.leftHardware}
        onPress={onSensorPress}
        activeOpacity={0.8}
      >
        <View style={styles.sensorPod}>
          <View style={styles.sensorVent} />
          <View style={[styles.sensorVent, { width: 14 }]} />
          <View style={styles.sensorVent} />
          <View style={[styles.sensorLed, { backgroundColor: isAnomaly ? COLORS.red : COLORS.cyan }]} />
        </View>
      </TouchableOpacity>

      <View style={styles.rightHardware}>
        <View style={styles.smallPusher}>
          <View style={styles.pusherMetal} />
        </View>

        <TouchableOpacity
          style={styles.sosCrownContainer}
          onPress={onEmergencyPress}
          activeOpacity={0.7}
        >
          <View style={styles.crownGuardTop} />
          <View style={[styles.sosCrown, isAnomaly && styles.sosCrownActive]}>
            <View style={styles.crownRidge} />
            <View style={styles.crownRidge} />
            <View style={styles.crownRidge} />
            <Text style={styles.sosText}>SOS</Text>
          </View>
          <View style={styles.crownGuardBottom} />
        </TouchableOpacity>

        <View style={styles.smallPusher}>
          <View style={styles.pusherMetal} />
        </View>
      </View>

      <View
        style={[
          styles.mainChassis,
          isAnomaly ? styles.chassisAnomalyGlow : styles.chassisNormalGlow,
        ]}
      >
        <View style={styles.topChassisBevel} />
        <View style={styles.bottomChassisBevel} />

        <HexBolt position="top-left" />
        <HexBolt position="top-right" />
        <HexBolt position="bottom-left" />
        <HexBolt position="bottom-right" />

        <View style={[styles.armorBumper, styles.armorBumperTop]}>
          <Text style={styles.armorText}>TACTICAL MINING SPEC</Text>
        </View>
        <View style={[styles.armorBumper, styles.armorBumperBottom]}>
          <Text style={styles.armorText}>SENSOR SUITE v4.2</Text>
        </View>

        <View style={styles.contentContainer}>
          {children}
        </View>
      </View>
    </View>
  );
}

function HexBolt({ position }) {
  const posStyle = {
    'top-left':     { top: 12, left: 12 },
    'top-right':    { top: 12, right: 12 },
    'bottom-left':  { bottom: 12, left: 12 },
    'bottom-right': { bottom: 12, right: 12 },
  }[position];

  return (
    <View style={[styles.boltHole, posStyle]}>
      <View style={styles.boltRecess}>
        <View style={styles.boltHead}>
          <View style={styles.hexSocket} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position:       'relative',
    alignItems:     'center',
    justifyContent: 'center',
  },

  mainChassis: {
    width:          340,
    height:         360,
    borderRadius:   54,
    borderWidth:    3,
    borderColor:    '#32353e',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    overflow:       'visible',
    backgroundColor: '#15161a',
  },
  chassisNormalGlow: {
    boxShadow: '0 8px 30px rgba(0, 245, 255, 0.25), 0 20px 50px rgba(0, 0, 0, 0.85)',
  },
  chassisAnomalyGlow: {
    boxShadow: '0 8px 35px rgba(255, 31, 31, 0.45), 0 20px 50px rgba(0, 0, 0, 0.9)',
    borderColor: '#5a1515',
  },
  topChassisBevel: {
    position:        'absolute',
    top:             0,
    left:            40,
    right:           40,
    height:          2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomChassisBevel: {
    position:        'absolute',
    bottom:          0,
    left:            40,
    right:           40,
    height:          2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  armorBumper: {
    position:        'absolute',
    backgroundColor: '#1b1d22',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius:    4,
    borderWidth:     1,
    borderColor:     '#2c2f37',
    zIndex:          5,
  },
  armorBumperTop: {
    top: -8,
  },
  armorBumperBottom: {
    bottom: -8,
  },
  armorText: {
    fontFamily:    'monospace',
    fontSize:      7.5,
    color:         '#767a86',
    letterSpacing: 1.5,
    fontWeight:    '700',
  },

  boltHole: {
    position:        'absolute',
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: '#0a0a0c',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     '#1e2025',
    boxShadow:       'inset 0 1px 3px rgba(0,0,0,0.9)',
    zIndex:          6,
  },
  boltRecess: {
    width:          15,
    height:         15,
    borderRadius:   7.5,
    alignItems:     'center',
    justifyContent: 'center',
  },
  boltHead: {
    width:          14,
    height:         14,
    borderRadius:   7,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    0.5,
    borderColor:    '#686d7a',
    backgroundColor: '#1e2025',
  },
  hexSocket: {
    width:           5,
    height:          5,
    backgroundColor: '#0c0d10',
    borderRadius:    1,
  },

  leftHardware: {
    position:    'absolute',
    left:        -22,
    top:         '50%',
    marginTop:   -30,
    width:       24,
    height:      60,
    zIndex:      15,
  },
  sensorPod: {
    flex:           1,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderWidth:    1,
    borderColor:    '#444752',
    alignItems:     'center',
    justifyContent: 'space-evenly',
    paddingVertical: 6,
    boxShadow:      '-3px 2px 8px rgba(0,0,0,0.7)',
    backgroundColor: '#1a1b20',
  },
  sensorVent: {
    width:           10,
    height:          2,
    backgroundColor: '#0e1014',
    borderRadius:    1,
  },
  sensorLed: {
    width:        6,
    height:       6,
    borderRadius: 3,
    boxShadow:    '0 0 6px currentColor',
  },

  rightHardware: {
    position:    'absolute',
    right:       -24,
    top:         '50%',
    marginTop:   -65,
    width:       26,
    height:      130,
    justifyContent: 'space-between',
    alignItems:  'flex-start',
    zIndex:      15,
  },
  smallPusher: {
    width:        16,
    height:       22,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow:     'hidden',
  },
  pusherMetal: {
    flex:         1,
    borderWidth:  1,
    borderColor:  '#4a4d56',
    backgroundColor: '#202227',
  },
  sosCrownContainer: {
    width:        24,
    height:       52,
    alignItems:   'center',
    justifyContent: 'center',
    position:     'relative',
  },
  crownGuardTop: {
    position:        'absolute',
    top:             -4,
    left:            0,
    width:           14,
    height:          6,
    backgroundColor: '#202227',
    borderTopRightRadius: 3,
  },
  crownGuardBottom: {
    position:        'absolute',
    bottom:          -4,
    left:            0,
    width:           14,
    height:          6,
    backgroundColor: '#202227',
    borderBottomRightRadius: 3,
  },
  sosCrown: {
    width:           22,
    height:          40,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth:     1,
    borderColor:     '#ff6666',
    alignItems:      'center',
    justifyContent:  'center',
    boxShadow:       '3px 2px 10px rgba(255, 0, 0, 0.4)',
    cursor:          'pointer',
    backgroundColor: '#991111',
  },
  sosCrownActive: {
    borderColor: '#ff1111',
    boxShadow:   '0 0 16px #ff0000',
  },
  crownRidge: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          1.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sosText: {
    fontFamily:    'monospace',
    fontSize:      8,
    color:         '#ffffff',
    fontWeight:    '900',
    letterSpacing: 1,
    transform:     [{ rotate: '90deg' }],
  },

  contentContainer: {
    alignItems:     'center',
    justifyContent: 'center',
  },
});
