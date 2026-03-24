
import React from 'react';
import { FrameSettings } from '../types';
import MiauSlider from './MiauSlider';

interface SidebarFramingProps {
  settings: FrameSettings;
  onSettingsChange: (s: FrameSettings) => void;
  onAddLote: () => void;
  onAddExtras: () => void;
  onAddFrame: () => void;
  onOpenPresets: () => void;
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
  onApplyPrefixToAll?: () => void;
}

const SidebarFraming: React.FC<SidebarFramingProps> = ({ 
  settings, onSettingsChange, onAddLote, onAddExtras, onAddFrame, onOpenPresets, autoSave, onAutoSaveChange, onProcessAll, isProcessing = false, progress = 0, total = 0, exportOptions, onApplyPrefixToAll
}) => {
  const handleChange = (key: keyof FrameSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <>
      <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
          <div className="flex justify-between items-center border-b border-theme pb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Fluxo de Trabalho</h3>
            <button 
              onClick={onOpenPresets}
              className="text-[9px] font-black uppercase text-theme-accent hover:brightness-110 transition-all flex items-center gap-1.5 px-2 py-1 rounded-lg bg-theme-accent/10 border border-theme-accent/20"
            >
              <i className="fas fa-bookmark text-[8px]"></i> Presets
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={onAddLote} className="w-full py-3.5 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase group relative overflow-hidden transition-transform active:scale-95">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <i className="fas fa-images"></i> 1. Lote Principal
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onAddExtras} className="py-2.5 rounded-lg font-black text-[9px] border border-theme bg-theme-panel text-theme-main shadow-sm flex items-center justify-center gap-2 uppercase hover:bg-black/10 transition-colors"><i className="fas fa-plus"></i> Extras</button>
              <button onClick={onAddFrame} className="py-2.5 rounded-lg font-black text-[9px] border border-theme bg-theme-panel text-theme-main shadow-sm flex items-center justify-center gap-2 uppercase hover:bg-black/10 transition-colors"><i className="fas fa-border-all"></i> Moldura</button>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 text-theme-accent">Configurações Base</h3>
          {!settings.frameImageUrl ? (
            <div className="space-y-4">
              <MiauSlider label="Espessura Borda" min={0} max={200} value={settings.borderWidth} onChange={(v) => handleChange('borderWidth', v)} icon="fa-border-style" />
              <MiauSlider label="Arredondamento" min={0} max={200} value={settings.borderRadius} onChange={(v) => handleChange('borderRadius', v)} icon="fa-circle-notch" />
              <MiauSlider label="Sombra Interna" min={0} max={100} value={settings.shadow} onChange={(v) => handleChange('shadow', v)} icon="fa-moon" />
              <div className="flex items-center justify-between pt-2">
                 <label className="text-[9px] font-bold opacity-60 uppercase">Cor da Borda</label>
                 <input type="color" value={settings.borderColor} onChange={(e) => handleChange('borderColor', e.target.value)} className="w-8 h-8 rounded-lg border border-theme cursor-pointer bg-theme-panel p-0.5" />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-theme-accent/5 rounded-lg border border-theme-accent/20 flex gap-3 items-center"><i className="fas fa-check-circle text-theme-accent text-xs"></i><div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase text-theme-accent">Moldura Ativa</p><p className="text-[8px] opacity-50 truncate">{settings.frameImageName}</p></div><button onClick={() => handleChange('frameImageUrl', undefined)} className="text-red-500 p-1"><i className="fas fa-trash-alt text-[10px]"></i></button></div>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Resolução de Saída</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[8px] font-bold opacity-50 uppercase block">Largura</label><input type="number" value={settings.canvasWidth} onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)} className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono" /></div>
            <div className="space-y-1"><label className="text-[8px] font-bold opacity-50 uppercase block">Altura</label><input type="number" value={settings.canvasHeight} onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)} className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono" /></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 text-theme-accent">Nomenclatura</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase opacity-40 ml-1">Prefixo Global</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Ex: final_" value={settings.exportPrefix || ''} onChange={(e) => handleChange('exportPrefix', e.target.value)} className="flex-1 bg-theme-panel border border-theme rounded-xl p-2.5 text-[10px] outline-none font-bold focus:border-theme-accent" />
                <button onClick={onApplyPrefixToAll} className="px-3 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-theme-accent hover:bg-theme-accent hover:text-white transition-all text-[10px]"><i className="fas fa-clone"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-theme-side p-5 pt-4 border-t border-theme z-20 mt-auto">
        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
            <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${autoSave ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
              {autoSave && <i className="fas fa-check text-[8px] text-white"></i>}
              <input type="checkbox" className="hidden" checked={autoSave} onChange={e => onAutoSaveChange(e.target.checked)} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Auto-Preservar</span>
              <span className="text-[8px] opacity-40 uppercase">Ajustes Automáticos</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
            <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${exportOptions.downloadZip ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
              {exportOptions.downloadZip && <i className="fas fa-check text-[8px] text-white"></i>}
              <input type="checkbox" className="hidden" checked={exportOptions.downloadZip} onChange={e => {
                exportOptions.setDownloadZip(e.target.checked);
                exportOptions.setDownloadIndividual(!e.target.checked);
              }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Salvar Zipado</span>
              <span className="text-[8px] opacity-40 uppercase">Pacote Único (.zip)</span>
            </div>
          </label>
        </div>

        <button onClick={onProcessAll} disabled={isProcessing || total === 0} className="w-full py-4 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95 uppercase tracking-widest disabled:opacity-50 mt-4">
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {isProcessing ? (<><i className="fas fa-spinner animate-spin"></i><span>Processando {progress}/{total}</span></>) : (<><i className="fas fa-save"></i> <span>Salvar e Baixar Lote</span></>)}
        </button>
      </div>
    </>
  );
};

export default SidebarFraming;
