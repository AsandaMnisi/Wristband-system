import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function SapphireGlass({ size = 240 }) {
  return (
    <View style={[styles.glassContainer, { width: size, height: size, borderRadius: size / 2 }]} pointerEvents="none">
      <View style={[styles.primaryGlare, { backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)' }]} />
      <View style={[styles.edgeRing, { borderRadius: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    position:       'absolute',
    top:            0,
    left:           0,
    overflow:       'hidden',
    zIndex:         20,
  },
  primaryGlare: {
    position:        'absolute',
    top:             -20,
    left:            -20,
    width:           '140%',
    height:          '70%',
    transform:       [{ rotate: '-32deg' }],
    backgroundSize:  '100% 100%',
  },
  edgeRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth:     1,
    borderColor:     'rgba(255, 255, 255, 0.08)',
  },
});
