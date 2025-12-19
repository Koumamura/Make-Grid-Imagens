
import React from 'react';
import { ResizeMode } from '../tools/ResizerTool';

interface SidebarResizerProps {
  settings: any;
  onSettingsChange: (s: any) => void;
  onAdd: () => void;
  onDownloadAll: () => void;
  isProcessing?: boolean;
  progress?: number;
  total?: number;
  exportOptions: {
    downloadIndividual: boolean;
    setDownloadIndividual: (v: boolean) => void;
    downloadZip: boolean;
    setDownloadZip: (v: boolean) => void;
  };
}

const SidebarResizer: React.FC<SidebarResizerProps> = ({ 
  settings, 
  onSettingsChange, 
  onAdd, 
  onDownloadAll,
  isProcessing = false,
  progress = 0,
  total = 0,
  exportOptions
}) => {
  const modes: { id: ResizeMode; label: string; icon: string; desc: string }[] = [
    { id: 'fit', label: 'Conter (Fit)', icon: 'fa-compress', desc: 'Mantém tudo visível' },
    { id: 'fill', label: 'Cobrir (Fill)', icon: 'fa-expand', desc: 'Preenche sem bordas' },
    { id: 'stretch', label: 'Esticar', icon: 'fa-arrows-alt', desc: 'Ignora proporções' },
  ];

  const selectMode = (mode: 'individual' | 'zip') => {
    if (mode === 'individual') {
      exportOptions.setDownloadIndividual(true);
      exportOptions.setDownloadZip(false);
    } else {
      exportOptions.setDownloadIndividual(false);
      exportOptions.setDownloadZip(true);
    }
  };

  return (
    <div className="p-6 space-y-8 h-full flex flex-col">
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Importar</h3>
        <button onClick={onAdd} className="w-full py-3.5 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase group relative overflow-hidden transition-transform active:scale-95">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-images"></i> Adicionar Lote
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Resolução Alvo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Largura (px)</label>
            <input 
              type="number" 
              value={settings.width}
              onChange={(e) => onSettingsChange({ ...settings, width: parseInt(e.target.value) || 0 })}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Altura (px)</label>
            <input 
              type="number" 
              value={settings.height}
              onChange={(e) => onSettingsChange({ ...settings, height: parseInt(e.target.value) || 0 })}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Modo de Escala</h3>
        <div className="flex flex-col gap-2">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => onSettingsChange({ ...settings, mode: mode.id })}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left group ${settings.mode === mode.id ? 'bg-theme-accent/10 border-theme-accent shadow-sm' : 'border-theme opacity-60 hover:opacity-100'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${settings.mode === mode.id ? 'bg-theme-accent text-white' : 'bg-theme-panel text-theme-muted'}`}>
                <i className={`fas ${mode.icon} text-xs`}></i>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase ${settings.mode === mode.id ? 'text-theme-accent' : ''}`}>{mode.label}</span>
                <span className="text-[8px] opacity-40 uppercase">{mode.desc}</span>
              </div>
              {settings.mode === mode.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-theme-accent animate-in zoom-in duration-200"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t border-theme pt-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Modo de Exportação</h3>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => selectMode('individual')}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${exportOptions.downloadIndividual ? 'bg-theme-accent/10 border-theme-accent shadow-sm' : 'bg-theme-panel/30 border-theme opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportOptions.downloadIndividual ? 'border-theme-accent bg-theme-accent' : 'border-theme'}`}>
              {exportOptions.downloadIndividual && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in duration-200"></div>}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase leading-tight">Separados</span>
              <span className="text-[8px] opacity-50 uppercase">Arquivos separados  em multiplos download</span>
            </div>
          </button>

          <button 
            onClick={() => selectMode('zip')}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${exportOptions.downloadZip ? 'bg-theme-accent/10 border-theme-accent shadow-sm' : 'bg-theme-panel/30 border-theme opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportOptions.downloadZip ? 'border-theme-accent bg-theme-accent' : 'border-theme'}`}>
              {exportOptions.downloadZip && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in duration-200"></div>}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase leading-tight">Compactado (.ZIP)</span>
              <span className="text-[8px] opacity-50 uppercase">Ideal para grandes lotes</span>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button 
          onClick={onDownloadAll} 
          disabled={isProcessing || total === 0}
          className="w-full py-4 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95 uppercase tracking-widest disabled:opacity-50"
        >
           <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           {isProcessing ? (
             <>
               <i className="fas fa-spinner animate-spin"></i>
               <span>Redimensionando {progress}/{total}</span>
             </>
           ) : (
             <>
               <i className="fas fa-bolt"></i> <span> Salvar </span>
             </>
           )}
        </button>
      </div>
    </div>
  );
};

export default SidebarResizer;
