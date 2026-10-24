import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { LiquidGlass } from './LiquidGlass';
import { Layers, Cpu, Eye, Sparkles, Network, Activity, ArrowRight, ArrowDown, X } from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  shape: string;
  description: string;
  technicalDetails: string[];
}

const STAGES: StageInfo[] = [
  {
    id: 'input',
    name: 'CT Image Preprocessing',
    category: 'Input Stage',
    icon: Layers,
    shape: '3 × 224 × 224',
    description:
      'Brain CT scans undergo intensity normalization, bilateral quantum noise suppression, and CLAHE soft-tissue contrast enhancement.',
    technicalDetails: [
      'Rescaled to 224 × 224 standard receptive input',
      'Hounsfield windowing accentuates gray-white matter differentiation',
      'ImageNet mean/std normalization for transfer learning',
    ],
  },
  {
    id: 'convnext',
    name: 'ConvNeXt-Tiny CNN',
    category: 'Local Feature Encoder',
    icon: Cpu,
    shape: '768 × 7 × 7',
    description:
      'Modern 7×7 depthwise convolutional stages capturing high-frequency local textures, lesion boundaries, and micro-calcifications.',
    technicalDetails: [
      'Inverted bottleneck design with LayerNorm and GELU activations',
      'Local inductive bias excels at high-contrast bleed boundaries',
      '28.6M parameters providing inductive spatial priors',
    ],
  },
  {
    id: 'cbam',
    name: 'CBAM Attention Module',
    category: 'Feature Modulation',
    icon: Eye,
    shape: '768 × 7 × 7',
    description:
      'Channel and spatial attention used to emphasize informative feature regions and suppress extracranial background noise.',
    technicalDetails: [
      'Channel Attention computes max-pool & avg-pool shared MLP responses',
      'Spatial Attention focuses on parenchymal abnormalities',
      'Multi-scale receptive focus preserves subtle hypodense ischemic areas',
    ],
  },
  {
    id: 'swin',
    name: 'Swin Transformer-Tiny',
    category: 'Global Context Encoder',
    icon: Network,
    shape: '49 Tokens × 768',
    description:
      'Shifted-window hierarchical self-attention evaluating long-range cranial context, midline shift, and ventricular asymmetry.',
    technicalDetails: [
      'Local window multi-head self-attention with cyclical shifted windows',
      'Cross-hemispheric relational modeling without quadratic complexity',
      'Linear computational complexity relative to token sequence length',
    ],
  },
  {
    id: 'fusion',
    name: 'Bidirectional Cross-Attention',
    category: 'Multi-Modal Fusion',
    icon: Sparkles,
    shape: '49 Tokens × 768',
    description:
      'Learned cross-attention tokens blending CNN spatial acuity with Vision Transformer relational semantic depth.',
    technicalDetails: [
      'Queries from Swin tokens attend to CNN spatial memory keys/values',
      'Residual gated blending mechanism prevents catastrophic feature drift',
      'Learnable attention pooling compresses token sequence into global embedding',
    ],
  },
  {
    id: 'head',
    name: 'Classification & Calibration Head',
    category: 'Inference & Reliability',
    icon: Activity,
    shape: '3 Classes (or num_classes)',
    description:
      'LayerNorm + Dropout linear projection followed by post-hoc temperature scaling (T) to calibrate clinical confidence.',
    technicalDetails: [
      'CrossEntropy / Class-balanced focal loss optimization',
      'Learned temperature parameter T minimizes Expected Calibration Error (ECE)',
      'Clinical uncertainty rejection thresholding triggers specialist referral flags',
    ],
  },
];

export const ModelArchitecture: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedStage, setSelectedStage] = useState<StageInfo | null>(STAGES[2]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Interactive Pipeline Track */}
      <GlassCard
        title="Attention-Enhanced Architecture Pipeline"
        subtitle="Click any stage to inspect its neural representation & mathematical formulation"
      >
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 overflow-x-auto py-2">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage?.id === stage.id;

            return (
              <React.Fragment key={stage.id}>
                <LiquidGlass
                  variant="interactive"
                  rounded="2xl"
                  onClick={() => setSelectedStage(stage)}
                  className={`flex-1 min-w-[160px] p-4 flex flex-col justify-between transition-all duration-300 ${
                    isSelected
                      ? 'bg-cyan-500/10 shadow-[0_0_20px_rgba(56,189,248,0.25)] border-cyan-400/30'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">
                        {stage.category}
                      </span>
                      <h4
                        className={`text-sm font-medium mt-0.5 truncate ${
                          isSelected ? 'text-cyan-200' : 'text-white'
                        }`}
                      >
                        {stage.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Output:</span>
                    <span className="text-xs font-mono text-slate-300 truncate block">
                      {stage.shape}
                    </span>
                  </div>
                </LiquidGlass>

                {/* Arrow connector */}
                {idx < STAGES.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center text-slate-600 px-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
                {idx < STAGES.length - 1 && (
                  <div className="flex lg:hidden items-center justify-center text-slate-600 py-1">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Stage Detail Drawer */}
      {selectedStage && (
        <LiquidGlass variant="dark" rounded="2xl" className="p-6 md:p-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-300 flex items-center justify-center">
                <selectedStage.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400/80">
                  {selectedStage.category}
                </span>
                <h3 className="text-xl font-normal text-white">{selectedStage.name}</h3>
              </div>
            </div>

            <button
              onClick={() => setSelectedStage(null)}
              className="p-1.5 liquid-glass rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-slate-300 font-light leading-relaxed max-w-3xl">
            {selectedStage.description}
          </p>

          <div className="pt-3 border-t border-white/[0.06]">
            <h5 className="text-xs font-mono uppercase text-slate-400 mb-2">Technical Mechanics</h5>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedStage.technicalDetails.map((detail, i) => (
                <li
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 font-light"
                >
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </LiquidGlass>
      )}
    </div>
  );
};
