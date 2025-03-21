import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from "expo-router";
import axios from 'axios';
import { SERVER_URI } from "@/utils/uri";


export default function Live_Location() {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [formattedAddress, setFormattedAddress] = useState(''); 
  const router = useRouter();
  const { totalprice, CustomerID, ProductArrays } = useLocalSearchParams(); // Ensure the key is correct

  const sendData = async (totalprice: string | string[] | undefined) => {
    const currentDate = new Date().toLocaleDateString();
    const newPayment = {
      CustomerID,
      Date: currentDate,
      Location: formattedAddress, 
      ProductArrays, // Ensure this matches with your API
      Status: false, // Updated Status value
      totalprice,
    };

    try {
      await axios.post(`${SERVER_URI}/Order/Add`, newPayment);   
      console.log("Order path");
      alert("Product Added to the Cart");
      Speech.speak("Order is Successfully", {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    } catch (error) {
      Speech.speak("Sorry. System has a validation error. Please give the correct answers. Please give the product name.", {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
      console.error("Error adding product to cart:", error);
    }
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Location permission is required to access your current location.");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 40000,
          maximumAge: 10000,
        });

        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });

        // Reverse geocoding to get the location name
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const formattedAddress = `${address.street}, ${address.city}, ${address.region}, ${address.country}`;
          setFormattedAddress(formattedAddress); // Set state for formatted address
          setLocationName(formattedAddress);

          // Speak the location name
          Speech.speak(`Your current location is ${formattedAddress}`);
        } else {
          Speech.speak("Unable to determine your location.");
        }

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        showsUserLocation={true}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            description={locationName}
          />
        )}
      </MapView>
      {!currentLocation && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Fetching your location...</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => sendData(totalprice)}>
        <Text style={styles.buttonText}>Share</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
  },
  button: {
    position: 'absolute',
    bottom: 60,
    right: 100,
    width: 162,
    height: 50,
    backgroundColor: "#0F4758",
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#FF5733", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5, 
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "Roboto",
    color: "#fff", 
  },
});
