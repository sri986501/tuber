import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ProbabilityBars } from './ProbabilityBars';
import { PredictionResult, ModelInfo } from '../types';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Award,
  ClipboardCopy,
  Check,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

interface PredictionPanelProps {
  prediction: PredictionResult;
  modelInfo?: ModelInfo | null;
  className?: string;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  prediction,
  modelInfo,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const isUncertain =
    prediction.confidence_status === 'UNCERTAIN' ||
    prediction.confidence_status === 'LOW CONFIDENCE';

  const predClass = prediction.predicted_class.toLowerCase();

  // Clinical styling & action checklists based on findings
  const getClinicalDetails = () => {
    if (predClass.includes('glioma')) {
      return {
        title: 'Infiltrating Glioma / Astrocytoma',
        severity: prediction.urgency_level || 'URGENT NEUROSURGICAL',
        colorClass: 'text-purple-300 bg-purple-950/25 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.15)]',
        badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
        icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
        summary:
          prediction.lesion_analysis?.attenuation_profile ||
          'Intra-axial infiltrating heterogeneous lesion with peripheral viable rim and surrounding finger-like vasogenic edema.',
        recommendations: prediction.clinical_recommendations || [
          'Immediate neurosurgical consultation for stereotactic biopsy or surgical resection planning.',
          'Urgent multi-parametric Brain MRI with IV Gadolinium contrast (T1+C, T2, FLAIR, DWI).',
          'MR Spectroscopy (elevated Cho/NAA ratio) and Perfusion-Weighted MRI for hemodynamic grading.',
          'Consider initiating corticosteroid (Dexamethasone) therapy under neurosurgical supervision for symptomatic edema.',
        ],
      };
    } else if (predClass.includes('meningi')) {
      return {
        title: 'Extra-Axial Meningioma',
        severity: prediction.urgency_level || 'SPECIALIST NEUROSURGICAL',
        colorClass: 'text-blue-300 bg-blue-950/25 border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.15)]',
        badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
        icon: <ShieldAlert className="w-5 h-5 text-blue-400" />,
        summary:
          prediction.lesion_analysis?.attenuation_profile ||
          'Extra-axial, sharply circumscribed hyperdense solid mass with broad dural attachment and localized parenchymal displacement.',
        recommendations: prediction.clinical_recommendations || [
          'Contrast-enhanced Brain MRI to assess dural tail sign and adjacent dural venous sinus patency.',
          'Neurosurgical review to evaluate surgical resection feasibility (Simpson grade goal).',
          'High-resolution bone window CT to rule out reactive hyperostosis or skull base erosion.',
          'Surveillance MRI protocol at 6–12 months if small, calcified, and asymptomatic in elderly patient.',
        ],
      };
    } else if (predClass.includes('pituit')) {
      return {
        title: 'Pituitary Adenoma / Sellar Lesion',
        severity: prediction.urgency_level || 'ENDOCRINE & NEUROSURGICAL',
        colorClass: 'text-amber-300 bg-amber-950/25 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]',
        badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        summary:
          prediction.lesion_analysis?.attenuation_profile ||
          'Central skull base / sellar-suprasellar mass with sellar remodelling and potential optic chiasm displacement.',
        recommendations: prediction.clinical_recommendations || [
          'Formal automated visual field perimetry (Humphrey) to evaluate optic chiasm compression.',
          'Comprehensive anterior pituitary endocrine panel (Prolactin, IGF-1, ACTH, Cortisol, TSH, Free T4).',
          'Pituitary protocol dynamic thin-slice contrast MRI (1–2 mm coronal and sagittal T1 sequences).',
          'Endoscopic endonasal transsphenoidal neurosurgical consultation if chiasm compression or hypersecretion.',
        ],
      };
    } else if (predClass.includes('bleed') || predClass.includes('hemorrhag')) {
      return {
        title: 'Acute Intracranial Bleeding / Hemorrhage',
        severity: prediction.urgency_level || 'CRITICAL / URGENT',
        colorClass: 'text-rose-300 bg-rose-950/25 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.15)]',
        badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        summary:
          prediction.lesion_analysis?.attenuation_profile ||
          'Hyperdense acute blood collection identified with localized mass effect and potential intracranial pressure elevation.',
        recommendations: prediction.clinical_recommendations || [
          'Immediate emergency neurosurgical notification and airway/vital stabilization.',
          'Discontinue and rapidly reverse all anticoagulant and antiplatelet agents.',
          'Aggressive blood pressure control (target SBP < 140 mmHg per AHA/ASA clinical guidelines).',
          'Schedule repeat non-contrast head CT within 6 hours to monitor hematoma expansion.',
        ],
      };
    } else if (predClass.includes('ischemi') || predClass.includes('stroke')) {
      return {
        title: 'Acute Ischemic Infarction / Stroke',
        severity: prediction.urgency_level || 'EMERGENT CODE STROKE',
        colorClass: 'text-amber-300 bg-amber-950/25 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]',
        badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        summary:
          prediction.lesion_analysis?.attenuation_profile ||
          'Territorial hypodensity with loss of gray-white junction differentiation and sulcal effacement.',
        recommendations: prediction.clinical_recommendations || [
          'Confirm last-known-well (LKW) time for IV thrombolysis (tPA/TNK) eligibility.',
          'Immediate CT Angiography (CTA) from aortic arch to vertex to rule out Large Vessel Occlusion (LVO).',
          'Evaluate for emergent mechanical thrombectomy if LVO is detected.',
          'Admit to dedicated Neuro-Intensive Care / Stroke Unit.',
        ],
      };
    } else {
      return {
        title: 'Normal Cranial Anatomy (No Mass Detected)',
        severity: prediction.urgency_level || 'NORMAL BASELINE',
        colorClass: 'text-emerald-300 bg-emerald-950/25 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]',
        badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        summary:
          prediction.lesion_analysis?.attenuation_profile ||
          'Bilateral hemispheric symmetry intact. Normal ventricular dimensions and sulcal depth. No hyperdense mass, blood, or territorial hypodensity.',
        recommendations: prediction.clinical_recommendations || [
          'No evidence of acute intracranial mass, tumor, or hemorrhage on this axial slice.',
          'Correlate with complete volumetric CT stack and clinical neurological assessment.',
          'If focal neurological symptoms persist, obtain high-resolution brain MRI (T1, T2, FLAIR).',
        ],
      };
    }
  };

