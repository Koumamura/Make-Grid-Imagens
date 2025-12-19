
import React from 'react';
import { ResizeMode } from '../tools/ResizerTool';

interface SidebarResizerProps {
  settings: any;
  onSettingsChange: (s: any) => void;
  onAdd: () => void;
  onSave: () => void;
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
  onSave,
  isProcessing = false,
  progress = 0,
  total = 0,
  exportOptions
}) => {
  const modes: { id: ResizeMode; label: string; icon: string }[] = [
    { id: 'fit', label: 'Conter (Fit)', icon: 'fa-compress' },
    { id: 'fill', label: 'Cobrir (Fill)', icon: 'fa-expand' },
    { id: 'stretch', label: 'Esticar', icon: 'fa-arrows-alt' },
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
    <div className="p-5 space-y-6 h-full overflow-y-auto scrollbar-hide flex flex-col">
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Entrada</h3>
        <button onClick={onAdd} className="w-full py-3.5 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase group relative overflow-hidden transition-transform active:scale-95">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-plus-circle"></i> Importar Lote
        </button>
      </div>

      <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-4 ${settings.activeMethod === 'fixed' && !settings.useTrim ? 'bg-theme-accent/5 border-theme-accent shadow-sm' : 'border-theme bg-theme-panel/10 opacity-80'}`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 flex justify-between">
          <span>Tamanho Fixo</span>
          {settings.activeMethod === 'fixed' && !settings.useTrim && <i className="fas fa-check-circle text-theme-accent"></i>}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Largura</label>
            <input type="number" value={settings.width} onChange={(e) => onSettingsChange({ ...settings, width: parseInt(e.target.value) || 0, activeMethod: 'fixed', useTrim: false })} className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Altura</label>
            <input type="number" value={settings.height} onChange={(e) => onSettingsChange({ ...settings, height: parseInt(e.target.value) || 0, activeMethod: 'fixed', useTrim: false })} className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[8px] font-bold opacity-50 uppercase block">Modo de Escala</label>
          <div className="flex flex-col gap-1.5">
            {modes.map(mode => (
              <button key={mode.id} onClick={() => onSettingsChange({ ...settings, mode: mode.id, activeMethod: 'fixed', useTrim: false })} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all text-left ${settings.mode === mode.id && settings.activeMethod === 'fixed' && !settings.useTrim ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-panel/50 border-theme opacity-60'}`}>
                <i className={`fas ${mode.icon} text-[9px]`}></i>
                <span className="text-[9px] font-black uppercase">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-4 ${settings.useTrim ? 'bg-theme-accent/5 border-theme-accent shadow-sm' : 'border-theme bg-theme-panel/10 opacity-80'}`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 flex justify-between">
          <span>Auto Crop (Recorte)</span>
          {settings.useTrim && <i className="fas fa-magic text-theme-accent animate-pulse"></i>}
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Margem Interna</label>
            <span className="text-[10px] font-mono font-black text-theme-accent">{settings.trimMargin}px</span>
          </div>
          <input type="range" min="0" max="300" value={settings.trimMargin} onChange={(e) => onSettingsChange({ ...settings, trimMargin: parseInt(e.target.value), useTrim: true })} className="w-full h-1 bg-theme-panel rounded-lg appearance-none cursor-pointer accent-theme-accent" />
        </div>
        <button onClick={() => onSettingsChange({ ...settings, useTrim: !settings.useTrim })} className={`w-full py-3 rounded-xl font-black text-[10px] border flex items-center justify-center gap-3 uppercase tracking-widest transition-all ${settings.useTrim ? 'bg-theme-accent text-white border-theme-accent shadow-lg' : 'bg-theme-panel border-theme text-theme-main opacity-60'}`}>
           <i className="fas fa-crop-alt"></i>
           <span>{settings.useTrim ? 'Auto Crop Ativo' : 'Ativar Auto Crop'}</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Exportação</h3>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => selectMode('individual')} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${exportOptions.downloadIndividual ? 'bg-theme-accent/10 border-theme-accent' : 'bg-theme-panel/30 border-theme opacity-60'}`}>
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${exportOptions.downloadIndividual ? 'border-theme-accent bg-theme-accent' : 'border-theme'}`}>{exportOptions.downloadIndividual && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in"></div>}</div>
            <span className="text-[9px] font-black uppercase">Separados</span>
          </button>
          <button onClick={() => selectMode('zip')} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${exportOptions.downloadZip ? 'bg-theme-accent/10 border-theme-accent' : 'bg-theme-panel/30 border-theme opacity-60'}`}>
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${exportOptions.downloadZip ? 'border-theme-accent bg-theme-accent' : 'border-theme'}`}>{exportOptions.downloadZip && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in"></div>}</div>
            <span className="text-[9px] font-black uppercase">Pacote (.ZIP)</span>
          </button>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button onClick={onSave} disabled={isProcessing || total === 0} className="w-full py-4 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 active:scale-95">
           {isProcessing ? <><i className="fas fa-spinner animate-spin"></i> {progress}/{total}</> : <><i className="fas fa-save"></i> Salvar Lote</>}
        </button>
      </div>
    </div>
  );
};

export default SidebarResizer;
