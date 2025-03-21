import { Audio } from "expo-av";
import { MutableRefObject } from "react";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { readBlobAsBase64 } from "./readBlobAsBase64";
import { config } from "dotenv";
import { SERVER_URI } from "@/utils/uri";

export const transcribeSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>
) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
    const isPrepared = audioRecordingRef?.current?._canRecord;
    if (isPrepared) {
      await audioRecordingRef?.current?.stopAndUnloadAsync();

      const recordingUri = audioRecordingRef?.current?.getURI() || "";
      const base64Uri = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (recordingUri && base64Uri) {
        const audioConfig = {
          encoding: Platform.OS === "ios" ? "LINEAR16" : "AMR_WB",
          sampleRateHertz: Platform.OS === "ios" ? 44100 : 16000,
          languageCode: "en-US",
        };

        const serverResponse = await fetch(`${SERVER_URI}/speech-to-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioUrl: base64Uri,
            config: audioConfig,
          }),
        })
          .then((res) => res.json())
          .catch((e) => console);
          const result=serverResponse?.results || [];
          if(result){
            const transcription = result?.[0]?.alternatives?.[0]?.transcript;
            if(!transcription){
              console.error("Failed to transcribe speech");
              return undefined;
            }
            return transcription;
          }else{
            console.error("Failed to get recording URI or base64 data");
            return undefined;
          }
      } else {
        console.log("Failed to get recording URI or base64 data");
        return undefined;
      }
    } else {
      console.error("Recording must be prepared prior to unloading");
      return undefined;
    }
  } catch (e) {
    console.error("Failed to transcribe speech!", e);
    return undefined;
  }
};
