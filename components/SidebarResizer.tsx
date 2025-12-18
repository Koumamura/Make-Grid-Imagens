
import React from 'react';
import { ResizeMode } from '../tools/ResizerTool';

interface SidebarResizerProps {
  settings: any;
  onSettingsChange: (s: any) => void;
  onAdd: () => void;
  onDownloadAll: () => void;
}

const SidebarResizer: React.FC<SidebarResizerProps> = ({ settings, onSettingsChange, onAdd, onDownloadAll }) => {
  const modes: { id: ResizeMode; label: string; icon: string }[] = [
    { id: 'fit', label: 'Conter (Fit)', icon: 'fa-compress' },
    { id: 'fill', label: 'Cobrir (Fill)', icon: 'fa-expand' },
    { id: 'stretch', label: 'Esticar', icon: 'fa-arrows-alt' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Importar</h3>
        <button onClick={onAdd} className="w-full py-3 rounded-xl font-black text-xs transition-all active:scale-95 bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2">
          <i className="fas fa-images"></i> ADICIONAR LOTE
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Dimensões Alvo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold opacity-50 uppercase">Largura</label>
            <input 
              type="number" 
              value={settings.width}
              onChange={(e) => onSettingsChange({ ...settings, width: parseInt(e.target.value) || 0 })}
              className="w-full bg-theme-panel border border-theme rounded-md p-2 text-xs text-theme-main focus:ring-2 focus:ring-theme-accent outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold opacity-50 uppercase">Altura</label>
            <input 
              type="number" 
              value={settings.height}
              onChange={(e) => onSettingsChange({ ...settings, height: parseInt(e.target.value) || 0 })}
              className="w-full bg-theme-panel border border-theme rounded-md p-2 text-xs text-theme-main focus:ring-2 focus:ring-theme-accent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Modo de Escala</h3>
        <div className="flex flex-col gap-2">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => onSettingsChange({ ...settings, mode: mode.id })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all relative group overflow-hidden"
              style={{ 
                backgroundColor: settings.mode === mode.id ? 'var(--ui-selected)' : 'transparent',
                borderColor: settings.mode === mode.id ? 'var(--accent)' : 'var(--border)',
                color: settings.mode === mode.id ? 'var(--accent)' : 'var(--text-main)'
              }}
            >
              <i className={`fas ${mode.icon} text-[10px] opacity-60`}></i>
              {mode.label}
              {settings.mode === mode.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-theme-accent"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button onClick={onDownloadAll} className="w-full py-3 rounded-xl font-black text-sm bg-theme-accent text-theme-inv shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95">
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <i className="fas fa-cloud-download-alt z-10"></i> <span className="z-10">PROCESSAR TUDO</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarResizer;
