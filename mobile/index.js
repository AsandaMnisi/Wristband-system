import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import HUDScreen from './src/screens/HUDScreen';
import { COLORS } from './src/constants/theme';

const { width, height } = Dimensions.get('window');

function App() {
  return (
    <View style={styles.root}>
      <HUDScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: COLORS.black,
    height:          height,
    width:           width,
  },
});

export default App;
