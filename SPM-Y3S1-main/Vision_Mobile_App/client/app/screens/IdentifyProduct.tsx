import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const IdentifyProduct: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Identify Product Screen</Text>
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
    fontSize: 24,
    color: '#fff',
  },
});

export default IdentifyProduct;
