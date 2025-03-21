import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import axios from "axios";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import { recordSpeech } from "@/functions/recordSpeech";
import { SERVER_URI } from "@/utils/uri";

// Define the Product type
interface Product {
  Pname: string;
  Price: number;
}

export default function ViewCart() {
  const [transcribedSpeech, setTranscribedSpeech] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]); // Use the Product type for the state
  const audioRecordingRef = useRef(new Audio.Recording());
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${SERVER_URI}/Cart/`);
      console.log("API response data:", response.data);

      if (Array.isArray(response.data)) {
        const productDetails: Product[] = response.data; // Explicitly set the type
        console.log("Extracted product details:", productDetails);
        setProducts(productDetails);

        if (productDetails.length > 0) {
          speakProductDetails(productDetails);
        

        } else {
          Speech.speak("There are no products available at the moment.", {
            language: "en",
            pitch: 1.0,
            rate: 1.0,
          });
        }
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  
  const speakProductDetails = (products: Product[]) => {
    products.forEach((product, index) => {
      const { Pname, Price } = product;
      console.log(Pname +" "+ Price);
      const message = `Product ${index + 1}: ${Pname}, priced at ${Price} Rupees.`;
      Speech.speak(message, {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    });
  };

  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef);
  };

  const speakText = (text: string) => {
    if (text) {
      Speech.speak(text, {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    }
  };

  

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");

      speakText(speechTranscript);
      
      if (speechTranscript && speechTranscript.toLowerCase() === "can you tell me my product list") {
        fetchProducts();

       }else if(speechTranscript && speechTranscript.toLowerCase() === "Generate PDF"){

       }
       else{
        Speech.speak("Please provide the correct command.", {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });
       }
      
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.mainScrollContainer}>
        <View style={styles.mainInnerContainer}>
          <Text style={styles.title}>Welcome to the Speech-to-Text App</Text>
          <View style={styles.transcriptionContainer}>
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                style={{
                  ...styles.transcribedText,
                  color: transcribedSpeech ? "#000" : "rgb(150,150,150)",
                }}
              >
                {transcribedSpeech || "Your transcribed text will be shown here"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={{
              ...styles.microphoneButton,
              opacity: isRecording || isTranscribing ? 0.5 : 1,
            }}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isRecording || isTranscribing}
          >
            {isRecording ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome name="microphone" size={40} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainScrollContainer: {
    padding: 20,
    height: "100%",
    width: "100%",
  },
  mainInnerContainer: {
    gap: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 35,
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  transcriptionContainer: {
    backgroundColor: "rgb(220,220,220)",
    width: "100%",
    height: 200,
    padding: 20,
    marginBottom: 20,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  transcribedText: {
    fontSize: 20,
    padding: 5,
    color: "#000",
    textAlign: "left",
    width: "100%",
  },
  microphoneButton: {
    backgroundColor: "red",
    width: 75,
    height: 75,
    marginTop: 30,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
