"use client";

import { useEffect, useRef } from "react";

interface FireworksProps {
  isShooting?: boolean;
}

export default function Fireworks({ isShooting = true }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isShootingRef = useRef(isShooting);

  useEffect(() => {
    isShootingRef.current = isShooting;
  }, [isShooting]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let rockets: Rocket[] = [];
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const startTime = Date.now();

    // Resize handler
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Utility functions
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    class Rocket {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      trail: { x: number; y: number }[];
      thickness: number;

      constructor(forceCenter: boolean = false) {
        if (forceCenter) {
           this.x = w / 2 + random(-10, 10);
        } else {
           this.x = random(w * 0.1, w * 0.9);
        }
        this.y = h;
        this.vx = random(-1.5, 1.5); // Slower horizontal drift
        // To launch higher but slower:
        // Lower initial speed, but VERY low gravity/drag so it keeps going.
        this.vy = random(-13, -9); 
        this.color = `hsl(${random(0, 360)}, 100%, 50%)`;
        this.trail = [];
        this.thickness = random(3, 5); // Thicker rockets
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        // Draw trail
        if (this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let point of this.trail) {
                 ctx.lineTo(point.x, point.y);
            }
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness; // Thicker trail
        ctx.lineCap = "round";
        ctx.stroke();
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.restore();
      }

      update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 8) this.trail.shift(); // Longer trail (was 5)
        
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // Very low gravity (was 0.15/0.2) to allow high slow rise
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      decay: number;
      size: number;
      sparkle: number; // Sparkle/flicker offset

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = random(0, Math.PI * 2);
        // HUGE explosion
        const speed = random(5, 12); 
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = color;
        this.decay = random(0.008, 0.015); // Long lasting
        this.size = random(2, 4);
        this.sparkle = random(0, 1);
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        
        // Sparkling effect: Randomly modulate alpha
        const flicker = Math.random() > 0.8 ? 0.5 : 1; 
        ctx.globalAlpha = this.alpha * flicker;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a "glitter" core
        if (Math.random() > 0.7) {
             ctx.fillStyle = "white";
             ctx.beginPath();
             ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
             ctx.fill();
        }
        
        ctx.restore();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95; 
        this.vy *= 0.95; 
        this.vy += 0.06; // Low gravity for particles too
        this.alpha -= this.decay;
      }
    }

    const loop = () => {
      // Clear with trail effect
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Slower fade for trails (was 0.2)
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Progressive Launch Logic
      if (isShootingRef.current) {
         const elapsed = Date.now() - startTime;
         let spawnChance = 0.02; // Base chance

         // Ramping up intensity over time
         if (elapsed < 3000) {
             // First 3 seconds: Start slow, center only
             if (rockets.length === 0 && Math.random() < 0.05) rockets.push(new Rocket(true));
         } else {
             // After 3s: Increase chance over time
             spawnChance += (elapsed / 20000) * 0.1; // Increases significantly
             const count = Math.ceil(1 + (elapsed / 10000)); // Allow multiple rockets at once later
             
             if (Math.random() < spawnChance) {
                 for(let k=0; k< Math.min(count, 3); k++) {
                     rockets.push(new Rocket(false));
                 }
             }
         }
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.update();
        rocket.draw();

        // Explode condition
        if (rocket.vy >= -1.5) { // Explode slightly earlier/higher velocity
          // Create explosion particles
          const particleCount = 200; // Even more particles
          for (let j = 0; j < particleCount; j++) {
            particles.push(new Particle(rocket.x, rocket.y, rocket.color));
          }
          rockets.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full bg-black"
    />
  );
}
