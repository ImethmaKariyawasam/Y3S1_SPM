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

export default function CartPage() {
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [products, setProducts] = useState<string[]>([]); // State to hold product list
  const audioRecordingRef = useRef(new Audio.Recording());
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${SERVER_URI}/fetchproduct`);
      console.log("API Response:", response.data);
  
      if (Array.isArray(response.data)) {
        // Directly use the response data, filtering out any empty strings or null values
        const productNames = response.data.filter((name) => !!name); 
        console.log("Extracted product names:", productNames);
        setProducts(productNames); // Update state with the product names
  
        if (productNames.length > 0) {
          const productList = productNames.join(", ");
          Speech.speak(`Here are the products: ${productList}`, {
            language: "en",
            pitch: 1.0,
            rate: 1.0,
          });
          router.push("./AddedCart");
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
  
  
  // Function to start recording
  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef);
  };

  // Function to handle text-to-speech
  const speakText = (text: string) => {
    if (text) {
      Speech.speak(text, {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    }
  };

  // Function to handle additional commands
  const handleCommand = async (command: string) => {
    if (command.toLowerCase().includes("add product")) {
      router.push("/AddProductPage"); // Example navigation
    } else if (command.toLowerCase().includes("view cart")) {
      router.push("/CartPage"); // Example navigation
    } else if (command.toLowerCase().includes("i want to get product")) {
      // Fetch products and provide options
      await fetchProducts();
      
      // Ensure products state is updated before speaking
      if (products.length > 0) {
        const productList = products.join(", ");
        const message = `What do you want to get? Here are some options: ${productList}. What you want to get? I can add it to the cart.`;
  
        // Speak out the product options
        Speech.speak(message, {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });
  
        // Delay for speech to finish before navigating
        setTimeout(() => {
          router.push("./AddedCart");
        }, 5000); // Adjust timeout as needed
      }
    } else {
      Speech.speak("Sorry, Please give the Correct Comm.", {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    }
  };

  // Function to stop recording and handle transcription
  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");

      // Trigger text-to-speech
      speakText(speechTranscript);

      // Check for specific command
      await handleCommand(speechTranscript);
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
