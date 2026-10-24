import React from 'react';
import { GlassCard } from './GlassCard';
import { ExplanationDetails } from '../types';
import { Sparkles, Brain, Cpu, Eye } from 'lucide-react';

interface GradCAMViewerProps {
  explanation?: ExplanationDetails;
  predictedClass?: string;
  className?: string;
}

export const GradCAMViewer: React.FC<GradCAMViewerProps> = ({
  explanation,
  className = '',
}) => {
  return (
    <GlassCard
      title="What influenced this prediction?"
      subtitle="Influential regions identified by the model"
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2">
        {/* CNN Features */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs uppercase tracking-wider font-mono text-slate-300">
              CNN Local Features
            </span>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            {explanation?.local_cnn_features ||
              'High-frequency convolutional cues resolving localized attenuation gradients, lesion edges, and density transitions.'}
          </p>
        </div>

        {/* Transformer Context */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs uppercase tracking-wider font-mono text-slate-300">
              Transformer Context
            </span>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            {explanation?.global_transformer_features ||
              'Shifted-window self-attention evaluating long-range cranial symmetry, bilateral ventricles, and parenchymal organization.'}
          </p>
        </div>

        {/* Attention Map */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs uppercase tracking-wider font-mono text-slate-300">
              Attention Regions
            </span>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            {explanation?.attention_mechanism ||
              'Channel and spatial attention weighting highlighting salient morphological cues prior to final classification pooling.'}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/15 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-cyan-200/80 font-light leading-relaxed">
          Grad-CAM visual activation heatmaps highlight anatomical and attenuation patterns that
          statistically influenced the neural decision. Saliency maps are decision-support aids and
          do not constitute histological margins.
        </p>
      </div>
    </GlassCard>
  );
};
