import React from 'react';
import { Activity, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { ModelInfo } from '../types';

interface Props {
  modelInfo: ModelInfo | null;
  serverOnline: boolean;
}

export const Navbar: React.FC<Props> = ({ modelInfo, serverOnline }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm ring-4 ring-teal-50">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                NeuroScan AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-700 border border-teal-200 rounded-full uppercase">
                Research v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-md hidden sm:block">
              Attention-Enhanced Hybrid ConvNeXt–Swin Network for Brain CT Detection
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          {/* Active Model Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Model:</span>
            <span className="font-semibold text-slate-800 capitalize">
              {modelInfo?.model_name || 'Hybrid CNN-Transformer'}
            </span>
            {modelInfo?.is_calibrated && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Calibrated (T={modelInfo.temperature})
              </span>
            )}
          </div>

          {/* Backend Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-medium text-slate-700">
              {serverOnline ? 'API Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
