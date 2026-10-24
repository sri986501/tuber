import React, { useState, useEffect } from 'react';
import { ModelInfo, PredictionResult } from '../types';
import { predictCTImage } from '../services/api';
import { CTUploader } from '../components/CTUploader';
import { CTViewer } from '../components/CTViewer';
import { PredictionPanel } from '../components/PredictionPanel';
import { GradCAMViewer } from '../components/GradCAMViewer';
import { GlassButton } from '../components/GlassButton';
import { Scan, RotateCcw, AlertCircle, Award, Sparkles, ShieldCheck } from 'lucide-react';

interface CTAnalyzerProps {
  modelInfo?: ModelInfo | null;
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export const CTAnalyzer: React.FC<CTAnalyzerProps> = ({
  modelInfo,
  initialFile,
  onClearInitialFile,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialFile) {
      handleAnalyze(initialFile);
      if (onClearInitialFile) onClearInitialFile();
    }
  }, [initialFile]);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await predictCTImage(file);
      setPrediction(result);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Analysis service unavailable. Check backend server connection.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-[90vh] pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Background Atmosphere with Vibrant Radiant Luminescence */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-cyan-500/16 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 right-1/4 w-[600px] h-[450px] bg-indigo-500/18 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 space-y-7">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 liquid-glass rounded-full text-xs font-mono text-cyan-300 border border-cyan-400/30">
                <Scan className="w-3.5 h-3.5" />
                <span>DIAGNOSTIC WORKSPACE</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 liquid-glass rounded-full text-xs font-mono text-emerald-300 border border-emerald-400/30">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Best Accuracy Model: 87.7%</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
              CT Analyzer & Explainability
            </h1>
            <p className="text-sm text-slate-300 font-light mt-1">
              Analyze brain CT scans with calibrated decision support, real-time background brightness control, and Grad-CAM attention.
            </p>
          </div>

          {prediction && (
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Analyze Another Scan
            </GlassButton>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm font-light flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-medium block text-rose-100">Inference Request Failed</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!prediction ? (
          /* Upload View with 1-Click Clinical Samples */
          <div className="py-4">
            <CTUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          /* Result View — Cinematic Diagnostic Workspace */
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column: CT Viewer with real-time brightness & windowing toolbar */}
              <div className="lg:col-span-7">
                <CTViewer
                  originalUrl={prediction.original_url}
                  heatmapUrl={prediction.heatmap_url}
                  overlayUrl={prediction.overlay_url}
                />
              </div>

              {/* Right Column: Prediction Panel with best accuracy result flow */}
              <div className="lg:col-span-5">
                <PredictionPanel prediction={prediction} modelInfo={modelInfo} />
              </div>
            </div>

            {/* Explainability Section */}
            <GradCAMViewer
              explanation={prediction.explanation}
              predictedClass={prediction.predicted_class}
            />

            {/* Medical Disclaimer */}
            <div className="p-4 rounded-2xl liquid-glass text-center text-xs text-slate-400 font-light max-w-3xl mx-auto border border-white/10">
              <strong className="text-slate-300">Notice: </strong>
              {prediction.medical_disclaimer ||
                'This model-assisted interpretation is for research and educational decision support. It does not replace histopathological or specialized radiologic diagnostic procedures.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
