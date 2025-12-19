
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
      {/* BOX: FLUXO DE TRABALHO */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Fluxo de Trabalho</h3>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={onAddLote} className="w-full py-3.5 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase group relative overflow-hidden transition-transform active:scale-95">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className="fas fa-images"></i> 1. Lote Principal
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onAddExtras} className="py-2.5 rounded-lg font-black text-[9px] border border-theme bg-theme-panel text-theme-main shadow-sm flex items-center justify-center gap-2 uppercase hover:bg-black/10 transition-colors">
              <i className="fas fa-plus"></i> Extras
            </button>
            <button onClick={onAddFrame} className="py-2.5 rounded-lg font-black text-[9px] border border-theme bg-theme-panel text-theme-main shadow-sm flex items-center justify-center gap-2 uppercase hover:bg-black/10 transition-colors">
              <i className="fas fa-border-all"></i> Moldura
            </button>
          </div>
        </div>
      </div>

      {/* BOX: CONFIGURAÇÕES BASE */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Configurações Base</h3>
        
        {!settings.frameImageUrl ? (
          <div className="space-y-4">
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
               <input 
                  type="color" 
                  value={settings.borderColor} 
                  onChange={(e) => handleChange('borderColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-theme cursor-pointer bg-theme-panel p-0.5"
               />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-theme-accent/5 rounded-lg border border-theme-accent/20 flex gap-3 items-center">
            <i className="fas fa-check-circle text-theme-accent text-xs"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase text-theme-accent">Moldura Ativa</p>
              <p className="text-[8px] opacity-50 truncate">{settings.frameImageName}</p>
            </div>
            <button onClick={() => handleChange('frameImageUrl', undefined)} className="text-red-500 p-1"><i className="fas fa-trash-alt text-[10px]"></i></button>
          </div>
        )}
      </div>

      {/* BOX: RESOLUÇÃO DE SAÍDA */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Resolução de Saída</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase block">Largura</label>
            <input 
              type="number" 
              value={settings.canvasWidth} 
              onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase block">Altura</label>
            <input 
              type="number" 
              value={settings.canvasHeight} 
              onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* BOX: MODO DE EXPORTAÇÃO */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Modo de Exportação</h3>
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
              <span className="text-[8px] opacity-50 uppercase">Um por um</span>
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
              <span className="text-[8px] opacity-50 uppercase">Pacote Único</span>
            </div>
          </button>
        </div>
      </div>

      {/* BOX: SALVAR E AVANÇAR */}
      <div className="mt-auto pt-4 space-y-4">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
          <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${autoSave ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
            {autoSave && <i className="fas fa-check text-[8px] text-white"></i>}
            <input type="checkbox" className="hidden" checked={autoSave} onChange={e => onAutoSaveChange(e.target.checked)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Auto-Preservar</span>
            <span className="text-[8px] opacity-40 uppercase">Salva ajustes ao avançar</span>
          </div>
        </label>

        <button 
          onClick={onProcessAll}
          disabled={isProcessing || total === 0}
          className="w-full py-4 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95 uppercase tracking-widest disabled:opacity-50"
        >
           <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           {isProcessing ? (
             <>
               <i className="fas fa-spinner animate-spin"></i>
               <span>Processando {progress}/{total}</span>
             </>
           ) : (
             <>
               <i className="fas fa-save"></i> <span>Salvar Lote</span>
             </>
           )}
        </button>
      </div>
    </div>
  );
};

export default SidebarFraming;
