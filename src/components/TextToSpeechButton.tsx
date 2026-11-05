'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Gauge } from 'lucide-react';

interface Props {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeedControl?: boolean;
}

export default function TextToSpeechButton({
  text,
  className = '',
  size = 'md',
  showSpeedControl = false,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = text.replace(/<[^>]*>/g, ''); // strip HTML tags
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = rate;

    // Try to pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const cycleRate = () => {
    if (rate === 1.0) setRate(0.8);
    else if (rate === 0.8) setRate(1.2);
    else setRate(1.0);
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={speak}
        className={`flex items-center gap-1.5 rounded-xl font-medium transition-all ${
          isPlaying
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400'
            : 'bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400'
        } ${sizeClasses[size]} ${className}`}
        title={isPlaying ? 'Stop audio' : 'Listen to native pronunciation'}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs">Playing...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs">Listen</span>
          </>
        )}
      </button>

      {showSpeedControl && (
        <button
          type="button"
          onClick={cycleRate}
          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          title="Adjust speech speed (0.8x, 1x, 1.2x)"
        >
          {rate}x
        </button>
      )}
    </div>
  );
}
