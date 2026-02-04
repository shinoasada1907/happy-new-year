"use client";

import { useEffect, useState } from "react";
import Countdown from "./components/Countdown";
import Fireworks from "./components/Fireworks";

export default function Home() {
  // phases: 'countdown' | 'fireworks' | 'ended'
  const [phase, setPhase] = useState<"countdown" | "fireworks" | "ended">("countdown");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (phase === "fireworks") {
      // Start showing text slightly before the end (e.g. at 8s of a 10s show)
      const textTimer = setTimeout(() => {
        setShowText(true);
      }, 8000); 

      const endTimer = setTimeout(() => {
        setPhase("ended");
      }, 10000); // 10s total duration

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
      {phase === "countdown" && <Countdown onComplete={handleCountdownComplete} />}
      
      {(phase === "fireworks" || phase === "ended") && (
        <>
          <Fireworks isShooting={phase === "fireworks"} />
          {showText && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-zoom-in-tunnel pointer-events-none">
               <h1 className="text-6xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-violet-500 to-red-500 animate-rainbow drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                 HAPPY NEW YEAR!
               </h1>
               <p className="mt-8 text-white text-2xl font-light tracking-widest drop-shadow-md">
                  Wishing you a wonderful year ahead.
               </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
