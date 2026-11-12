'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { evaluateSpokenAccuracy, SpokenEvaluationResult } from '@/lib/voice-engine';

interface Props {
  expectedText?: string;
  onResult: (text: string, accuracyScore?: number, fullEvaluation?: SpokenEvaluationResult) => void;
  className?: string;
  buttonText?: string;
}

export default function SpeechRecognitionButton({
  expectedText = '',
  onResult,
  className = '',
  buttonText = 'Tap to Speak',
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualFallbackText, setManualFallbackText] = useState('');
  const [showManualBox, setShowManualBox] = useState(false);

  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const expectedRef = useRef(expectedText);
  const startTimeRef = useRef<number>(Date.now());
  const latestTranscriptRef = useRef<string>('');

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    expectedRef.current = expectedText;
    setLiveTranscript('');
    setErrorMsg(null);
  }, [expectedText]);

  const finalizeSpeech = (spoken: string) => {
    const clean = (spoken || '').trim();
    if (!clean) return;
    const durationSec = Math.max(1.2, (Date.now() - startTimeRef.current) / 1000);
    const evalResult = evaluateSpokenAccuracy(expectedRef.current || clean, clean, durationSec);
    onResultRef.current(clean, evalResult.overallScore, evalResult);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowManualBox(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalStr = '';
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalStr += res[0].transcript + ' ';
        } else {
          interim += res[0].transcript;
        }
      }
      const combined = (finalStr + interim).trim();
      if (combined) {
        latestTranscriptRef.current = combined;
        setLiveTranscript(combined);
      }
      if (finalStr.trim()) {
        setIsListening(false);
        finalizeSpeech(finalStr.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (latestTranscriptRef.current) {
        finalizeSpeech(latestTranscriptRef.current);
        return;
      }
      setShowManualBox(true);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone permission denied. Allow mic access or use the quick practice input below.');
      } else {
        setErrorMsg('Could not capture clear audio from microphone. Try speaking again or test below.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (latestTranscriptRef.current) {
        finalizeSpeech(latestTranscriptRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  }, []);

  const toggleListen = () => {
    setErrorMsg(null);
    if (!recognitionRef.current) {
      setShowManualBox(true);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        latestTranscriptRef.current = '';
        setLiveTranscript('');
        startTimeRef.current = Date.now();
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            startTimeRef.current = Date.now();
            recognitionRef.current?.start();
            setIsListening(true);
          }, 150);
        } catch {
          setShowManualBox(true);
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={toggleListen}
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-[0_5px_0_0_#881337]'
              : 'btn-3d-primary'
          } ${className}`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-bounce" />
              <span>Listening... Speak Now (Tap when done)</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>{buttonText}</span>
            </>
          )}
        </button>

        {!showManualBox && (
          <button
            type="button"
            onClick={() => {
              setShowManualBox(true);
              if (expectedText && !manualFallbackText) {
                setManualFallbackText(expectedText);
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            Can&apos;t use mic right now?
          </button>
        )}
      </div>

      {liveTranscript && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
          🎙️ Heard: &ldquo;{liveTranscript}&rdquo;
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-xl max-w-md text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {showManualBox && (
        <div className="w-full max-w-md p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Speak aloud and verify your sentence below:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualFallbackText}
              onChange={(e) => setManualFallbackText(e.target.value)}
              placeholder={expectedText || 'Type what you spoke...'}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => finalizeSpeech(manualFallbackText || expectedText)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Evaluate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
