"use client";

import { useEffect, useState, useRef } from "react";
import Countdown from "./components/Countdown";
import Fireworks from "./components/Fireworks";

export default function Home() {
  // phases: 'start' | 'countdown' | 'fireworks' | 'ended'
  const [phase, setPhase] = useState<"start" | "countdown" | "fireworks" | "ended">("start");
  const [showText, setShowText] = useState(false);
  
  // Background audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element on mount
  useEffect(() => {
    const audio = new Audio('/firework.mp3');
    audio.volume = 0.5;
    audio.preload = 'auto';
    audioRef.current = audio;
    
    return () => {
      audio.pause();
    };
  }, []);

  // Handle start button click - this unlocks audio
  const handleStart = () => {
    const audio = audioRef.current;
    if (audio) {
      // Unlock audio by playing and pausing
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        console.log('Audio unlocked via start button!');
      }).catch(err => console.log('Audio unlock failed:', err));
    }
    setPhase("countdown");
  };

  // Control audio based on phase
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (phase === "fireworks") {
      console.log('Phase changed to fireworks, playing audio...');
      audio.currentTime = 0;
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
    
    if (phase === "ended") {
      console.log('Phase changed to ended, fading out audio...');
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          console.log('Audio stopped');
        }
      }, 100);
      
      return () => clearInterval(fadeOut);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "fireworks") {
      const textTimer = setTimeout(() => {
        setShowText(true);
      }, 8000); 

      const endTimer = setTimeout(() => {
        setPhase("ended");
      }, 10000);

      return () => {
        clearTimeout(textTimer);
        clearTimeout(endTimer);
      };
    }
  }, [phase]);

  const handleCountdownComplete = () => {
    setPhase("fireworks");
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-black overflow-hidden relative">
      {/* Start Screen */}
      {phase === "start" && (
        <div className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-center animate-pulse">
            🎆 Chào Mừng Năm Mới 🎆
          </h1>
          <button
            onClick={handleStart}
            className="px-8 py-4 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 animate-bounce"
          >
            🎉 Bắt Đầu 🎉
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Click để bắt đầu màn trình diễn pháo hoa
          </p>
        </div>
      )}

      {/* Countdown */}
      {phase === "countdown" && <Countdown onComplete={handleCountdownComplete} />}
      
      {/* Fireworks and End */}
      {(phase === "fireworks" || phase === "ended") && (
        <>
          <Fireworks isShooting={phase === "fireworks"} />
          {showText && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-zoom-in-tunnel pointer-events-none w-full">
               <h1 className="text-6xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-violet-500 to-red-500 animate-rainbow drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] text-center w-full px-4">
                 HAPPY NEW YEAR!
               </h1>
               <p className="mt-8 text-white text-2xl font-light tracking-widest drop-shadow-md text-center px-4">
                  Wishing you a wonderful year ahead.
               </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

