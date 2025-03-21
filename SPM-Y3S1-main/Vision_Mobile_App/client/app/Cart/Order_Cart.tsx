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

let number = 0;
let Pname = "apple";
let batchNumber = "825";
let Price = 300;
let testValue = "";

export default function Order_Cart() {
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const audioRecordingRef = useRef(new Audio.Recording());
  const router = useRouter();
  let currentDateTime = new Date().toLocaleString();

  const findProduct = async (speechTranscript: string) => {
    try {
    let  testvalue1 = speechTranscript;
      const encodedString = encodeURIComponent(speechTranscript);
      const response = await axios.get(`${SERVER_URI}/fetchproduct/get/${encodedString}`);

      if (response.data != null) {
        const product = response.data.data[0];
        const { name, price, batchNumber } = product;

        number=1;
        Pname = name;
        Price = price;
        console.log(`Fetched Product: ${Pname}, Price: ${Price}, Batch Number: ${batchNumber}`);
        
        Speech.speak("Yes, you can get it. Please go to the available place.", {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
          onDone: () => {
            Speech.speak("What count do you want to get?", {
              language: "en",
              pitch: 1.0,
              rate: 1.0,     
              onDone: () => {
                startRecordingForUserInput();
              },
            });
          },
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };
  
  const startRecordingForUserInput = async () => {
    if (!isRecording) {
      try {
        setIsRecording(true);
        await recordSpeech(audioRecordingRef);
        console.log("🎤 Recording started for user input");
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await recordSpeech(audioRecordingRef);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
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

  const sendData = async (value2: number) => {
    const CustomerID = "Savi@gmail.com";
    const newPayment = {
      CustomerID,
      Pname,
      Price: Price * value2,
      Date: currentDateTime,
      batchNumber,
      Count: value2,
    };

    try {
      await axios.post(`${SERVER_URI}/Cart/Add`, newPayment);
      alert("Product Added to the Cart");
      Speech.speak("Product Added to the Cart. If you want to get another Product. Please give the product name.", {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    } catch (error) {
      Speech.speak("Sorry. System has a validation error. Please give the correct answers.Please give the product Name", {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
      console.error("Error adding product to cart:", error);
    }
    number = 0;

  };

  const handleCommand = async (command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    const foundProducts = products.filter(product =>
      lowerCaseCommand.includes(product.toLowerCase())
    );

    if (foundProducts.length > 0) {
      for (const product of foundProducts) {
        console.log(`Adding ${product} to the cart`);
      }
      Speech.speak(`Added ${foundProducts.join(", ")} to the cart.`, {
        language: "en",
        pitch: 1.0,
        rate: 1.0,
      });
    } else {
      const fuzzyMatch = products.find(product =>
        lowerCaseCommand.includes(product.toLowerCase().split(" ")[0])
      );

      if (fuzzyMatch) {
        console.log(`Adding ${fuzzyMatch} to the cart`);
        Speech.speak(`Added ${fuzzyMatch} to the cart.`, {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });
      } else {
        Speech.speak("Sorry, I didn't understand. Please try again.", {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });
      }
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");

      speakText(speechTranscript);

      if (speechTranscript && speechTranscript.toLowerCase() === "don't") {
        Speech.speak("You can listen your cart list", {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });
        router.push("./ViewCart");
      }
      else if (number == 0) {
        findProduct(speechTranscript);
      }  
       else {
        let value2 = parseInt(speechTranscript);
        sendData(value2);
      }
    } catch (error) {
      console.error("Error during transcription:", error);
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
