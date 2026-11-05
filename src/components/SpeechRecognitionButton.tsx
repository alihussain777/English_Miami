'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface Props {
  onResult: (text: string) => void;
  className?: string;
  buttonText?: string;
}

export default function SpeechRecognitionButton({
  onResult,
  className = '',
  buttonText = 'Speak Now',
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMsg('Microphone access was denied. Please allow microphone access in your browser settings.');
          } else {
            setErrorMsg(`Speech recognition error (${event.error}). Please speak clearly into your mic.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onResult]);

  const toggleListen = () => {
    setErrorMsg(null);
    if (!recognitionRef.current) {
      setErrorMsg('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
    }
  };

  return (
    <div className="inline-flex flex-col items-center">
      <button
        type="button"
        onClick={toggleListen}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-xs ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse'
            : 'bg-blue-900 hover:bg-blue-800 text-white'
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 animate-bounce" />
            <span>Listening... (Tap to stop)</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl max-w-xs text-center">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
