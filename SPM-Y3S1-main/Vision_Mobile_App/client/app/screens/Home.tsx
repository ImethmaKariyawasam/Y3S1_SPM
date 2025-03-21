import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { Audio } from 'expo-av'; // Import Audio from expo-av

type RootStackParamList = {
  Home: undefined;
  SupportFunction: undefined;
  Voiceshop: undefined;
  Visualshop: undefined;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sound playing function for click.wav
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/click.wav') // Use click.wav instead of click.mp3
    );
    await sound.playAsync();
  };

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => prev + 0.1);
    playSound(); // Play sound when zooming in
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(1, prev - 0.1));
    playSound(); // Play sound when zooming out
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.welcomeText, { fontSize: 32 * zoomLevel }]}>Welcome to Vision Spot</Text>

      <TouchableOpacity 
        style={[styles.block, { transform: [{ scale: zoomLevel }] }]} 
        onPress={() => {
          playSound();
          navigation.navigate('SupportFunction');
        }}
      >
        <Text style={[styles.blockText, { fontSize: 28 * zoomLevel }]}>Support Function</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.block, { transform: [{ scale: zoomLevel }] }]} 
        onPress={() => {
          playSound();
          navigation.navigate('Voiceshop');
        }}
      >
        <Text style={[styles.blockText, { fontSize: 28 * zoomLevel }]}>Shop with Voice Assistance</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.block, { transform: [{ scale: zoomLevel }] }]} 
        onPress={() => {
          playSound();
          navigation.navigate('Visualshop');
        }}
      >
        <Text style={[styles.blockText, { fontSize: 28 * zoomLevel }]}>Shop with Visual Assistance</Text>
      </TouchableOpacity>

      {/* Zoom In and Zoom Out Buttons */}
      <TouchableOpacity style={[styles.zoomButton, styles.zoomIn]} onPress={zoomIn}>
        <Icon name="zoom-in" size={60} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.zoomButton, styles.zoomOut]} onPress={zoomOut}>
        <Icon name="zoom-out" size={60} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
    position: 'relative',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
    textAlign: 'center',
  },
  block: {
    backgroundColor: '#fff',
    padding: 40,
    marginVertical: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#007BFF',
    borderRadius: 50,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  zoomIn: {
    left: 20,
  },
  zoomOut: {
    right: 20,
  },
});

export default HomeScreen;
