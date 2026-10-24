"use client";

import { useEffect, useRef, useState } from "react";

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
  colorType: "cyan" | "blue" | "violet";
  aspectRatio: number; // for perspective reflection
}

interface FallingDroplet {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  size: number;
  trail: { x: number; y: number }[];
}

export function DropletCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let ripples: Ripple[] = [];
    let fallingDroplets: FallingDroplet[] = [];
    let lastDropTime = performance.now();
    let width = 0;
    let height = 0;
    let isVisible = true;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Pause when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const triggerRipple = (x: number, y: number, colorType?: "cyan" | "blue" | "violet") => {
      const colors: ("cyan" | "blue" | "violet")[] = ["cyan", "blue", "violet"];
      const chosenColor = colorType || colors[Math.floor(Math.random() * colors.length)];
      
      // Spawn 2-3 concentric waves
      for (let i = 0; i < 3; i++) {
        ripples.push({
          x,
          y,
          radius: i * 8,
          maxRadius: Math.min(width, height) * 0.45 + Math.random() * 80,
          opacity: 0.9 - i * 0.2,
          speed: 1.2 + i * 0.4,
          colorType: chosenColor,
          aspectRatio: 0.38, // Elliptical perspective on water surface
        });
      }
    };

    const triggerDropletDrop = (targetX?: number, targetY?: number) => {
      const x = targetX ?? width * 0.5 + (Math.random() * 240 - 120);
      const surfaceY = targetY ?? height * 0.58 + (Math.random() * 60 - 30);
      fallingDroplets.push({
        x,
        y: surfaceY - 140 - Math.random() * 60,
        targetY: surfaceY,
        speed: 4.8 + Math.random() * 2,
        size: 3.5,
        trail: [],
      });
    };

    // Initial ripples
    triggerDropletDrop(width * 0.5, height * 0.55);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.x;
      const y = clientY - rect.y;
      triggerRipple(x, y, "cyan");
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });

    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < 180) return; // throttle mouse move ripples
      lastMoveTime = now;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.x;
      const y = e.clientY - rect.y;
      if (Math.random() > 0.4) {
        triggerRipple(x, y, "blue");
      }
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Main animation loop
    const render = (time: number) => {
      if (!isPaused && !prefersReducedMotion && isVisible) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Dark reflective gradient background with ambient depth glow
        const bgGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.55,
          20,
          width * 0.5,
          height * 0.55,
          Math.max(width, height) * 0.7
        );
        bgGrad.addColorStop(0, "rgba(8, 23, 43, 0.7)");
        bgGrad.addColorStop(0.5, "rgba(5, 11, 24, 0.85)");
        bgGrad.addColorStop(1, "rgba(5, 11, 24, 0.98)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Autonomous droplet spawner
        if (time - lastDropTime > 3200) {
          triggerDropletDrop();
          lastDropTime = time;
        }

        // Draw and update falling droplets
        for (let i = fallingDroplets.length - 1; i >= 0; i--) {
          const drop = fallingDroplets[i];
          drop.y += drop.speed;
          drop.speed += 0.28; // gravity

          // Droplet glow
          const dropGlow = ctx.createRadialGradient(
            drop.x,
            drop.y,
            0,
            drop.x,
            drop.y,
            drop.size * 3.5
          );
          dropGlow.addColorStop(0, "rgba(0, 229, 240, 0.95)");
          dropGlow.addColorStop(0.5, "rgba(22, 119, 255, 0.5)");
          dropGlow.addColorStop(1, "rgba(102, 87, 255, 0)");

          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = dropGlow;
          ctx.fill();

          // Droplet body
          ctx.beginPath();
          ctx.ellipse(drop.x, drop.y, drop.size * 0.8, drop.size * 1.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#F7FAFF";
          ctx.fill();

          // Splash impact on surface
          if (drop.y >= drop.targetY) {
            triggerRipple(drop.x, drop.targetY, "cyan");
            fallingDroplets.splice(i, 1);
          }
        }

        // Draw and update ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i];
          rip.radius += rip.speed;
          rip.opacity *= 0.984;

          if (rip.opacity <= 0.015 || rip.radius >= rip.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            rip.x,
            rip.y,
            rip.radius,
            rip.radius * rip.aspectRatio,
            0,
            0,
            Math.PI * 2
          );

          let strokeColor = `rgba(0, 229, 240, ${rip.opacity})`;
          if (rip.colorType === "blue") {
            strokeColor = `rgba(22, 119, 255, ${rip.opacity})`;
          } else if (rip.colorType === "violet") {
            strokeColor = `rgba(102, 87, 255, ${rip.opacity})`;
          }

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = Math.max(1, 2.2 * (1 - rip.radius / rip.maxRadius));
          ctx.stroke();

          // Delicate specular glow on water surface
          if (rip.radius < rip.maxRadius * 0.35) {
            ctx.shadowColor = "#00E5F0";
            ctx.shadowBlur = 8;
            ctx.stroke();
          }

          ctx.restore();
        }

        // Draw subtle central reflective surface grid
        ctx.save();
        ctx.strokeStyle = "rgba(0, 229, 240, 0.035)";
        ctx.lineWidth = 1;
        const horizonY = height * 0.58;
        for (let step = -4; step <= 4; step++) {
          const rx = width * 0.5;
          const ry = horizonY + step * 18;
          ctx.beginPath();
          ctx.ellipse(rx, ry, width * 0.45, (width * 0.45) * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, [isPaused, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] md:h-[600px] lg:h-[680px] overflow-hidden rounded-3xl border border-drop-cyan/20 bg-drop-navy shadow-2xl shadow-drop-cyan/5"
      aria-label="Interactive visual: A luminous droplet creating ripples across a dark reflective surface"
      role="img"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer transition-opacity duration-500"
        tabIndex={0}
        aria-label="Droplet surface simulation. Click or tap anywhere to generate waves."
        title="Click or tap to create ripples"
      />

      {/* Surface Ambient Glow Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-drop-navy via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-50" />

      {/* Interactive Hint */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex items-center gap-2 pointer-events-none text-xs text-drop-muted bg-drop-midnight/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-drop-cyan/20">
        <span className="w-2 h-2 rounded-full bg-drop-cyan animate-ping" />
        <span>Click, tap, or move over the surface to form ripples</span>
      </div>

      {/* Motion Controls for Accessibility */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="text-xs px-3 py-1.5 rounded-full bg-drop-midnight/80 hover:bg-drop-midnight text-drop-muted hover:text-drop-white border border-drop-cyan/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan transition-colors"
          aria-label={isPaused ? "Play ripple animation" : "Pause ripple animation"}
        >
          {isPaused ? "Play Waves" : "Pause Waves"}
        </button>
      </div>
    </div>
  );
}
