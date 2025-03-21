import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { recordSpeech } from "@/functions/recordSpeech";
import { processSpeechLocally } from "@/functions/processSpeechLocally";
import { SERVER_URI } from "@/utils/uri";

interface Brand {
  name: string;
  price: number;
  quantity?: number;
}

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  brands: Brand[];
}

export default function CompleteFunctionScreen() {
  const [transcribedSpeech, setTranscribedSpeech] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isDetectingText, setIsDetectingText] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const audioRecordingRef = useRef<Audio.Recording>(new Audio.Recording());
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isResponding, setIsResponding] = useState<boolean>(false);

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${SERVER_URI}/get-products`);
      setProducts(response.data); // Assuming the response data is in the correct format
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef);
  };

  const startRecordingHelp= async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef);
  }

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    const status = await audioRecordingRef.current?.getStatusAsync();
    const recordingDuration = status?.durationMillis;
    
    // Check if at least 1 second of recording exists
    if (recordingDuration < 1000) {
      Alert.alert("Error", "Recording must be at least 1 second long.");
      setIsTranscribing(false);
      return;
    }

    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");

      const response = await processSpeechLocally(speechTranscript, {
        products,
      });
      setResponse(response);
      const response1 = await axios.post(`${SERVER_URI}/play-text`, {
        text: response,
      });
      const { audioContent } = response1.data;
      await playBase64Audio(audioContent);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to process the recording.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to grant camera permissions to use this feature."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      setIsDetectingText(true);
      detectText(result.assets[0].base64); // Get base64 from the first asset
    }
  };

  const detectText = async (base64: string) => {
    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps`,
        {
          requests: [
            {
              image: {
                content: base64,
              },
              features: [
                {
                  type: "TEXT_DETECTION",
                  maxResults: 10,
                },
              ],
            },
          ],
        }
      );
      const textAnnotations = response.data.responses[0].textAnnotations;
      if (textAnnotations.length > 0) {
        const detectedText = textAnnotations[0].description;
        setResponse(detectedText);
        if (detectedText) {
          const response = await processSpeechLocally(detectedText, {
            products,
          });
          setResponse(response);
          const response1 = await axios.post(`${SERVER_URI}/play-text`, {
            text: response,
          });
          const { audioContent } = response1.data;
          await playBase64Audio(audioContent);
        }
      } else {
        setResponse("No text detected");
      }
    } catch (error) {
      console.error("Failed to detect text:", error);
      Alert.alert("Error", "Failed to detect text");
    } finally {
      setIsDetectingText(false);
    }
  };

  const playBase64Audio = async (base64Audio: string) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      setSound(soundObject);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const sendToSupport = async () => {
    setIsResponding(true); // Set responding state to true at the start
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);

      const status = await audioRecordingRef.current?.getStatusAsync();
      if (!speechTranscript || (status?.durationMillis ?? 0) < 1000) {
        Alert.alert("Error", "Recording must be at least 1 second long.");
        setIsResponding(false);
        return;
      }

      const dialogflowResponse = await axios.post(
        `${SERVER_URI}/dialogflow`,
        { text: speechTranscript }
      );

      const responseText = dialogflowResponse.data?.response || "No response from support.";
      setResponse(responseText);

      const response1 = await axios.post(`${SERVER_URI}/play-text`, { text: responseText });
      const { audioContent } = response1.data;

      await playBase64Audio(audioContent);
    } catch (error) {
      console.error("Failed to contact support:", error);
      Alert.alert("Error", "Failed to contact support");
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.mainScrollContainer}>
        <View style={styles.mainInnerContainer}>
          <Text style={styles.title}>
            Welcome to Support Functionality
          </Text>

          <View style={styles.transcriptionContainer}>
            {isTranscribing || isDetectingText ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                style={{
                  ...styles.transcribedText,
                  color: response ? "#000" : "rgb(150,150,150)",
                }}
              >
                {response || "Your result will be shown here"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.supportButton}
            onPressIn={startRecordingHelp}
            onPressOut={sendToSupport}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome name="comments" size={40} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainScrollContainer: {
    paddingVertical: 20,
  },
  mainInnerContainer: {
    paddingHorizontal: 20,
  },
  title: {
    marginVertical: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  transcriptionContainer: {
    minHeight: 100,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
  },
  transcribedText: {
    fontSize: 18,
    textAlign: "center",
  },
  microphoneButton: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 100,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 100,
    backgroundColor: "#32CD32",
    justifyContent: "center",
    alignItems: "center",
  },
  supportButton: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 100,
    backgroundColor: "#FF4500",
    justifyContent: "center",
    alignItems: "center",
  },
});
