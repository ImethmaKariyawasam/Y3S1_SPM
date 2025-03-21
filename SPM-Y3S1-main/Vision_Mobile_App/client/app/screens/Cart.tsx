import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderHistory: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cart Screen</Text>
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

export default OrderHistory;
