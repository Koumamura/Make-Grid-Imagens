
import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import GridTool from './tools/GridTool';
import ResizerTool from './tools/ResizerTool';
import FramingTool from './tools/FramingTool';

export type ToolType = 'grid' | 'framing' | 'resizer' | 'max-resize';
export type ThemeType = 'dark' | 'light' | 'pastel' | 'midnight';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('resizer');
  const [theme, setTheme] = useState<ThemeType>('midnight');
  const [showAbout, setShowAbout] = useState(false);

  // Sincroniza o tema com o elemento raiz (html) para que o body e outros elementos fora do root respondam
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const renderTool = () => {
    switch (activeTool) {
      case 'grid':
        return <GridTool />;
      case 'resizer':
        return <ResizerTool />;
      case 'framing':
        return <FramingTool />;
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
    <div 
      className="flex flex-col h-screen overflow-hidden transition-colors duration-300 relative bg-theme-main text-theme-main" 
    >
      <TopNav 
        activeTool={activeTool} 
        onToolChange={setActiveTool} 
        currentTheme={theme}
        onThemeChange={setTheme}
        onShowAbout={() => setShowAbout(true)}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {renderTool()}
      </main>

      {/* MODAL SOBRE - MIAUTOOLS COMMUNITY EDITION */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="max-w-lg w-full bg-theme-side border border-theme rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            {/* Linha Decorativa Superior (Tricolor) */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-neutral-900 to-amber-100"></div>
            
            <button 
              onClick={() => setShowAbout(false)}
              className="absolute top-8 right-8 text-theme-muted hover:text-theme-main transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-panel"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Ícone Pulsante */}
              <div className="w-20 h-20 rounded-3xl bg-theme-accent flex items-center justify-center text-theme-inv shadow-2xl mb-8 rotate-3 group-hover:rotate-0 transition-all duration-500 relative">
                <div className="absolute inset-0 bg-theme-accent rounded-3xl animate-ping opacity-20"></div>
                <i className="fas fa-paw text-4xl z-10"></i>
              </div>
              
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-black tracking-tighter">
                  <span className="miau-text">Miau</span>Tools
                </h2>
                <div className="flex items-center gap-2 justify-center opacity-40">
                  <div className="h-[1px] w-4 bg-current"></div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em]">Mercado de Inovação de Artes e Utilitários</p>
                  <div className="h-[1px] w-4 bg-current"></div>
                </div>
              </div>

              <div className="space-y-6 text-sm leading-relaxed text-theme-main/80 text-justify mb-10">
                <p>
                  A <span className="font-bold text-theme-accent">MiauTools</span> é uma ferramenta de edição de código aberto desenvolvida pelo grupo <span className="font-bold uppercase">Miau</span>. 
                  O projeto nasceu como uma solução interna para otimizar nossos fluxos de criação e cresceu para se tornar uma iniciativa de código aberto.
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-theme-panel border border-theme hover:border-theme-accent transition-colors">
                    <i className="fas fa-leaf text-theme-accent mb-2 text-xs"></i>
                    <h4 className="text-[8px] font-black uppercase mb-1">Simplicidade</h4>
                    <p className="text-[8px] opacity-60 leading-tight">Interface limpa para focar no que importa.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-theme-panel border border-theme hover:border-theme-accent transition-colors">
                    <i className="fas fa-book-open text-theme-accent mb-2 text-xs"></i>
                    <h4 className="text-[8px] font-black uppercase mb-1">Aprendizado</h4>
                    <p className="text-[8px] opacity-60 leading-tight">Código aberto para crescermos juntos.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-theme-panel border border-theme hover:border-theme-accent transition-colors">
                    <i className="fas fa-hands-helping text-theme-accent mb-2 text-xs"></i>
                    <h4 className="text-[8px] font-black uppercase mb-1">Colaboração</h4>
                    <p className="text-[8px] opacity-60 leading-tight">Feito pela comunidade, para todos.</p>
                  </div>
                </div>

                <p className="italic text-center opacity-60 text-xs">
                  "Onde a tecnologia encontra a simplicidade da criação."
                </p>
              </div>

              <div className="pt-8 border-t border-theme w-full flex flex-col items-center gap-6">
                <div className="flex gap-6">
                  <a href="#" title="GitHub" className="w-12 h-12 rounded-2xl bg-theme-panel flex items-center justify-center hover:text-theme-accent hover:border-theme-accent transition-all border border-theme shadow-sm group/icon">
                    <i className="fab fa-github text-xl group-hover/icon:scale-110 transition-transform"></i>
                  </a>
                  <a href="#" title="Instagram" className="w-12 h-12 rounded-2xl bg-theme-panel flex items-center justify-center hover:text-theme-accent hover:border-theme-accent transition-all border border-theme shadow-sm group/icon">
                    <i className="fab fa-instagram text-xl group-hover/icon:scale-110 transition-transform"></i>
                  </a>
                  <a href="#" title="Discord" className="w-12 h-12 rounded-2xl bg-theme-panel flex items-center justify-center hover:text-theme-accent hover:border-theme-accent transition-all border border-theme shadow-sm group/icon">
                    <i className="fab fa-discord text-xl group-hover/icon:scale-110 transition-transform"></i>
                  </a>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Versão 1.0.0 Alpha • Open Source Project</span>
                  <div className="flex items-center gap-2 text-[8px] font-bold text-theme-accent opacity-50 uppercase tracking-tighter">
                    <span>Simplicity</span>
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    <span>Learning</span>
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    <span>Collaboration</span>
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
