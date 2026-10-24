import React from 'react';
import { ModelArchitecture } from '../components/ModelArchitecture';
import { GlassCard } from '../components/GlassCard';
import { Cpu, ShieldCheck, Zap, BookOpen, Layers } from 'lucide-react';

export const AboutModel: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-950/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 liquid-glass rounded-full text-xs font-mono text-cyan-300 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>NEURAL ARCHITECTURE EXPLORER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
            Attention-Enhanced Hybrid Network
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1 max-w-2xl">
            Uniting localized inductive biases from modern convolutional encoders with global
            relational self-attention from hierarchical vision transformers.
          </p>
        </div>

        {/* Interactive Model Architecture Flow */}
        <ModelArchitecture />

        {/* Technical Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard
            title="Localized CNN Priors"
            subtitle="High-frequency feature extraction"
          >
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Standard Vision Transformers lack 2D translational equivariance and scale priors in
              early stages. The ConvNeXt encoder preserves sharp lesion contours, micro-calcifications,
              and tissue attenuation interfaces.
            </p>
          </GlassCard>

          <GlassCard
            title="Global Transformer Context"
            subtitle="Cross-window relational attention"
          >
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Shifted-window multi-head self-attention models long-range spatial dependencies across
              the bilateral cerebral hemispheres, enabling detection of midline shift, ventricular
              compression, and contralateral symmetry.
            </p>
          </GlassCard>

          <GlassCard
            title="Confidence Calibration"
            subtitle="Post-hoc temperature scaling"
          >
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Standard deep neural networks tend toward overconfidence. Post-hoc temperature scaling
              calibrates raw logits against validation Negative Log-Likelihood, aligning model
              probabilities with clinical empirical accuracy.
            </p>
          </GlassCard>
        </div>

        {/* Research Disclaimer */}
        <div className="p-5 rounded-2xl liquid-glass text-center text-xs text-slate-500 font-light max-w-3xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400/60 shrink-0" />
          <span>
            Research-use system. Outputs are educational decision aids and do not constitute a medical diagnosis.
          </span>
        </div>
      </div>
    </div>
  );
};
