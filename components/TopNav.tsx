
import React, { useState, useRef, useEffect } from 'react';
import { ToolType, ThemeType, PreviewQuality } from '../types';

interface TopNavProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  previewQuality: PreviewQuality;
  onQualityChange: (q: PreviewQuality) => void;
  onShowAbout: () => void;
  cacheDirHandle?: any;
  onCacheDirChange: (handle: any) => void;
  isSettingsOpen: boolean;
  onSettingsToggle: (open: boolean) => void;
}

const TopNav: React.FC<TopNavProps> = ({ 
  activeTool, onToolChange, currentTheme, onThemeChange, previewQuality, onQualityChange, onShowAbout, cacheDirHandle, onCacheDirChange, isSettingsOpen, onSettingsToggle 
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: 'grid', label: 'Grid Maker', icon: 'fa-th-large' },
    { id: 'framing', label: 'Bulk Framing', icon: 'fa-crop-alt' },
    { id: 'alpha-edge', label: 'Borde Maker', icon: 'fa-wand-magic-sparkles' },
    { id: 'ai-lab', label: 'AI Lab', icon: 'fa-brain' },
  ];

  const themes = [
    { id: 'dark', label: 'Dark Edition', color: '#020617', icon: 'fa-moon' },
    { id: 'light', label: 'Clean Light', color: '#f8fafc', icon: 'fa-sun' },
    { id: 'pastel', label: 'Sweet Pastel', color: '#fff1f2', icon: 'fa-heart' },
    { id: 'midnight', label: 'Midnight Purple', color: '#0c0a09', icon: 'fa-vial' },
  ];

  const qualities: { id: PreviewQuality, label: string }[] = [
    { id: 'fast', label: 'Turbo' },
    { id: 'moderate', label: 'Leve' },
    { id: 'medium', label: 'Médio' },
    { id: 'high', label: 'Alto' },
    { id: 'ultra', label: 'Ultra' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        onSettingsToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [onSettingsToggle]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSelectCacheFolder = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      onCacheDirChange(handle);
    } catch (err) {
      console.warn('Seleção de pasta cancelada ou não suportada.');
    }
  };

  return (
    <nav className="h-12 border-b flex items-center justify-between px-6 z-50 shadow-sm relative backdrop-blur-md" 
         style={{ backgroundColor: 'var(--bg-side)', borderColor: 'var(--border)' }}>
      
      <div className="flex-1 flex items-center gap-3">
        <div className="logo-support h-8">
           <div className="flex items-center gap-2">
             <i className="fas fa-paw text-[10px] text-white/90"></i>
             <span className="miau-text text-xl tracking-tighter select-none leading-none pt-0.5">Miau</span>
           </div>
        </div>
        <span className="font-black text-[10px] tracking-[0.3em] uppercase opacity-40 pt-1" style={{ color: 'var(--text-main)' }}>Tools</span>
      </div>

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

      <div className="flex-1 flex justify-end items-center gap-2">
        <button 
          onClick={toggleFullScreen}
          className="w-9 h-9 flex items-center justify-center transition-all hover:bg-black/10 rounded-full border border-transparent hover:border-theme active:scale-90 text-theme-muted"
          title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}
        >
          <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
        </button>

        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => onSettingsToggle(!isSettingsOpen)} 
            className="w-9 h-9 flex items-center justify-center transition-all hover:bg-black/10 rounded-full border border-transparent hover:border-theme active:scale-90 relative" 
            style={{ color: isSettingsOpen ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <i className={`fas ${isSettingsOpen ? 'fa-times' : 'fa-cog'} text-sm`}></i>
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-[2.5rem] border shadow-2xl p-2 z-[100] animate-in fade-in zoom-in slide-in-from-top-2 duration-200 overflow-hidden backdrop-blur-2xl" style={{ backgroundColor: 'var(--bg-side)', borderColor: 'var(--border)' }}>
              
              <div className="p-4 space-y-5">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest block opacity-40 px-2" style={{ color: 'var(--text-main)' }}>Ambiente Visual</span>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                      <button key={t.id} onClick={() => onThemeChange(t.id as ThemeType)} className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-[9px] font-black transition-all border ${currentTheme === t.id ? 'bg-theme-accent/20 border-theme-accent text-theme-accent' : 'bg-theme-panel/50 border-transparent hover:border-theme text-theme-main opacity-50'}`}>
                        <div className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: t.color }}></div>
                        <span className="truncate uppercase tracking-tighter">{t.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest block opacity-40 px-2" style={{ color: 'var(--text-main)' }}>Qualidade de Render</span>
                  <div className="flex flex-wrap gap-2">
                    {qualities.map((q) => (
                      <button 
                        key={q.id} 
                        onClick={() => onQualityChange(q.id)} 
                        className={`flex-1 min-w-[30%] py-2.5 rounded-xl text-[8px] font-black uppercase transition-all border ${previewQuality === q.id ? 'bg-theme-accent border-theme-accent text-white shadow-lg' : 'bg-theme-panel/50 border-theme opacity-30 hover:opacity-100 text-theme-main'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest block opacity-40 px-2" style={{ color: 'var(--text-main)' }}>Cache de Molduras (Local)</span>
                  <button 
                    onClick={handleSelectCacheFolder}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${cacheDirHandle ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-theme-panel/50 border-theme text-theme-muted hover:border-theme-accent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`fas ${cacheDirHandle ? 'fa-folder-open' : 'fa-folder-plus'}`}></i>
                      <span>{cacheDirHandle ? 'Pasta Conectada' : 'Selecionar Pasta'}</span>
                    </div>
                    {cacheDirHandle && <i className="fas fa-check-circle animate-pulse"></i>}
                  </button>
                  <p className="text-[7px] opacity-40 uppercase tracking-widest px-2 leading-tight">Aponta para: ./cache/molduras (ou pasta personalizada)</p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-1">
                  <button onClick={() => { onShowAbout(); onSettingsToggle(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 transition-all">
                    <i className="fas fa-paw text-[11px]"></i>
                    <span>Créditos MiauTools</span>
                  </button>
                  <a 
                    href="/api/download-project" 
                    download="miau-tools-project.zip"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 transition-all"
                  >
                    <i className="fas fa-file-archive text-[11px]"></i>
                    <span>Baixar Projeto (ZIP)</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
