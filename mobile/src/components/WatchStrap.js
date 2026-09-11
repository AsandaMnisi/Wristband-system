import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function WatchStrap({ position = 'top', width = 180, height = 85 }) {
  const isTop = position === 'top';

  return (
    <View style={[styles.strapContainer, { width, height }]}>
      <View
        style={[
          styles.strapBody,
          isTop ? styles.strapTop : styles.strapBottom,
          { backgroundImage: `linear-gradient(to right, ${isTop ? '#0e0f12, #1b1d22, #121316' : '#121316, #1b1d22, #0e0f12'})` }
        ]}
      >
        <View style={styles.leftBevel} />
        <View style={styles.rightBevel} />

        <View style={styles.stitchLineLeft} />
        <View style={styles.stitchLineRight} />

        <View style={styles.centerChannel} />

        <View style={styles.ribsContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.ribWrapper}>
              <View style={styles.ribHighlight} />
              <View style={styles.ribShadow} />
            </View>
          ))}
        </View>

        {!isTop && (
          <View style={styles.keeperBand}>
            <View style={[styles.keeperGradient, { backgroundImage: 'linear-gradient(to right, #2c2e35, #454850, #25272c)' }]}>
              <View style={styles.keeperAccent} />
            </View>
          </View>
        )}
      </View>

      <View style={[styles.lugJoint, isTop ? styles.lugJointTop : styles.lugJointBottom]}>
        <View style={[styles.lugMetal, { backgroundImage: 'linear-gradient(to right, #25272e, #484b55, #25272e)' }]}>
          <View style={[styles.lugPin, { left: 16 }]} />
          <View style={[styles.lugPin, { right: 16 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strapContainer: {
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:          1,
  },
  strapBody: {
    width:          '100%',
    height:         '100%',
    overflow:       'hidden',
    borderWidth:    1,
    borderColor:    '#252830',
    position:       'relative',
    justifyContent: 'space-evenly',
    backgroundSize: '100% 100%',
  },
  strapTop: {
    borderTopLeftRadius:  10,
    borderTopRightRadius: 10,
    borderBottomWidth:    0,
  },
  strapBottom: {
    borderBottomLeftRadius:  12,
    borderBottomRightRadius: 12,
    borderTopWidth:          0,
  },
  leftBevel: {
    position:        'absolute',
    left:            0,
    top:             0,
    bottom:          0,
    width:           4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  rightBevel: {
    position:        'absolute',
    right:           0,
    top:             0,
    bottom:          0,
    width:           4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  stitchLineLeft: {
    position:        'absolute',
    left:            12,
    top:             4,
    bottom:          4,
    width:           1.5,
    backgroundColor: COLORS.orange,
    opacity:         0.45,
  },
  stitchLineRight: {
    position:        'absolute',
    right:           12,
    top:             4,
    bottom:          4,
    width:           1.5,
    backgroundColor: COLORS.orange,
    opacity:         0.45,
  },
  centerChannel: {
    position:        'absolute',
    left:            '50%',
    marginLeft:      -18,
    top:             0,
    bottom:          0,
    width:           36,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderLeftWidth: 1,
    borderRightWidth:1,
    borderColor:     'rgba(255,255,255,0.03)',
  },
  ribsContainer: {
    flex:           1,
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 26,
  },
  ribWrapper: {
    height:         4,
    marginVertical: 3,
    borderRadius:   2,
  },
  ribHighlight: {
    height:          2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius:    1,
  },
  ribShadow: {
    height:          2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius:    1,
  },
  keeperBand: {
    position:        'absolute',
    bottom:          18,
    left:            -4,
    right:           -4,
    height:          18,
    zIndex:          5,
  },
  keeperGradient: {
    flex:            1,
    borderRadius:    4,
    borderWidth:     1,
    borderColor:     '#555860',
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    boxShadow:       '0 2px 5px rgba(0,0,0,0.6)',
    backgroundSize:  '100% 100%',
  },
  keeperAccent: {
    width:           20,
    height:          2,
    backgroundColor: COLORS.orange,
    borderRadius:    1,
    opacity:         0.7,
  },
  lugJoint: {
    position:        'absolute',
    left:            -12,
    right:           -12,
    height:          14,
    zIndex:          10,
  },
  lugJointTop: {
    bottom:          -7,
  },
  lugJointBottom: {
    top:             -7,
  },
  lugMetal: {
    flex:            1,
    borderRadius:    5,
    borderWidth:     1,
    borderColor:     '#5a5e6a',
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 12,
    boxShadow:       '0 1px 4px rgba(0,0,0,0.8)',
    backgroundSize:  '100% 100%',
  },
  lugPin: {
    width:           7,
    height:          7,
    borderRadius:    3.5,
    backgroundColor: '#181a1f',
    borderWidth:     1,
    borderColor:     '#757a88',
  },
});
