import React, { useState, useEffect } from 'react';
import { AppNavigation } from './components/AppNavigation';
import { Dashboard } from './pages/Dashboard';
import { CTAnalyzer } from './pages/CTAnalyzer';
import { ModelPerformance } from './pages/ModelPerformance';
import { ExperimentComparison } from './pages/ExperimentComparison';
import { AboutModel } from './pages/AboutModel';
import { DatasetPage } from './pages/DatasetPage';
import { ModelInfo, ModelMetrics, PageTab } from './types';
import { fetchActiveMetrics, fetchHealth, fetchModelInfo } from './services/api';
import { NeuralBackground, AnimationMode } from './components/NeuralBackground';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<PageTab>('dashboard');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [activeMetrics, setActiveMetrics] = useState<ModelMetrics | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Background Brightness & Lighting Theme state
  const [themeMode, setThemeMode] = useState<'luminous' | 'radiant' | 'midnight'>(() => {
    return (localStorage.getItem('neuroscan_theme') as any) || 'luminous';
  });
  const [bgBrightness, setBgBrightness] = useState<number>(() => {
    const saved = localStorage.getItem('neuroscan_brightness');
    return saved ? parseFloat(saved) : 1.05;
  });

  // Background Animation State (Neural Connectome / CT Radar / Particles)
  const [animMode, setAnimMode] = useState<AnimationMode>(() => {
    return (localStorage.getItem('neuroscan_anim_mode') as any) || 'neural';
  });
  const [animSpeed, setAnimSpeed] = useState<'calm' | 'dynamic' | 'vibrant'>(() => {
    return (localStorage.getItem('neuroscan_anim_speed') as any) || 'dynamic';
  });

  const handleThemeChange = (mode: 'luminous' | 'radiant' | 'midnight') => {
    setThemeMode(mode);
    localStorage.setItem('neuroscan_theme', mode);
  };

  const handleBrightnessChange = (val: number) => {
    setBgBrightness(val);
    localStorage.setItem('neuroscan_brightness', val.toString());
  };

  const handleAnimModeChange = (mode: AnimationMode) => {
    setAnimMode(mode);
    localStorage.setItem('neuroscan_anim_mode', mode);
  };

  const handleAnimSpeedChange = (speed: 'calm' | 'dynamic' | 'vibrant') => {
    setAnimSpeed(speed);
    localStorage.setItem('neuroscan_anim_speed', speed);
  };

  const handleSelectSampleAndAnalyze = (file: File) => {
    setPendingFile(file);
    setCurrentTab('analyzer');
  };

  const loadSystemState = async () => {
    try {
      await fetchHealth();
      setServerOnline(true);
      const info = await fetchModelInfo();
      setModelInfo(info);
      const m = await fetchActiveMetrics();
      setActiveMetrics(m);
    } catch {
      setServerOnline(false);
    }
  };

  useEffect(() => {
    loadSystemState();
    const interval = setInterval(loadSystemState, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative min-h-screen flex flex-col text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden theme-${themeMode}`}
      style={{
        backgroundColor: 'var(--bg-base)',
        filter: bgBrightness !== 1 ? `brightness(${bgBrightness})` : undefined,
        transition: 'background-color 0.4s ease, filter 0.2s ease',
      }}
    >
      {/* Eye-Catching 60fps Interactive Neural Synapse Background Animation */}
      <NeuralBackground mode={animMode} speed={animSpeed} interactive={true} />

      {/* Top Global Navigation with Brightness, Animation & Telemetry Controls */}
      <AppNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        modelInfo={modelInfo}
        serverOnline={serverOnline}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        bgBrightness={bgBrightness}
        onBrightnessChange={handleBrightnessChange}
        animMode={animMode}
        onAnimModeChange={handleAnimModeChange}
        animSpeed={animSpeed}
        onAnimSpeedChange={handleAnimSpeedChange}
      />

      {/* Main Product Workspace */}
      <main className="relative z-10 flex-1 w-full pb-14">
        {currentTab === 'dashboard' && (
          <Dashboard
            modelInfo={modelInfo}
            activeMetrics={activeMetrics}
            onNavigate={setCurrentTab}
            onSelectSample={handleSelectSampleAndAnalyze}
          />
        )}

        {currentTab === 'analyzer' && (
          <CTAnalyzer
            modelInfo={modelInfo}
            initialFile={pendingFile}
            onClearInitialFile={() => setPendingFile(null)}
          />
        )}

        {(currentTab === 'models' || currentTab === 'about') && <AboutModel />}

        {currentTab === 'performance' && (
          <ModelPerformance
            modelInfo={modelInfo}
            onModelChanged={loadSystemState}
          />
        )}

        {currentTab === 'experiments' && (
          <ExperimentComparison onModelChanged={loadSystemState} />
        )}

        {currentTab === 'dataset' && <DatasetPage />}
      </main>

      {/* Persistent Global Clinical Disclaimer Footer */}
      <footer className="relative z-20 w-full border-t border-white/[0.08] py-5 px-4 sm:px-8 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">NeuroScan AI</span>
            <span className="text-slate-600">—</span>
            <span className="hidden md:inline text-slate-400">
              Attention-Enhanced Hybrid CNN–Transformer Network for Robust Brain CT Analysis
            </span>
          </div>

          <div className="flex items-center gap-2 text-center sm:text-right">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-400">
              For research and educational decision support. Not a medical diagnosis.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
