import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  start: (lang?: string) => void;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

const LANG_MAP: Record<string, string> = {
  az: "az-AZ",
  tr: "tr-TR",
  en: "en-US",
  ru: "ru-RU",
};

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const shouldRestartRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window));

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Mikrofon icazəsi verilmədi. Brauzer ayarlarından icazə verin.");
        setIsListening(false);
        shouldRestartRef.current = false;
      } else if (event.error === "no-speech") {
        // Normal - just no speech detected, keep going
      } else if (event.error === "network") {
        setError("Şəbəkə xətası. İnternet bağlantınızı yoxlayın.");
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Restart recognition error:", e);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isSupported]);

  const start = useCallback((lang?: string) => {
    if (!recognitionRef.current) return;
    setError(null);
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");

    const recognition = recognitionRef.current;
    const langCode = lang ? LANG_MAP[lang] || "az-AZ" : "az-AZ";
    recognition.lang = langCode;

    try {
      recognition.start();
      setIsListening(true);
      shouldRestartRef.current = true;
    } catch (e) {
      console.error("Start recognition error:", e);
    }
  }, []);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    start,
    stop,
    reset,
    error,
  };
}
