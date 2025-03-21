import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av'; // Import Audio module
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import vector icons

type RootStackParamList = {
  VisualAssistant: undefined;
  SearchProduct: undefined;
  IdentifyProduct: undefined;
  OrderHistory: undefined;
  Cart: undefined;
  Profile: undefined;
};

const VisualAssistant: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [zoomLevel, setZoomLevel] = useState(new Animated.Value(1)); // Use Animated.Value for zoom level
  const scrollView = useRef<ScrollView>(null); // Create a reference for ScrollView
  const [sound, setSound] = useState<Audio.Sound | null>(null); // State for managing the sound

  // Load the sound
  const loadSound = async () => {
    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../../assets/click.wav') // Adjust the path as necessary
    );
    setSound(newSound); // Set the loaded sound to state
  };

  // Play sound function
  const playSound = async () => {
    if (sound) {
      await sound.replayAsync(); // Replay the sound if loaded
    }
  };

  // PanResponder for handling pan gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        scrollView.current?.scrollTo({
          x: -gestureState.dx,
          y: -gestureState.dy,
          animated: false,
        });
      },
    })
  ).current;

  // Zoom functions
  const zoomIn = () => {
    Animated.timing(zoomLevel, {
      toValue: zoomLevel.__getValue() + 0.1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    playSound(); // Play sound when zooming in
  };

  const zoomOut = () => {
    Animated.timing(zoomLevel, {
      toValue: Math.max(1, zoomLevel.__getValue() - 0.1),
      duration: 300,
      useNativeDriver: true,
    }).start();
    playSound(); // Play sound when zooming out
  };

  // Load the sound when the component mounts
  useEffect(() => {
    loadSound();
    return () => {
      sound?.unloadAsync(); // Cleanup: unload the sound
    };
  }, []);

  // Button press handlers
  const navigateTo = (screen: keyof RootStackParamList) => {
    playSound(); // Play sound on button press
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        ref={scrollView}
        {...panResponder.panHandlers}
      >
        <Animated.View style={{ transform: [{ scale: zoomLevel }] }}>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo('SearchProduct')}>
            <Text style={styles.buttonText}>Search Product</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigateTo('IdentifyProduct')}>
            <Text style={styles.buttonText}>Identify Product</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigateTo('OrderHistory')}>
            <Text style={styles.buttonText}>Order History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigateTo('Cart')}>
            <Text style={styles.buttonText}>Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigateTo('Profile')}>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

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
    flex: 1,
    backgroundColor: '#000',
    position: 'relative', // Needed to position the zoom buttons
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#fff',
    padding: 40,
    marginVertical: 25,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 30, // Positioned a bit higher from the bottom for visibility
    backgroundColor: '#007BFF',
    borderRadius: 50, // Circular shape
    padding: 25, // Increased padding for larger button
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

export default VisualAssistant;
