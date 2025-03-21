import { Audio } from "expo-av";

export const speak = async (text: string) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({
        uri: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          text
        )}&tl=en&client=tw-ob`,
      });
      await soundObject.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  };