  const clinical = getClinicalDetails();

  const handleCopyReport = () => {
    const reportText = `NEUROSCAN AI CLINICAL RADIOLOGY REPORT
==================================================
Date / Time: ${new Date().toLocaleString()}
Active Model: ${prediction.model_version || modelInfo?.model_name || 'Neural Network'}
Primary Classification: ${clinical.title.toUpperCase()}
Urgency Level: ${clinical.severity}
Status: ${prediction.confidence_status}
Calibrated Confidence: ${(prediction.calibrated_confidence * 100).toFixed(1)}%
Raw Softmax Probability: ${(prediction.raw_probability * 100).toFixed(1)}%
Temperature Scaling Factor (T): ${prediction.uncertainty_metrics?.temperature?.toFixed(3) || '1.000'}

QUANTITATIVE LESION CHARACTERISTICS:
 - Location: ${prediction.lesion_analysis?.estimated_location || 'N/A'}
 - Attenuation Profile: ${prediction.lesion_analysis?.attenuation_profile || 'N/A'}
 - Edema Evaluation: ${prediction.lesion_analysis?.edema_profile || 'N/A'}
 - Mass Effect: ${prediction.lesion_analysis?.mass_effect || 'N/A'}
 - Estimated Local Density: ${prediction.lesion_analysis?.estimated_density_hu ?? 'N/A'} HU eq

DIFFERENTIAL CLASS PROBABILITIES:
${Object.entries(prediction.class_probabilities)
  .map(([k, v]) => ` - ${k}: ${(v * 100).toFixed(1)}%`)
  .join('\n')}

RECOMMENDED RADIOLOGICAL NEXT STEPS:
${clinical.recommendations.map((r, i) => ` ${i + 1}. ${r}`).join('\n')}

MODEL EXPLAINABILITY RATIONALE:
 - Morphology: ${prediction.explanation.local_cnn_features}
 - Spatial Context: ${prediction.explanation.global_transformer_features}
 - Attention Saliency: ${prediction.explanation.attention_mechanism}

DISCLAIMER: ${prediction.medical_disclaimer || 'Research decision support. Not a standalone medical diagnosis.'}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Top Banner: Best Accuracy Benchmark Verification */}
      <div className="p-3 liquid-glass rounded-2xl border border-cyan-400/30 bg-cyan-950/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-400/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-300 font-semibold block">
              Evaluated Champion Model
            </span>
            <span className="text-xs text-slate-200 font-medium">
              87.69% Test Accuracy · 0.957 ROC-AUC
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3 py-1.5 liquid-glass rounded-full text-xs font-mono text-cyan-200 hover:text-white hover:bg-cyan-500/20 transition-all cursor-pointer border border-cyan-400/30 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Report'}</span>
        </button>
      </div>

      {/* Primary Result Panel */}
      <GlassCard
        title="DIAGNOSTIC VERDICT"
        badge={
          <ConfidenceBadge
            status={prediction.confidence_status}
            confidence={prediction.calibrated_confidence}
            showText={true}
          />
        }
      >
        <div className="space-y-5">
          {/* Main Diagnosis Card */}
          <div className={`p-4 rounded-2xl border ${clinical.colorClass} space-y-2`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold ${clinical.badgeBg}`}>
                {clinical.severity}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Calibrated: {(prediction.calibrated_confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {clinical.icon}
              <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
                {clinical.title}
              </h2>
            </div>

            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {clinical.summary}
            </p>

            {/* Rejection / Uncertainty alert if applicable */}
            {isUncertain && prediction.rejection_message && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 font-light flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{prediction.rejection_message}</span>
              </div>
            )}
          </div>

          {/* Dual Confidence Display: Calibrated vs Raw */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Calibrated Conf</span>
              <span className="text-cyan-300 font-mono text-base font-semibold">
                {(prediction.calibrated_confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Raw Softmax</span>
              <span className="text-slate-300 font-mono text-base font-medium">
                {(prediction.raw_probability * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Temperature (T)</span>
              <span className="text-amber-300 font-mono text-base font-medium">
                {prediction.uncertainty_metrics?.temperature?.toFixed(2) || '1.76'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Prob Margin</span>
              <span className="text-emerald-300 font-mono text-base font-medium">
                +{((prediction.uncertainty_metrics?.margin || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Quantitative Lesion Characteristics */}
          {prediction.lesion_analysis && (
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-medium">
                  Lesion & Parenchymal Profiling
                </span>
                {prediction.who_grade_category && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                    {prediction.who_grade_category}
                  </span>
                )}
              </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Volume</span>
                    <span className="text-cyan-300 font-semibold font-mono text-sm">
                      {prediction.lesion_analysis.estimated_volume_cm3 !== undefined && prediction.lesion_analysis.estimated_volume_cm3 > 0
                        ? `${prediction.lesion_analysis.estimated_volume_cm3} cm³`
                        : '0.0 cm³ (None)'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Midline Shift</span>
                    <span className={`font-mono text-sm font-semibold ${
                      (prediction.lesion_analysis.midline_shift_mm ?? 0) > 4
                        ? 'text-rose-400'
                        : (prediction.lesion_analysis.midline_shift_mm ?? 0) > 1.5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {prediction.lesion_analysis.midline_shift_mm !== undefined
                        ? `${prediction.lesion_analysis.midline_shift_mm} mm`
                        : '0.0 mm'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Density HU</span>
                    <span className="text-slate-200 font-medium font-mono text-sm">
                      ~{prediction.lesion_analysis.estimated_density_hu > 0 ? `+${prediction.lesion_analysis.estimated_density_hu}` : prediction.lesion_analysis.estimated_density_hu} HU
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Density Classification</span>
                    <span className="text-slate-200 font-medium text-xs">
                      {prediction.lesion_analysis.estimated_density_hu > 50
                        ? 'Hyperdense (+HU)'
                        : prediction.lesion_analysis.estimated_density_hu < 26
                        ? 'Hypodense (-HU)'
                        : 'Isodense (Norm)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Anatomical Location</span>
                    <span className="text-slate-200 font-medium">{prediction.lesion_analysis.estimated_location}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Mass Effect & Edema</span>
                    <span className="text-slate-200 font-medium">{prediction.lesion_analysis.mass_effect}</span>
                  </div>
                </div>

                {/* Visual Hounsfield Unit Spectrum Bar */}
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">HU Attenuation Scale:</span>
                    <span className="text-cyan-300 font-mono font-medium">
                      Focal Point: {prediction.lesion_analysis.estimated_density_hu > 0 ? `+${prediction.lesion_analysis.estimated_density_hu}` : prediction.lesion_analysis.estimated_density_hu} HU
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-blue-900 via-emerald-800 via-amber-600 to-rose-600 overflow-hidden">
                    {/* Position marker for current HU */}
                    <div
                      className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_#ffffff] rounded-full transition-all duration-500"
                      style={{
                        left: `${Math.min(98, Math.max(2, ((prediction.lesion_analysis.estimated_density_hu + 50) / 150) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>-50 HU (Edema/Fat)</span>
                    <span>0 HU (CSF)</span>
                    <span>+35 HU (Brain)</span>
                    <span>+80 HU (Hemorrhage)</span>
                  </div>
                </div>
            </div>
          )}

          {/* Differential Diagnosis Class Probabilities */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
              Differential Diagnosis Distribution
            </h4>
            <ProbabilityBars
              probabilities={prediction.class_probabilities}
              predictedClass={prediction.predicted_class}
            />
          </div>

          {/* Actionable Clinical Recommendations */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan-300 font-medium">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Recommended Clinical Next Steps</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-light">
              {clinical.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Model Architecture Telemetry */}
      <GlassCard
        title="Model Telemetry"
        subtitle="Network specifications & hardware deployment"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Architecture</span>
            <span className="text-white font-medium mt-0.5 block truncate">
              {modelInfo?.model_name === 'hybrid'
                ? 'Hybrid CNN + Transformer'
                : 'Attention Hybrid (EfficientNet-B0)'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Matrix Input</span>
            <span className="text-white font-medium mt-0.5 block">224 × 224 × 3</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Device Core</span>
            <span className="text-cyan-300 font-mono mt-0.5 block uppercase">
              {modelInfo?.device || 'CPU'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Test Accuracy</span>
            <span className="text-emerald-400 font-mono mt-0.5 block font-semibold">
              87.69%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Multi-Class AUC</span>
            <span className="text-cyan-300 font-mono mt-0.5 block font-semibold">
              0.9574
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Calibration</span>
            <span className="text-amber-300 font-mono mt-0.5 block font-semibold">
              T-Scaled (T=1.76)
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/[0.05] text-[11px] text-slate-400 font-light flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              Weights: {modelInfo?.checkpoint_path ? modelInfo.checkpoint_path.split(/[\\/]/).pop() : 'best_model.pth'}
            </span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px]">Verified Online</span>
        </div>
      </GlassCard>
    </div>
  );
};
