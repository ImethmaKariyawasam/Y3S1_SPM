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
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { recordSpeech } from "@/functions/recordSpeech";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isBlind, setIsBlind] = useState(false);
  const [bgColor, setBgColor] = useState("white"); // State for background color
  const [textColor, setTextColor] = useState("#000"); // State for text color

  const audioRecordingRef = useRef(new Audio.Recording());
  const router = useRouter();

  useEffect(() => {
    Speech.speak("Do you want to online delivery or Navigate and get the products", {
      language: "en",
      pitch: 1.0,
      rate: 1.0,
    });
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");

      if (speechTranscript?.toLowerCase().includes("online delivery")) {
        Speech.speak("Okay. You will navigate to the online ordering page", {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });

        router.push("/Product_list");
      } else if (speechTranscript?.toLowerCase().includes("navigate to the place")) {
        Speech.speak("Okay. You will navigate to the Cart Page", {
          language: "en",
          pitch: 1.0,
          rate: 1.0,
        });

        router.push("/CartPage");

      } 
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        style={[
          styles.mainScrollContainer,
          { backgroundColor: bgColor },
          isBlind ? styles.blindStyle : null,
        ]}
      >
        <View style={styles.mainInnerContainer}>
          <Text style={[styles.title, { color: textColor }]}>Blind Vision Mobile App</Text>

          <View style={styles.transcriptionContainer}>
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                style={{
                  ...styles.transcribedText,
                  color: transcribedSpeech ? textColor : "rgb(150,150,150)",
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
    width: 320,
    height:"87%",
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 80,
    borderTopLeftRadius:15,
    borderTopRightRadius:15,
    borderBottomLeftRadius:15,
    borderBottomRightRadius:15,
  },
  blindStyle: {
    backgroundColor: "red",
  },
  mainInnerContainer: {
    gap: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  transcriptionContainer: {
    backgroundColor: "rgb(220,220,220)",
    width: 270,
    height: 250,
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderTopEndRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
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
