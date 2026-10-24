import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  LineChart,
  Table2,
  Info,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { PageTab } from '../types';

interface Props {
  currentTab: PageTab;
  onTabChange: (tab: PageTab) => void;
}

export const Sidebar: React.FC<Props> = ({ currentTab, onTabChange }) => {
  const navItems: { id: PageTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'New Analysis', icon: BrainCircuit },
    { id: 'performance', label: 'Model Performance', icon: LineChart },
    { id: 'experiments', label: 'Experiments', icon: Table2 },
    { id: 'about', label: 'About Model', icon: Info },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between py-6 px-4">
      <div>
        <div className="px-3 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Clinical Workflow
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-teal-700' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Trust & Ethics Badge in Sidebar */}
      <div className="border-t border-slate-100 pt-5 px-2">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Ethical AI Standard</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Strict patient partition isolation. Post-hoc calibration with rejection safeguards.
          </p>
        </div>
      </div>
    </aside>
  );
};
