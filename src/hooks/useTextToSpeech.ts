import { useState, useCallback, useRef, useEffect } from 'react';

// Rank voices by quality for educational content
const getVoiceScore = (voice: SpeechSynthesisVoice): number => {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  
  // Prioritize English voices
  if (!lang.startsWith('en')) return 0;
  
  // Premium voices (Google, Apple enhanced)
  if (name.includes('google') && name.includes('us')) return 100;
  if (name.includes('google') && name.includes('uk')) return 95;
  if (name.includes('samantha')) return 90; // Apple's best
  if (name.includes('karen')) return 88; // Apple Australian
  if (name.includes('daniel')) return 85; // Apple UK
  if (name.includes('natural')) return 80;
  if (name.includes('enhanced')) return 75;
  if (name.includes('premium')) return 75;
  
  // Good quality voices
  if (name.includes('google')) return 70;
  if (name.includes('microsoft') && name.includes('online')) return 65;
  if (name.includes('zira') || name.includes('david')) return 60;
  
  // Default/system voices
  if (voice.localService) return 40;
  
  return 30;
};

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bestVoice, setBestVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Find the best voice when voices are loaded
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const findBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      
      // Sort voices by quality score
      const sortedVoices = [...voices].sort((a, b) => getVoiceScore(b) - getVoiceScore(a));
      const best = sortedVoices[0];
      
      if (best && getVoiceScore(best) > 0) {
        setBestVoice(best);
        console.log('Selected TTS voice:', best.name, 'Score:', getVoiceScore(best));
      }
    };

    // Voices may load async
    findBestVoice();
    window.speechSynthesis.onvoiceschanged = findBestVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsLoading(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Use best available voice
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [bestVoice]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback((text: string) => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  }, [isPlaying, speak, stop]);

  return {
    isPlaying,
    isLoading,
    speak,
    stop,
    toggle,
    isSupported: 'speechSynthesis' in window,
    currentVoice: bestVoice?.name || 'Default',
  };
}
