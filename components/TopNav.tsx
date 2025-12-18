
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
    { id: 'framing', label: 'Bulk Framing', icon: 'fa-expand-arrows-alt' },
    { id: 'resizer', label: 'Bulk Resizer', icon: 'fa-compress-arrows-alt' },
    { id: 'trim', label: 'Trim Crop', icon: 'fa-crop-alt' },
    { id: 'max-resize', label: 'Max-Bound Resize', icon: 'fa-vector-square' },
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
    <nav className="h-10 border-b flex items-center justify-between px-4 z-50 shadow-sm relative" 
         style={{ backgroundColor: 'var(--bg-side)', borderColor: 'var(--border)' }}>
      
      <div className="flex items-center gap-3">
        {/* LOGO COM SUPORTE CHANFRADO (CHAMFERED) */}
        <div className="logo-support h-7">
           <div className="flex items-center gap-2">
             <i className="fas fa-paw text-[9px] text-white/90"></i>
             <span className="miau-text text-lg tracking-tighter select-none leading-none pt-0.5">Miau</span>
           </div>
        </div>
        
        <span className="font-black text-[11px] tracking-[0.2em] uppercase opacity-80" style={{ color: 'var(--accent)' }}>Tools</span>
      </div>

      <div className="flex items-center gap-1 p-0.5 rounded-lg border"
           style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderColor: 'var(--border)' }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id as ToolType)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold transition-all duration-200 whitespace-nowrap uppercase tracking-tight relative group`}
            style={{
              backgroundColor: activeTool === tool.id ? 'var(--accent)' : 'transparent',
              color: activeTool === tool.id ? 'var(--text-inv)' : 'var(--text-muted)'
            }}
          >
            {activeTool !== tool.id && (
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-md transition-opacity"></div>
            )}
            
            <i className={`fas ${tool.icon} text-[9px] z-10 ${activeTool === tool.id ? 'opacity-100' : 'opacity-40'}`}></i>
            <span className="z-10">{tool.label}</span>
          </button>
        ))}
        
        <div className="w-[1px] h-4 mx-1" style={{ backgroundColor: 'var(--border)' }}></div>
        
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 transition-all hover:bg-black/5 rounded-md"
            style={{ color: showSettings ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <i className="fas fa-cog text-[11px]"></i>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border shadow-2xl p-1.5 z-[100] animate-in fade-in zoom-in duration-200 overflow-hidden"
                 style={{ backgroundColor: 'var(--bg-side)', borderColor: 'var(--border)' }}>
              
              <div className="px-3 py-2 mb-1 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest block opacity-50" style={{ color: 'var(--text-main)' }}>
                  Visual do Studio
                </span>
              </div>
              
              <div className="space-y-0.5 py-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onThemeChange(t.id as ThemeType); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold theme-item-transition relative group overflow-hidden"
                    style={{ 
                      color: currentTheme === t.id ? 'var(--accent)' : 'var(--text-main)',
                      backgroundColor: currentTheme === t.id ? 'var(--ui-selected)' : 'transparent'
                    }}
                  >
                    {currentTheme !== t.id && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                           style={{ backgroundColor: 'var(--ui-hover)' }}></div>
                    )}
                    <div className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner z-10 flex items-center justify-center overflow-hidden" 
                         style={{ backgroundColor: t.color }}>
                      {currentTheme === t.id && <i className="fas fa-check text-[6px] text-white"></i>}
                    </div>
                    <span className="flex-1 text-left z-10">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-1 mt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                <button 
                  onClick={() => { onShowAbout(); setShowSettings(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 transition-all"
                >
                  <i className="fas fa-info-circle text-[10px]"></i>
                  <span>Sobre o MiauTools</span>
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
