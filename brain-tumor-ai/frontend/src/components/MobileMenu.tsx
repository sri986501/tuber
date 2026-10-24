import React from 'react';
import { PageTab } from '../types';
import { LiquidGlass } from './LiquidGlass';
import { X, Scan, Cpu, BarChart2, Layers, Database, CircleUserRound, Sparkles } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const items: { id: PageTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'analyzer', label: 'Analyze Scan', icon: <Scan className="w-5 h-5" /> },
    { id: 'performance', label: 'Performance (87.7%)', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'dataset', label: 'Data & Cohort', icon: <Database className="w-5 h-5" /> },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ease-out md:hidden ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Slide-down / Expand drawer */}
      <div
        className={`absolute inset-x-4 top-4 bottom-6 liquid-glass-dark rounded-3xl p-6 flex flex-col justify-between transition-transform duration-500 ease-out border border-white/10 ${
          isOpen ? 'translate-y-0 scale-100' : '-translate-y-8 scale-95'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg liquid-glass flex items-center justify-center text-cyan-300">
                <Scan className="w-4 h-4" />
              </div>
              <span className="text-base font-normal tracking-tight text-white">
                NeuroScan AI
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 liquid-glass rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="py-6 space-y-2">
            {items.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-300' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Account & Disclaimer */}
        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 px-3 py-2 liquid-glass rounded-2xl">
            <CircleUserRound className="w-8 h-8 text-cyan-300" />
            <div className="text-left">
              <span className="text-xs font-medium text-white block">Clinical Researcher</span>
              <span className="text-[10px] text-slate-400 font-mono">Academic License</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-light leading-snug text-center">
            For research and educational decision support. Not a medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
