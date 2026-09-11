import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, BEZEL } from '../constants/theme';

/**
 * RivetCorner
 *
 * Decorative metallic rivet dot placed in each corner of the wristband chassis.
 * Accepts a `position` prop: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
 */
export default function RivetCorner({ position = 'topLeft', size = BEZEL.rivetSize }) {
  const posStyle = POSITIONS[position] ?? POSITIONS.topLeft;

  return (
    <View style={[styles.rivet, posStyle, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Inner highlight dot */}
      <View style={[styles.highlight, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 }]} />
    </View>
  );
}

const INSET = 10;

const POSITIONS = {
  topLeft:     { top: INSET,  left:  INSET  },
  topRight:    { top: INSET,  right: INSET  },
  bottomLeft:  { bottom: INSET, left:  INSET },
  bottomRight: { bottom: INSET, right: INSET },
};

const styles = StyleSheet.create({
  rivet: {
    position:        'absolute',
    backgroundColor: COLORS.metalLight,
    borderWidth:     1,
    borderColor:     COLORS.metalBright,
    alignItems:      'center',
    justifyContent:  'center',
    // Subtle inset shadow to simulate a drilled rivet
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.7,
    shadowRadius:    2,
    elevation:       2,
  },
  highlight: {
    backgroundColor: COLORS.metalBright,
    opacity:         0.6,
  },
});

