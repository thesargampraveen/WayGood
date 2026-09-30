// Text-to-speech: tap a word and the phone says it in that language
import Tts from 'react-native-tts';

// app language code -> Android/iOS TTS locale
const TTS_LOCALES = {
  hi: 'hi-IN', // Hindi
  mr: 'mr-IN', // Marathi
  en: 'en-US', // English
  te: 'te-IN', // Telugu
};

let ready = false;

const init = async () => {
  if (ready) return;
  try {
    await Tts.getInitStatus();
    ready = true;
  } catch {
    // some Android devices need the TTS engine installed first
    try {
      await Tts.requestInstallEngine();
      ready = true;
    } catch {
      // TTS not available on this device — fail silently
    }
  }
};

// speakWord('नमस्ते', 'hi') -> says the word in Hindi
export const speakWord = async (text, langCode) => {
  if (!text) return;
  await init();
  if (!ready) return;
  try {
    await Tts.setDefaultLanguage(TTS_LOCALES[langCode] || 'en-US');
    await Tts.setDefaultRate(0.45); // slow, easy for learners
    Tts.stop(); // in case the previous word is still being spoken
    Tts.speak(text);
  } catch {
    // some devices may not have a voice for this language
  }
};
