import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-medium">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span>Research-use only. Not a medical diagnosis. Review with qualified physicians.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-4 mb-6 shadow-xs flex items-start gap-3.5">
      <div className="p-2 bg-amber-100 rounded-md text-amber-700 shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="text-sm">
        <h4 className="font-semibold text-amber-900 tracking-tight flex items-center gap-1.5">
          Medical Research & Educational Decision Support Disclaimer
        </h4>
        <p className="text-amber-800 mt-1 leading-relaxed">
          This software is engineered exclusively for academic research, algorithmic explainability, and comparative benchmarking. 
          <span className="font-semibold"> Model outputs are NOT a clinical diagnosis</span> and must never substitute for professional radiographic review, biopsy, or pathology examination by qualified healthcare personnel.
        </p>
      </div>
    </div>
  );
};
