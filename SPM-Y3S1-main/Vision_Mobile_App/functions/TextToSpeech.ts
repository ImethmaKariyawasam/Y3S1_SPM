import axios from "axios";
import { Request, Response } from "express";
export const playAudio = async (req: Request, res: Response) => {
  const text = req.body.text;
  const apiKey = "AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps";
  const endPoint =
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const audioData = {
    input: { text: text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };
  try {
    const response = await axios.post(endPoint, audioData);
    const audioContent = response.data.audioContent;
    res.json({ audioContent });
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
};
