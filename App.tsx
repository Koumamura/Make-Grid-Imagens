
import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import GridTool from './tools/GridTool';
import ResizerTool from './tools/ResizerTool';
import FramingTool from './tools/FramingTool';
import AlphaEdgeTool from './tools/AlphaEdgeTool';
import AILabTool from './tools/AILabTool';
import { ToolType, ThemeType, PreviewQuality } from './types';
import { miauAudio } from './utils/audio';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('grid');
  const [theme, setTheme] = useState<ThemeType>('midnight');
  const [previewQuality, setPreviewQuality] = useState<PreviewQuality>('fast');
  const [showAbout, setShowAbout] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Estado para persistência de pasta local (FileSystemHandle)
  const [frameDirHandle, setFrameDirHandle] = useState<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Desbloqueia o áudio na primeira interação
      miauAudio.unlock();

      const target = e.target as HTMLElement;
      const isButton = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'A' ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isButton) {
        miauAudio.playBtClick();
      } else {
        miauAudio.playMouseClick();
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const renderTool = () => {
    switch (activeTool) {
      case 'grid':
        return <GridTool />;
      case 'resizer':
        return <ResizerTool />;
      case 'framing':
        return <FramingTool cacheDirHandle={frameDirHandle} isSettingsOpen={isSettingsOpen} />;
      case 'alpha-edge':
        return <AlphaEdgeTool globalPreviewQuality={previewQuality} />;
      case 'ai-lab':
        return <AILabTool />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center opacity-50 bg-theme-main">
            <div className="text-center text-theme-main">
              <i className="fas fa-tools text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold uppercase tracking-widest">Módulo em Desenvolvimento</h2>
              <p className="text-xs opacity-50 mt-2">Estamos preparando esta ferramenta para você.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden transition-colors duration-300 relative bg-theme-main text-theme-main">
      <TopNav 
        activeTool={activeTool} 
        onToolChange={setActiveTool} 
        currentTheme={theme}
        onThemeChange={setTheme}
        previewQuality={previewQuality}
        onQualityChange={setPreviewQuality}
        onShowAbout={() => setShowAbout(true)}
        cacheDirHandle={frameDirHandle}
        onCacheDirChange={setFrameDirHandle}
        isSettingsOpen={isSettingsOpen}
        onSettingsToggle={setIsSettingsOpen}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {renderTool()}
      </main>

      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="max-w-lg w-full bg-theme-side border border-theme rounded-none p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-neutral-900 to-amber-100"></div>
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 text-theme-muted hover:text-theme-main transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-panel">
              <i className="fas fa-times"></i>
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-theme-accent flex items-center justify-center text-theme-inv shadow-2xl mb-8 rotate-3 group-hover:rotate-0 transition-all duration-500 relative">
                <div className="absolute inset-0 bg-theme-accent rounded-3xl animate-ping opacity-20"></div>
                <i className="fas fa-paw text-4xl z-10"></i>
              </div>
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-black tracking-tighter"><span className="miau-text">Miau</span>Tools</h2>
                <div className="flex items-center gap-2 justify-center opacity-40">
                  <div className="h-[1px] w-4 bg-current"></div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em]">Mundo de Inovação em Artes e Utilitários</p>
                  <div className="h-[1px] w-4 bg-current"></div>
                </div>
              </div>
              <div className="space-y-6 text-sm leading-relaxed text-theme-main/80 text-justify mb-10">
                <p>A <span className="font-bold text-theme-accent">MiauTools</span> é uma ferramenta de edição de código aberto desenvolvida pelo grupo <span className="font-bold uppercase">Miau</span>.</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-theme-panel border border-theme hover:border-theme-accent transition-colors">
                    <i className="fas fa-magic text-theme-accent mb-2 text-xs"></i>
                    <h4 className="text-[8px] font-black uppercase mb-1">Borde Maker</h4>
                    <p className="text-[8px] opacity-60 leading-tight">Bordas e estampas profissionais.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-theme-panel border border-theme hover:border-theme-accent transition-colors">
                    <i className="fas fa-brain text-theme-accent mb-2 text-xs"></i>
                    <h4 className="text-[8px] font-black uppercase mb-1">AI Lab</h4>
                    <p className="text-[8px] opacity-60 leading-tight">O poder do Gemini nas suas mãos.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-theme-panel border border-theme hover:border-theme-accent transition-colors">
                    <i className="fas fa-hands-helping text-theme-accent mb-2 text-xs"></i>
                    <h4 className="text-[8px] font-black uppercase mb-1">Colaboração</h4>
                    <p className="text-[8px] opacity-60 leading-tight">Feito pela comunidade, para todos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
