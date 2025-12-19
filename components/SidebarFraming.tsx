
import React from 'react';
import { FrameSettings } from '../types';

interface SidebarFramingProps {
  settings: FrameSettings;
  onSettingsChange: (s: FrameSettings) => void;
  onAddLote: () => void;
  onAddExtras: () => void;
  onAddFrame: () => void;
  autoSave: boolean;
  onAutoSaveChange: (v: boolean) => void;
  onProcessAll?: () => void;
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

const SidebarFraming: React.FC<SidebarFramingProps> = ({ 
  settings, 
  onSettingsChange, 
  onAddLote, 
  onAddExtras, 
  onAddFrame,
  autoSave,
  onAutoSaveChange,
  onProcessAll,
  isProcessing = false,
  progress = 0,
  total = 0,
  exportOptions
}) => {
  const handleChange = (key: keyof FrameSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  // Função para garantir comportamento de rádio/toggle
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
    <div className="p-6 space-y-8">
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Fluxo de Trabalho</h3>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={onAddLote} className="w-full py-3.5 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase group relative overflow-hidden transition-transform active:scale-95">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className="fas fa-images"></i> 1. Carregar Lote Principal
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onAddExtras} className="py-2.5 rounded-lg font-black text-[9px] border border-theme bg-theme-panel text-theme-main shadow-sm flex items-center justify-center gap-2 uppercase hover:bg-black/5 transition-colors">
              <i className="fas fa-plus"></i> Extras
            </button>
            <button onClick={onAddFrame} className="py-2.5 rounded-lg font-black text-[9px] border border-theme bg-theme-panel text-theme-main shadow-sm flex items-center justify-center gap-2 uppercase hover:bg-black/5 transition-colors">
              <i className="fas fa-border-all"></i> Moldura
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Configurações Base</h3>
        
        {!settings.frameImageUrl ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {[
              { label: 'Espessura Borda', key: 'borderWidth', min: 0, max: 200 },
              { label: 'Arredondamento', key: 'borderRadius', min: 0, max: 200 },
              { label: 'Sombra Interna', key: 'shadow', min: 0, max: 100 },
            ].map(ctrl => (
              <div key={ctrl.key} className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[9px] font-bold opacity-60 uppercase">{ctrl.label}</label>
                  <span className="text-[9px] font-black text-theme-accent">{(settings as any)[ctrl.key]}</span>
                </div>
                <input 
                  type="range" 
                  min={ctrl.min} max={ctrl.max} 
                  value={(settings as any)[ctrl.key]}
                  onChange={(e) => handleChange(ctrl.key as any, parseInt(e.target.value))}
                  className="w-full h-1 bg-theme-panel rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
               <label className="text-[9px] font-bold opacity-60 uppercase">Cor da Borda</label>
               <div className="flex items-center gap-3">
                 <span className="text-[9px] font-mono opacity-40 uppercase">{settings.borderColor}</span>
                 <input 
                    type="color" 
                    value={settings.borderColor} 
                    onChange={(e) => handleChange('borderColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-theme cursor-pointer bg-theme-panel p-0.5 overflow-hidden transition-transform active:scale-90"
                 />
               </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-theme-accent/5 rounded-lg border border-theme-accent/20 flex gap-3 items-center">
            <i className="fas fa-check-circle text-theme-accent text-xs"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase text-theme-accent">Moldura Ativa</p>
              <p className="text-[8px] opacity-50 truncate">{settings.frameImageName}</p>
            </div>
            <button onClick={() => handleChange('frameImageUrl', undefined)} className="text-red-500 hover:scale-110 transition-transform p-1"><i className="fas fa-trash-alt text-[10px]"></i></button>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-theme">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Resolução de Saída</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-bold opacity-50 uppercase mb-1 block">Largura</label>
              <input 
                type="number" 
                value={settings.canvasWidth} 
                onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)}
                className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold opacity-50 uppercase mb-1 block">Altura</label>
              <input 
                type="number" 
                value={settings.canvasHeight} 
                onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)}
                className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4 border-t border-theme">
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
              <span className="text-[8px] opacity-50 uppercase">Ideal para grandes lotes </span>
            </div>
          </button>
        </div>
      </div>

      <div className="pt-4 space-y-4 mt-auto">
        <label className="flex items-center gap-3 p-3 rounded-lg border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5 active:scale-[0.98]">
          <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${autoSave ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
            {autoSave && <i className="fas fa-check text-[8px] text-white"></i>}
            <input type="checkbox" className="hidden" checked={autoSave} onChange={e => onAutoSaveChange(e.target.checked)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Salvar ao Avançar</span>
            <span className="text-[8px] opacity-40 uppercase">Preserva ajustes ao trocar item</span>
          </div>
        </label>

        <button 
          onClick={onProcessAll}
          disabled={isProcessing || total === 0}
          className="w-full py-4 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95 uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale"
        >
           <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           {isProcessing ? (
             <>
               <i className="fas fa-spinner animate-spin z-10"></i>
               <span className="z-10">Gerando {progress} de {total}...</span>
             </>
           ) : (
             <>
               <i className="fas fa-bolt z-10"></i> 
               <span className="z-10">Salvar</span>
             </>
           )}
        </button>
      </div>
    </div>
  );
};

export default SidebarFraming;
