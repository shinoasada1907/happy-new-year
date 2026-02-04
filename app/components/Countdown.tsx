"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  onComplete: () => void;
}

export default function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [count, onComplete]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div 
        key={count} 
        className="animate-scale-up text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_35px_rgba(236,72,153,0.8)]"
      >
        {count}
      </div>
    </div>
  );
}
