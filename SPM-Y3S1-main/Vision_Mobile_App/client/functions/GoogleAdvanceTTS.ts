import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Create the client
const client = new TextToSpeechClient();

interface SynthesizeProps {
  text: string;
  outputFile: string;
  languageCode: string;
  ssmlGender: string;
}

export const synthesizeWithEffectsProfile = async ({
  text,
  outputFile,
  languageCode,
  ssmlGender,
}: SynthesizeProps): Promise<void> => {
  try {
    // Set effects profile id, in this case for telephony
    const effectsProfileId = ['telephony-class-application'];

    const request = {
      input: { text },
      voice: { languageCode, ssmlGender },
      audioConfig: {
        audioEncoding: 'MP3', // Set the output audio format to MP3
        effectsProfileId,
      },
    };

    // Request TTS from Google
    const [response] = await client.synthesizeSpeech(request);

    // Get path to write audio file (platform-specific)
    const fileUri = `${FileSystem.documentDirectory}${outputFile}.mp3`;

    // Write the audio content to a file
    await FileSystem.writeAsStringAsync(fileUri, response.audioContent, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log(`Audio content written to file: ${fileUri}`);
  } catch (error) {
    console.error('Error during speech synthesis:', error);
  }
};

// Example usage in a React Native component
const handleSynthesize = async () => {
  const text = 'Text you want to vocalize';
  const outputFile = 'output'; // Name of the file without extension
  const languageCode = 'en-US';
  const ssmlGender = 'FEMALE';

  await synthesizeWithEffectsProfile({
    text,
    outputFile,
    languageCode,
    ssmlGender,
  });
};
