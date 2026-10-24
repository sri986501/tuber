import React, { useEffect, useRef, useState } from 'react';

export type AnimationMode = 'neural' | 'scan' | 'particles';

interface NeuralBackgroundProps {
  mode?: AnimationMode;
  speed?: 'calm' | 'dynamic' | 'vibrant';
  interactive?: boolean;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  color: string;
  glowColor: string;
  phase: number;
  pulseSpeed: number;
}

interface Impulse {
  startNode: number;
  endNode: number;
  progress: number;
  speed: number;
  color: string;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaStep: number;
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({
  mode = 'neural',
  speed = 'dynamic',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  const speedMultiplier = speed === 'calm' ? 0.6 : speed === 'vibrant' ? 1.6 : 1.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palette for high-tech medical neural connectome
    const colors = [
      { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' }, // Cyan
      { fill: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' }, // Teal
      { fill: '#818cf8', glow: 'rgba(129, 140, 248, 0.45)' }, // Indigo
      { fill: '#a78bfa', glow: 'rgba(167, 139, 250, 0.4)' }, // Violet
      { fill: '#34d399', glow: 'rgba(52, 211, 153, 0.4)' }, // Emerald
    ];

    // Responsive node count based on screen size
    const nodeCount = Math.min(Math.floor((width * height) / 18000), 75);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const palette = colors[i % colors.length];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7 * speedMultiplier,
        vy: (Math.random() - 0.5) * 0.7 * speedMultiplier,
        baseRadius: Math.random() * 2.2 + 1.6,
        radius: 2,
        color: palette.fill,
        glowColor: palette.glow,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.04,
      });
    }

    // Active firing action potentials (impulses traveling along synapses)
    const impulses: Impulse[] = [];
    const maxImpulses = 14;

    // Ambient floating dust particles
    const dustParticles: DustParticle[] = [];
    const dustCount = 40;
    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.2 - Math.random() * 0.4,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.6 + 0.1,
        alphaStep: 0.008 * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // CT Gantry radar sweep angle
    let scanAngle = 0;
    let scanRingRadius = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const maxDistance = 140;
    const mouseRadius = 170;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle High-Tech Telemetry Scan Beam & Medical Grid
      if (mode === 'scan' || mode === 'neural') {
        scanRingRadius = (scanRingRadius + 0.8 * speedMultiplier) % (Math.max(width, height) * 0.65);
        
        // Expanding concentric CT scanning wave
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, scanRingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.12 * (1 - scanRingRadius / (Math.max(width, height) * 0.65)))})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Second trailing telemetry wave
        const secondRadius = (scanRingRadius + Math.max(width, height) * 0.3) % (Math.max(width, height) * 0.65);
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, secondRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${Math.max(0, 0.08 * (1 - secondRadius / (Math.max(width, height) * 0.65)))})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle rotating radar azimuth indicator
        scanAngle += 0.005 * speedMultiplier;
        const scanCenterX = width * 0.5;
        const scanCenterY = height * 0.45;
        const beamLength = Math.max(width, height) * 0.45;
        const endX = scanCenterX + Math.cos(scanAngle) * beamLength;
        const endY = scanCenterY + Math.sin(scanAngle) * beamLength;

        const scanGrad = ctx.createLinearGradient(scanCenterX, scanCenterY, endX, endY);
        scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
        scanGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.02)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.beginPath();
        ctx.moveTo(scanCenterX, scanCenterY);
        ctx.arc(scanCenterX, scanCenterY, beamLength, scanAngle - 0.25, scanAngle);
        ctx.closePath();
        ctx.fillStyle = scanGrad;
        ctx.fill();
      }

      // 2. Ambient Floating Bioluminescent Dust
      dustParticles.forEach((p) => {
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        p.alpha += p.alphaStep;
        if (p.alpha <= 0.05 || p.alpha >= 0.7) p.alphaStep = -p.alphaStep;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0, p.alpha * 0.4)})`;
        ctx.fill();
      });

      // 3. Update & Draw Neural Nodes
      const mouse = mouseRef.current;
      nodes.forEach((node) => {
        // Move nodes
        node.x += node.vx * speedMultiplier;
        node.y += node.vy * speedMultiplier;

        // Bounce gently off canvas bounds
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Interactive mouse gravity repulsion/attraction
        if (interactive && mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius && dist > 1) {
            // Gentle orbital attraction toward cursor
            const force = (1 - dist / mouseRadius) * 0.02 * speedMultiplier;
            node.vx += dx * force;
            node.vy += dy * force;
            // Dampen excessive velocity
            node.vx *= 0.96;
            node.vy *= 0.96;
          }
        }

        // Pulse breathing effect
        node.phase += node.pulseSpeed * speedMultiplier;
        node.radius = node.baseRadius + Math.sin(node.phase) * 0.7;
      });

      // 4. Synaptic Axons (Connecting lines between close nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (mode === 'neural' ? 0.35 : 0.18);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);

            // Subtle gradient line
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
            grad.addColorStop(1, `rgba(129, 140, 248, ${alpha * 0.8})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = (1 - dist / maxDistance) * 1.2;
            ctx.stroke();

            // Randomly spawn firing synaptic impulses
            if (
              mode === 'neural' &&
              impulses.length < maxImpulses &&
              Math.random() < 0.002 * speedMultiplier
            ) {
              impulses.push({
                startNode: i,
                endNode: j,
                progress: 0,
                speed: (0.015 + Math.random() * 0.02) * speedMultiplier,
                color: Math.random() > 0.5 ? '#38bdf8' : '#2dd4bf',
              });
            }
          }
        }

        // Connect directly to mouse cursor when close
        if (interactive && mouse.active) {
          const mdx = mouse.x - nodes[i].x;
          const mdy = mouse.y - nodes[i].y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouseRadius) {
            const mAlpha = (1 - mdist / mouseRadius) * 0.55;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
      }

      // 5. Render Active Synaptic Impulses (Action Potentials firing)
      for (let k = impulses.length - 1; k >= 0; k--) {
        const imp = impulses[k];
        imp.progress += imp.speed;

        if (imp.progress >= 1) {
          impulses.splice(k, 1);
          continue;
        }

        const n1 = nodes[imp.startNode];
        const n2 = nodes[imp.endNode];
        if (!n1 || !n2) {
          impulses.splice(k, 1);
          continue;
        }

        const ix = n1.x + (n2.x - n1.x) * imp.progress;
        const iy = n1.y + (n2.y - n1.y) * imp.progress;

        // Glowing packet spark
        ctx.beginPath();
        ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = imp.color;
        ctx.shadowColor = imp.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      // 6. Draw Nodes with Bioluminescent Glow Halo
      nodes.forEach((node) => {
        // Outer glowing halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = node.glowColor;
        ctx.fill();

        // Inner luminous core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      // 7. Interactive Mouse Aura
      if (interactive && mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mode, speed, interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic 60fps HTML5 Canvas Engine */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ opacity: 0.9 }}
      />

      {/* Cybernetic Radial Vignette & Atmospheric Depth Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.06)_0%,rgba(11,17,32,0.85)_85%,rgba(6,9,19,0.95)_100%)] pointer-events-none" />

      {/* Subtle Medical Holographic Grid Matrix */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
