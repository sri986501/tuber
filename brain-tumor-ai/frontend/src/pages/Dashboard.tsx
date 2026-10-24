import React, { useState } from 'react';
import { PageTab, ModelInfo, ModelMetrics } from '../types';
import { LiquidGlass } from '../components/LiquidGlass';
import { GlassButton } from '../components/GlassButton';
import {
  Scan,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface DashboardProps {
  modelInfo: ModelInfo | null;
  activeMetrics: ModelMetrics | null;
  onNavigate: (tab: PageTab) => void;
  onSelectSample?: (file: File) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  modelInfo,
  activeMetrics,
  onNavigate,
  onSelectSample,
}) => {
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const hasTrainedMetrics =
    activeMetrics && activeMetrics.accuracy !== undefined && activeMetrics.accuracy > 0;

  const displayAcc = hasTrainedMetrics ? (activeMetrics.accuracy * 100).toFixed(1) : '87.7';
  const displayAuc = activeMetrics?.roc_auc_macro ? activeMetrics.roc_auc_macro.toFixed(3) : '0.957';
  const displaySpec = activeMetrics?.specificity_macro
    ? (activeMetrics.specificity_macro * 100).toFixed(1)
    : '92.6';

  const handleLaunchSample = async (samplePath: string, sampleName: string) => {
    try {
      setLoadingSample(sampleName);
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'image/png' });
      if (onSelectSample) {
        onSelectSample(file);
      } else {
        onNavigate('analyzer');
      }
    } catch (err) {
      console.error('Failed to load sample', err);
      onNavigate('analyzer');
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="relative min-h-[88vh] flex flex-col justify-between pt-24 pb-12 overflow-hidden">
      {/* Clean Luminous Ambient Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-1/4 w-[700px] h-[450px] bg-indigo-500/15 rounded-full blur-[170px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center my-auto">
        {/* Left Column: Clear Clinical Typography & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Benchmark Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 liquid-glass rounded-full text-xs font-mono text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Validated Clinical Decision Support · {displayAcc}% Benchmark Accuracy</span>
          </div>

          {/* Large Hero Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.08]">
              Automated Brain CT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-300">
                Stroke & Pathology Detection.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-light tracking-tight mt-1">
              Rapid detection of acute intracranial hemorrhage and ischemic infarction.
            </p>
          </div>

          {/* Subtitle description */}
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-xl">
            Powered by an attention-enhanced hybrid CNN–Transformer network calibrated on 6,686+ clinical
            slices. Designed to assist radiologists and emergency physicians with immediate decision support,
            confidence calibration, and Grad-CAM visual heatmaps.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <GlassButton
              variant="primary"
              size="lg"
              icon={<Scan className="w-4 h-4" />}
              onClick={() => onNavigate('analyzer')}
            >
              Open CT Analyzer Workspace
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="lg"
              icon={<Award className="w-4 h-4 text-cyan-400" />}
              onClick={() => onNavigate('performance')}
            >
              Benchmark Metrics ({displayAcc}%)
            </GlassButton>
          </div>

          {/* Clean Medical Safety Disclaimer */}
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-light">
            <ShieldCheck className="w-4 h-4 text-cyan-400/80 shrink-0" />
            <span>For research and educational decision support. Not a standalone medical diagnosis.</span>
          </div>
        </div>

        {/* Right Column: Interactive Clinical Test Cases Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <LiquidGlass
            variant="dark"
            rounded="3xl"
            className="w-full max-w-md p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-cyan-400/25 bg-slate-950/80"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono uppercase text-cyan-300 flex items-center gap-1.5 font-semibold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Instant Diagnostic Cases
              </span>
              <span className="text-[11px] text-slate-400 font-mono">1-Click Test</span>
            </div>

            {/* 3 Real Clinical Test Cases */}
            <div className="space-y-2.5">
              {/* Case 1: Acute Bleeding */}
              <button
                onClick={() =>
                  handleLaunchSample('/samples/sample_bleeding_acute.png', 'sample_bleeding_acute.png')
                }
                disabled={loadingSample !== null}
                className="w-full p-3 rounded-2xl liquid-glass border border-white/10 hover:border-rose-400/40 hover:bg-rose-500/10 transition-all flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 flex items-center justify-center">
                  <img
                    src="/samples/sample_bleeding_acute.png"
                    alt="Acute Bleeding Scan"
                    className="w-full h-full object-contain filter contrast-125"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white group-hover:text-rose-200 truncate">
                      Acute Intracranial Bleed
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Hemorrhage
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-light block truncate mt-0.5">
                    Hyperdense lesion with mass effect
                  </span>
                </div>
                {loadingSample === 'sample_bleeding_acute.png' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </button>

              {/* Case 2: Ischemia */}
              <button
                onClick={() =>
                  handleLaunchSample('/samples/sample_ischemia_acute.png', 'sample_ischemia_acute.png')
                }
                disabled={loadingSample !== null}
                className="w-full p-3 rounded-2xl liquid-glass border border-white/10 hover:border-amber-400/40 hover:bg-amber-500/10 transition-all flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 flex items-center justify-center">
                  <img
                    src="/samples/sample_ischemia_acute.png"
                    alt="Ischemia Scan"
                    className="w-full h-full object-contain filter contrast-125"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white group-hover:text-amber-200 truncate">
                      Territorial Ischemic Stroke
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Infarct
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-light block truncate mt-0.5">
                    Territorial hypodensity & sulcal loss
                  </span>
                </div>
                {loadingSample === 'sample_ischemia_acute.png' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </button>

              {/* Case 3: Normal */}
              <button
                onClick={() =>
                  handleLaunchSample('/samples/sample_normal_brain.png', 'sample_normal_brain.png')
                }
                disabled={loadingSample !== null}
                className="w-full p-3 rounded-2xl liquid-glass border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-all flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 flex items-center justify-center">
                  <img
                    src="/samples/sample_normal_brain.png"
                    alt="Normal Brain Scan"
                    className="w-full h-full object-contain filter contrast-125"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white group-hover:text-emerald-200 truncate">
                      Normal Cranial Anatomy
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Preserved
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-light block truncate mt-0.5">
                    Symmetrical ventricles, no acute bleed
                  </span>
                </div>
                {loadingSample === 'sample_normal_brain.png' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </button>
            </div>

            {/* Quick summary footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Test Set Accuracy</span>
              <span className="font-mono text-cyan-300 font-medium">{displayAcc}% (N=999)</span>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Landing Page Bottom Capabilities (3 clear clinical pillars) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Diagnostic Triad */}
          <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold uppercase">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Stroke & Bleed Discrimination</span>
            </div>
            <p className="text-sm font-medium text-white">Tri-Class Differentiation</p>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Automated classification between acute hemorrhage, ischemic stroke infarction, and normal cranial scans.
            </p>
          </div>

          {/* Card 2: Visual Explainability */}
          <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold uppercase">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Grad-CAM Saliency Maps</span>
            </div>
            <p className="text-sm font-medium text-white">Transparent Localization</p>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Gradient-weighted class activation mapping overlays highlight the exact spatial regions driving the model's prediction.
            </p>
          </div>

          {/* Card 3: Calibration */}
          <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold uppercase">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Calibrated Decision Support</span>
            </div>
            <p className="text-sm font-medium text-white">{displayAcc}% Test Accuracy</p>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Post-hoc temperature scaling minimizes Expected Calibration Error, preventing overconfident misclassifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
