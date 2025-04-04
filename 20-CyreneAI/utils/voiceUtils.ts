export interface VoiceConfig {
  useMockData: boolean;
  modelPath: string;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

// Types for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

class VoiceManager {
  async fetchVoices(): Promise<Voice[]> {
    return fetchVoices(); 
  }
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }



  startListening(onResult: (text: string) => void, onEnd: () => void): void {
    if (!this.recognition) {
      // console.error('Speech recognition not supported');
      return;
    }

    if (this.isListening) return;

    this.isListening = true;
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (!this.recognition || !this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
  }

  
  async generateVoice(text: string, voice: string): Promise<string | null> {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          voice, // Pass the selected voice
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate voice');
      }
      
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error generating voice:', error);
      return null;
    }
  }


  
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export async function fetchVoices(): Promise<Voice[]> {
  try {
    const response = await fetch('https://kokoro.cyreneai.com/v1/audio/voices');
    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }
    const data = await response.json();
    
    // Transform the array of strings into an array of Voice objects
    return data.voices.map((voiceId: string) => {
      const [gender, name] = voiceId.split('_'); // Split the voiceId into gender and name
      return {
        id: voiceId,
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize the name
        language: 'en', // Default language (you can adjust this based on the voiceId)
        gender: gender === 'af' || gender === 'bf' || gender === 'ef' || gender === 'ff' || gender === 'hf' || gender === 'if' || gender === 'jf' || gender === 'pf' || gender === 'zf' ? 'female' : 'male', // Determine gender based on prefix
      };
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
}


export default VoiceManager; 