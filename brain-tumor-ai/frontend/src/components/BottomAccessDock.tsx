import React from 'react';
import { PageTab } from '../types';
import { LiquidGlass } from './LiquidGlass';
import { Sparkles, Scan, Cpu, BarChart2, Database, Layers } from 'lucide-react';

interface BottomAccessDockProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export const BottomAccessDock: React.FC<BottomAccessDockProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const dockItems: { id: PageTab; label: string; icon: React.ReactNode; isPrimary?: boolean }[] = [
    { id: 'dashboard', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'analyzer',
      label: 'Analyze',
      icon: <Scan className="w-4 h-4" />,
      isPrimary: true,
    },
    { id: 'models', label: 'Models', icon: <Cpu className="w-4 h-4" /> },
    { id: 'performance', label: 'Results', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'experiments', label: 'Runs', icon: <Layers className="w-4 h-4" /> },
    { id: 'dataset', label: 'Data', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <aside aria-label="Quick Access Dock" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] sm:w-auto pointer-events-none">
      <LiquidGlass
        variant="dark"
        rounded="full"
        className="pointer-events-auto p-1.5 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)] border border-white/15 backdrop-blur-2xl bg-black/75"
      >
        {dockItems.map((item) => {
          const isActive = currentTab === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="btn-primary text-xs py-2 px-4 gap-1.5"
              >
                {item.icon}
                <span className="hidden sm:inline">Analyze CT</span>
                <span className="sm:hidden">Analyze</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`btn-nav-pill ${isActive ? 'active' : ''} gap-1.5`}
            >
              <span className={isActive ? 'text-cyan-300' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </LiquidGlass>
    </aside>
  );
};
