import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VoiceShopScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shop with Voice Assistance</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default VoiceShopScreen;
