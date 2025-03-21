import Tts from "react-native-tts";

export const initializeTts = async () => {

    Tts.getInitStatus().then((e) => {
        console.log(e)
        console.log("TTS initialized successfully");
    },

        (error) => {
            if(error.code === 'no_engine'){
                console.log("NO ENGINE TTS")
                Tts.requestInstallEngine();
            }
        }
    );
}