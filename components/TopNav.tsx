
import React, { useState, useRef, useEffect } from 'react';
import { ToolType, ThemeType } from '../App';

interface TopNavProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  onShowAbout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ activeTool, onToolChange, currentTheme, onThemeChange, onShowAbout }) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: 'grid', label: 'Grid Maker', icon: 'fa-th-large' },
    { id: 'framing', label: 'Bulk Framing', icon: 'fa-crop-alt' },
    { id: 'resizer', label: 'Master Resizer', icon: 'fa-expand-arrows-alt' },
  ];

  const themes = [
    { id: 'dark', label: 'Dark Edition', color: '#020617', icon: 'fa-moon' },
    { id: 'light', label: 'Clean Light', color: '#f8fafc', icon: 'fa-sun' },
    { id: 'pastel', label: 'Sweet Pastel', color: '#fff1f2', icon: 'fa-heart' },
    { id: 'midnight', label: 'Midnight Purple', color: '#0c0a09', icon: 'fa-vial' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-12 border-b flex items-center justify-between px-6 z-50 shadow-sm relative backdrop-blur-md" 
         style={{ backgroundColor: 'var(--bg-side)', borderColor: 'var(--border)' }}>
      
      {/* LADO ESQUERDO: LOGO */}
      <div className="flex-1 flex items-center gap-3">
        <div className="logo-support h-8">
           <div className="flex items-center gap-2">
             <i className="fas fa-paw text-[10px] text-white/90"></i>
             <span className="miau-text text-xl tracking-tighter select-none leading-none pt-0.5">Miau</span>
           </div>
        </div>
        <span className="font-black text-[10px] tracking-[0.3em] uppercase opacity-40 pt-1" style={{ color: 'var(--text-main)' }}>Tools</span>
      </div>

      {/* CENTRO: ILHA FLUTUANTE DE FERRAMENTAS */}
      <div className="flex-none">
        <div className="flex items-center gap-1 p-1 rounded-full border shadow-inner backdrop-blur-2xl bg-black/10 transition-all duration-500"
             style={{ borderColor: 'var(--border)' }}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id as ToolType)}
              className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[10px] font-black transition-all duration-300 whitespace-nowrap uppercase tracking-wider relative group overflow-hidden`}
              style={{
                backgroundColor: activeTool === tool.id ? 'var(--accent)' : 'transparent',
                color: activeTool === tool.id ? 'var(--text-inv)' : 'var(--text-muted)',
                boxShadow: activeTool === tool.id ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              {activeTool !== tool.id && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              
              <i className={`fas ${tool.icon} text-[9px] z-10 transition-transform duration-300 ${activeTool === tool.id ? 'scale-110' : 'opacity-40 group-hover:opacity-100'}`}></i>
              <span className="z-10">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: CONFIGS */}
      <div className="flex-1 flex justify-end">
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 flex items-center justify-center transition-all hover:bg-black/10 rounded-full border border-transparent hover:border-theme active:scale-90"
            style={{ color: showSettings ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <i className={`fas ${showSettings ? 'fa-times' : 'fa-cog'} text-sm`}></i>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border shadow-2xl p-2 z-[100] animate-in fade-in zoom-in slide-in-from-top-2 duration-200 overflow-hidden backdrop-blur-2xl"
                 style={{ backgroundColor: 'var(--bg-side)', borderColor: 'var(--border)' }}>
              
              <div className="px-4 py-2.5 mb-1 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest block opacity-40" style={{ color: 'var(--text-main)' }}>
                  Visual do Studio
                </span>
              </div>
              
              <div className="space-y-1 py-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onThemeChange(t.id as ThemeType); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all relative group overflow-hidden"
                    style={{ 
                      color: currentTheme === t.id ? 'var(--accent)' : 'var(--text-main)',
                      backgroundColor: currentTheme === t.id ? 'var(--ui-selected)' : 'transparent'
                    }}
                  >
                    {currentTheme !== t.id && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                           style={{ backgroundColor: 'var(--ui-hover)' }}></div>
                    )}
                    <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner z-10 flex items-center justify-center overflow-hidden" 
                         style={{ backgroundColor: t.color }}>
                      {currentTheme === t.id && <i className="fas fa-check text-[7px] text-white"></i>}
                    </div>
                    <span className="flex-1 text-left z-10">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button 
                  onClick={() => { onShowAbout(); setShowSettings(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 transition-all"
                >
                  <i className="fas fa-info-circle text-[11px]"></i>
                  <span>Sobre</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
