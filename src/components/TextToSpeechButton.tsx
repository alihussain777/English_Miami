'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakRealisticText, stopSpeaking } from '@/lib/voice-engine';

interface Props {
  text: string;
  audioUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeedControl?: boolean;
  defaultRate?: number;
}

export default function TextToSpeechButton({
  text,
  audioUrl,
  className = '',
  size = 'md',
  showSpeedControl = false,
  defaultRate = 0.95,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(defaultRate);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSpeak = (customRate?: number) => {
    if (isPlaying && customRate === undefined) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    const activeRate = customRate ?? rate;
    setIsPlaying(true);
    speakRealisticText(text, {
      rate: activeRate,
      audioUrl,
      preferBrowserTTS: true,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    });
  };

  const cycleRate = () => {
    const nextRate = rate === 0.95 ? 0.7 : rate === 0.7 ? 1.15 : 0.95;
    setRate(nextRate);
    if (isPlaying) {
      handleSpeak(nextRate);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs sm:text-sm',
    lg: 'px-4 py-2.5 text-sm sm:text-base',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => handleSpeak()}
        className={`inline-flex items-center gap-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
          isPlaying
            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400'
            : 'bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700'
        } ${sizeClasses[size]} ${className}`}
        title={isPlaying ? 'Stop audio' : 'Listen to realistic English pronunciation'}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Playing...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Listen</span>
          </>
        )}
      </button>

      {showSpeedControl && (
        <button
          type="button"
          onClick={cycleRate}
          className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 cursor-pointer"
          title="Adjust voice speed (0.7x Slow, 0.95x Natural, 1.15x Fast)"
        >
          {rate === 0.7 ? '🐢 0.7x' : rate === 1.15 ? '⚡ 1.15x' : '🔊 1.0x'}
        </button>
      )}
    </div>
  );
}
