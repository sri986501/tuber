import React, { useState } from 'react';
import { LiquidGlass } from './LiquidGlass';
import {
  Eye,
  Layers,
  Sparkles,
  Image as ImageIcon,
  ZoomIn,
  Sun,
  Contrast,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CTViewerProps {
  originalUrl?: string;
  heatmapUrl?: string;
  overlayUrl?: string;
  className?: string;
}

export type ViewTab = 'overlay' | 'gradcam' | 'original' | 'attention';

type WindowPreset = 'default' | 'brighten' | 'brain' | 'tumor' | 'bone' | 'blood' | 'invert';

export const CTViewer: React.FC<CTViewerProps> = ({
  originalUrl,
  heatmapUrl,
  overlayUrl,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('overlay');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Brightness, Contrast, and Opacity Controls
  const [brightness, setBrightness] = useState<number>(115);
  const [contrast, setContrast] = useState<number>(110);
  const [invert, setInvert] = useState<boolean>(false);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(65);
  const [activePreset, setActivePreset] = useState<WindowPreset>('brighten');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);

  // Presets mapping
  const applyPreset = (preset: WindowPreset) => {
    setActivePreset(preset);
    switch (preset) {
      case 'default':
        setBrightness(100);
        setContrast(100);
        setInvert(false);
        break;
      case 'brighten':
        setBrightness(135);
        setContrast(115);
        setInvert(false);
        break;
      case 'brain':
        setBrightness(115);
        setContrast(145);
        setInvert(false);
        break;
      case 'tumor':
        setBrightness(120);
        setContrast(160);
        setInvert(false);
        break;
      case 'bone':
        setBrightness(70);
        setContrast(220);
        setInvert(false);
        break;
      case 'blood':
        setBrightness(125);
        setContrast(165);
        setInvert(false);
        break;
      case 'invert':
        setBrightness(110);
        setContrast(120);
        setInvert(true);
        break;
    }
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setActivePreset('default');
  };

  const imageFilterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%)${invert ? ' invert(1)' : ''}`,
    transition: 'filter 0.15s ease-out',
  };

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overlay', label: 'Grad-CAM Fusion', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'original', label: 'Raw CT Slice', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'gradcam', label: 'Heatmap Only', icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  const currentImg =
    activeTab === 'original'
      ? originalUrl
      : activeTab === 'gradcam'
      ? heatmapUrl
      : overlayUrl || originalUrl;

  return (
    <div className={`flex flex-col gap-3.5 ${className}`}>
      {/* Top Header: Tabs & Quick Toggles */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {/* Layer Selector */}
        <div className="flex items-center gap-1.5 p-1 liquid-glass rounded-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium shadow-[0_0_12px_rgba(56,189,248,0.3)] border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Options: Brightness controls toggle & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowControls(!showControls)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer liquid-glass ${
              showControls
                ? 'text-cyan-300 bg-cyan-500/15 border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Brightness & Windowing Toolbar"
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-mono">Brightness ({brightness}%)</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 liquid-glass rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen Zoom"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className={`relative aspect-square w-full rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl flex items-center justify-center p-3 overflow-hidden backdrop-blur-xl transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-4 z-50 aspect-auto bg-slate-950/95 max-w-5xl mx-auto my-auto h-[88vh] border-cyan-500/30'
            : ''
        }`}
      >
        {/* Subtle grid background to highlight CT edge transparency */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {currentImg ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImg}
              alt={`${activeTab} CT view`}
              style={imageFilterStyle}
              className="max-h-full max-w-full object-contain rounded-2xl select-none"
            />

            {/* Subtle medical crosshair lines */}
            <div className="absolute inset-0 pointer-events-none opacity-25">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
            </div>

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 rounded-br-sm pointer-events-none" />
          </div>
        ) : (
          <div className="text-center p-8 text-slate-400 font-light text-xs flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8 text-slate-600 animate-pulse" />
            <span>Awaiting image stream...</span>
          </div>
        )}

        {/* View Badge & Live Brightness Indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="px-3 py-1 liquid-glass rounded-full text-[10px] uppercase font-mono tracking-wider text-cyan-200 border border-cyan-400/20">
            Layer: {activeTab}
          </div>
          {(brightness !== 100 || contrast !== 100 || invert) && (
            <div className="px-2.5 py-1 liquid-glass rounded-full text-[10px] font-mono text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Sun className="w-3 h-3" />
              <span>{brightness}% · {contrast}% C</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Brightness & Windowing Toolbar */}
      {showControls && (
        <div className="p-3.5 liquid-glass rounded-2xl space-y-3 border border-white/10 animate-fadeIn">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              Windowing Presets:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'brighten', label: '☀️ Enhanced Bright (+35%)' },
                { id: 'brain', label: '🧠 Brain Tissue' },
                { id: 'blood', label: '🩸 Blood / Hemorrhage' },
                { id: 'bone', label: '🦴 Bone Window' },
                { id: 'invert', label: '🔄 Invert' },
                { id: 'default', label: 'Reset (100%)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id as WindowPreset)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                    activePreset === p.id
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_8px_rgba(56,189,248,0.25)]'
                      : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Sliders: Brightness & Contrast */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.06]">
            {/* Brightness Slider */}
            <div className="flex items-center gap-2.5">
              <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[11px] font-mono text-slate-300 w-16 shrink-0">
                Bri: {brightness}%
              </span>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={brightness}
                onChange={(e) => {
                  setBrightness(Number(e.target.value));
                  setActivePreset('default');
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-700/60 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast Slider */}
            <div className="flex items-center gap-2.5">
              <Contrast className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-[11px] font-mono text-slate-300 w-16 shrink-0">
                Con: {contrast}%
              </span>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={contrast}
                onChange={(e) => {
                  setContrast(Number(e.target.value));
                  setActivePreset('default');
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-700/60 rounded-lg cursor-pointer"
              />
              <button
                onClick={handleReset}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Reset to 100%"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
