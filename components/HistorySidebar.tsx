
import React from 'react';
import { HistoryState } from '../types';

interface HistorySidebarProps {
  history: HistoryState[];
  currentIndex: number;
  onRestore: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, currentIndex, onRestore, isOpen, onToggle }) => {
  return (
    <div className="relative flex h-full">
      {/* BOTÃO DE TOGGLE INTEGRADO - Fica na borda da div pai que cresce/encolhe */}
      <button 
        onClick={onToggle}
        className={`absolute top-1/2 -translate-y-1/2 -left-6 z-50 w-6 h-20 bg-theme-panel border border-theme flex items-center justify-center rounded-l-xl hover:bg-theme-accent transition-all group shadow-[-5px_0_15px_rgba(0,0,0,0.1)]`}
      >
        <i className={`fas ${isOpen ? 'fa-chevron-right' : 'fa-history'} text-[10px] transition-transform duration-500 ${isOpen ? 'rotate-0' : 'rotate-12 group-hover:rotate-0'} group-hover:scale-125`}></i>
      </button>

      <aside 
        className={`border-l border-theme bg-theme-side transition-all duration-500 overflow-hidden flex flex-col relative ${isOpen ? 'w-64' : 'w-0'}`}
      >
        <div className="min-w-[256px] h-full flex flex-col">
          <div className="p-4 border-b border-theme/30 bg-black/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-accent">Camadas / Histórico</span>
            <i className="fas fa-layer-group opacity-30 text-xs"></i>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-20 p-4">
                <i className="fas fa-history text-2xl mb-2"></i>
                <p className="text-[9px] font-black uppercase">Sem histórico</p>
              </div>
            ) : (
              history.map((state, idx) => (
                <button 
                  key={state.id}
                  onClick={() => onRestore(idx)}
                  className={`w-full group relative flex flex-col gap-2 p-2 rounded-2xl border transition-all text-left overflow-hidden ${currentIndex === idx ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent/20' : 'border-transparent bg-theme-panel/20 hover:border-theme'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black/20 border border-theme overflow-hidden flex-shrink-0">
                      <img src={state.url} className="w-full h-full object-cover" alt="history-step" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[9px] font-black uppercase truncate ${currentIndex === idx ? 'text-theme-accent' : 'opacity-60'}`}>
                        {state.label}
                      </p>
                      <p className="text-[7px] opacity-30 uppercase font-mono">
                        {new Date(state.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {currentIndex === idx && (
                    <div className="absolute right-2 top-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-theme-accent shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                    </div>
                  )}
                </button>
              )).reverse()
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HistorySidebar;
