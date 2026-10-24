import React, { useState, useRef, useEffect } from 'react';
import { PageTab, ModelInfo } from '../types';
import { LiquidGlass } from './LiquidGlass';
import { MobileMenu } from './MobileMenu';
import {
  Scan,
  CircleUserRound,
  Menu,
  Activity,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Award,
  Sliders,
} from 'lucide-react';

import { AnimationMode } from './NeuralBackground';

interface AppNavigationProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  modelInfo?: ModelInfo | null;
  serverOnline: boolean;
  themeMode: 'luminous' | 'radiant' | 'midnight';
  onThemeChange: (mode: 'luminous' | 'radiant' | 'midnight') => void;
  bgBrightness: number;
  onBrightnessChange: (val: number) => void;
  animMode?: AnimationMode;
  onAnimModeChange?: (mode: AnimationMode) => void;
  animSpeed?: 'calm' | 'dynamic' | 'vibrant';
  onAnimSpeedChange?: (speed: 'calm' | 'dynamic' | 'vibrant') => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  currentTab,
  onSelectTab,
  modelInfo,
  serverOnline,
  themeMode,
  onThemeChange,
  bgBrightness,
  onBrightnessChange,
  animMode = 'neural',
  onAnimModeChange,
  animSpeed = 'dynamic',
  onAnimSpeedChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brightnessMenuOpen, setBrightnessMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setBrightnessMenuOpen(false);
      }
    };
    if (brightnessMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [brightnessMenuOpen]);

  const navLinks: { id: PageTab; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'analyzer', label: 'Analyze Scan' },
    { id: 'performance', label: 'Performance' },
    { id: 'dataset', label: 'Data & Cohort' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Best Model Accuracy Callout */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="btn-secondary px-3 py-1.5 gap-2.5 text-left group"
            >
              {/* Abstract Neural / Scan Symbol */}
              <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-transform">
                <Scan className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white tracking-tight">NeuroScan</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    AI
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-light block leading-tight">
                  Research Decision Support
                </span>
              </div>
            </button>

            {/* Best Accuracy Tag */}
            <button
              onClick={() => onSelectTab('performance')}
              className="hidden xl:flex btn-secondary text-xs font-mono py-1 px-3"
              title="Click to view verified benchmark evaluation"
            >
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Best Model: 87.7% Acc</span>
            </button>
          </div>

          {/* Center: Liquid Glass Navigation Pill (Desktop) */}
          <nav className="pointer-events-auto hidden md:flex items-center gap-1 p-1.5 liquid-glass rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`btn-nav-pill ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Background Brightness Control & Telemetry (Desktop) */}
          <div className="pointer-events-auto flex items-center gap-2.5">
            {/* Background Animation & Atmosphere Toggle */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setBrightnessMenuOpen(!brightnessMenuOpen)}
                className="btn-secondary text-xs font-mono py-1.5 px-3 flex items-center gap-2 border border-cyan-400/40 bg-cyan-950/30 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                title="Customize interactive 60fps background animation and luminescence"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
                <span className="font-mono">
                  {animMode === 'neural' ? '🧬 Neural Synapse' : animMode === 'scan' ? '🌐 CT Radar' : '✨ Particles'}
                </span>
              </button>

              {/* Theme & Background Animation Popover Menu */}
              {brightnessMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 p-4 rounded-2xl liquid-glass-dark border border-white/20 shadow-2xl space-y-4 z-50 animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-mono uppercase text-cyan-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Visual Engine & Atmosphere
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      60 FPS Active
                    </span>
                  </div>

                  {/* 1. Animation Mode Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                        Background Animation Mode:
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 capitalize">{animMode}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => onAnimModeChange && onAnimModeChange('neural')}
                        className={`p-2 rounded-xl text-center text-[10px] font-mono transition-all cursor-pointer ${
                          animMode === 'neural'
                            ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                            : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        🧬 Neural Synapse
                      </button>

                      <button
                        onClick={() => onAnimModeChange && onAnimModeChange('scan')}
                        className={`p-2 rounded-xl text-center text-[10px] font-mono transition-all cursor-pointer ${
                          animMode === 'scan'
                            ? 'bg-teal-500/25 text-teal-200 border border-teal-400/50 font-semibold shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                            : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        🌐 CT Radar
                      </button>

                      <button
                        onClick={() => onAnimModeChange && onAnimModeChange('particles')}
                        className={`p-2 rounded-xl text-center text-[10px] font-mono transition-all cursor-pointer ${
                          animMode === 'particles'
                            ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/50 font-semibold shadow-[0_0_12px_rgba(129,140,248,0.3)]'
                            : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        ✨ Dust Mesh
                      </button>
                    </div>
                  </div>

                  {/* 2. Animation Speed / Kinetics */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Kinetic Pulse Speed:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['calm', 'dynamic', 'vibrant'] as const).map((spd) => (
                        <button
                          key={spd}
                          onClick={() => onAnimSpeedChange && onAnimSpeedChange(spd)}
                          className={`py-1.5 px-2 rounded-xl text-center text-[10px] font-mono capitalize transition-all cursor-pointer ${
                            animSpeed === spd
                              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 font-semibold'
                              : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.08]'
                          }`}
                        >
                          {spd === 'calm' ? '🌱 Calm' : spd === 'dynamic' ? '⚡ Dynamic' : '🚀 Vibrant'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Luminescence Theme */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Atmosphere Lighting:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => {
                          onThemeChange('luminous');
                          onBrightnessChange(1.05);
                        }}
                        className={`p-1.5 rounded-xl text-center text-[10px] font-mono transition-all cursor-pointer ${
                          themeMode === 'luminous'
                            ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 font-semibold'
                            : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        🌟 Luminous
                      </button>

                      <button
                        onClick={() => {
                          onThemeChange('radiant');
                          onBrightnessChange(1.25);
                        }}
                        className={`p-1.5 rounded-xl text-center text-[10px] font-mono transition-all cursor-pointer ${
                          themeMode === 'radiant'
                            ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 font-semibold'
                            : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        ☀️ Radiant
                      </button>

                      <button
                        onClick={() => {
                          onThemeChange('midnight');
                          onBrightnessChange(0.9);
                        }}
                        className={`p-1.5 rounded-xl text-center text-[10px] font-mono transition-all cursor-pointer ${
                          themeMode === 'midnight'
                            ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 font-semibold'
                            : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        🌙 Midnight
                      </button>
                    </div>
                  </div>

                  {/* 4. Fine-Tuning Brightness Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>Brightness:</span>
                      <span className="text-cyan-300 font-semibold">{Math.round(bgBrightness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.40"
                      step="0.05"
                      value={bgBrightness}
                      onChange={(e) => onBrightnessChange(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700/60 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 block text-center">
                      Interactive mouse physics & synapse firing active
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 liquid-glass rounded-full text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-200">
                {serverOnline ? 'AI Diagnostic Engine Online' : 'Service Offline'}
              </span>
            </div>

            {/* Account Icon */}
            <div className="hidden md:flex items-center p-2 liquid-glass rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer">
              <CircleUserRound className="w-5 h-5 text-cyan-300/80" />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden btn-ghost"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
      />
    </>
  );
};
