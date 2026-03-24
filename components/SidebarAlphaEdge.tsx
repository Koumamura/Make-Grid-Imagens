
import React from 'react';
import { AlphaEdgeSettings } from '../types';
import MiauSlider from './MiauSlider';

interface SidebarAlphaEdgeProps {
  settings: AlphaEdgeSettings;
  onSettingsChange: (s: AlphaEdgeSettings) => void;
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
  onOpenAdvanced: () => void;
  autoSave: boolean;
  onAutoSaveChange: (v: boolean) => void;
  onApplyToAll: () => void;
  onExportGrid: () => void;
  onApplyPrefixToAll?: () => void;
}

const SidebarAlphaEdge: React.FC<SidebarAlphaEdgeProps> = ({ 
  settings, onSettingsChange, onAdd, onSave, isProcessing, progress, total, exportOptions, onOpenAdvanced, autoSave, onAutoSaveChange, onApplyToAll, onExportGrid, onApplyPrefixToAll
}) => {
  const handleChange = (key: keyof AlphaEdgeSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const shapes: { id: AlphaEdgeSettings['geometricShape'], icon: string }[] = [
    { id: 'circle', icon: 'fa-circle' },
    { id: 'square', icon: 'fa-square' },
    { id: 'diamond', icon: 'fa-clone' },
    { id: 'heart', icon: 'fa-heart' },
    { id: 'star', icon: 'fa-star' }
  ];

  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto scrollbar-hide flex flex-col">
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 text-theme-accent">Auto-Fit Engine</h3>
        <button onClick={onAdd} className="w-full py-4 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase active:scale-95 transition-all">
          <i className="fas fa-wand-magic-sparkles"></i> Importar Lote
        </button>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Geometria Base</h3>
        <div className="flex p-1 bg-black/20 rounded-xl border border-theme mb-2">
          <button onClick={() => handleChange('boundaryMode', 'silhouette')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${settings.boundaryMode === 'silhouette' ? 'bg-theme-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}>Silhueta</button>
          <button onClick={() => handleChange('boundaryMode', 'geometric')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${settings.boundaryMode === 'geometric' ? 'bg-theme-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}>Forma</button>
        </div>
        {settings.boundaryMode === 'geometric' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-5 gap-1.5">
              {shapes.map(s => (
                <button key={s.id} onClick={() => handleChange('geometricShape', s.id)} className={`h-9 rounded-lg border flex items-center justify-center transition-all ${settings.geometricShape === s.id ? 'bg-theme-accent text-white border-theme-accent shadow-lg' : 'bg-theme-panel border-theme opacity-30'}`}>
                  <i className={`fas ${s.icon} text-[10px]`}></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Efeito Alpha (Glow)</h3>
        <div className="space-y-4">
          <MiauSlider label="Shift (Glow)" min={0} max={250} value={settings.thickness} onChange={(v) => handleChange('thickness', v)} icon="fa-expand-arrows-alt" />
          <MiauSlider label="Feather (Softness)" min={0} max={150} value={settings.softness} onChange={(v) => handleChange('softness', v)} icon="fa-feather-alt" />
          <MiauSlider label="Escala da Borda" min={50} max={500} value={settings.borderScale} onChange={(v) => handleChange('borderScale', v)} unit="%" icon="fa-compress-arrows-alt" />
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <button onClick={onOpenAdvanced} className="w-full py-3.5 rounded-xl bg-theme-panel hover:bg-theme-accent/20 border border-theme hover:border-theme-accent transition-all flex items-center justify-center gap-3">
          <div className="w-4 h-4 rounded-full border border-theme shadow-inner" style={{ backgroundColor: settings.color }}></div>
          <span className="text-[9px] font-black uppercase tracking-widest">Estúdio de Estampas</span>
          <i className="fas fa-cog text-theme-accent text-[10px]"></i>
        </button>
      </div>

      <div className="mt-auto pt-4 space-y-4">
        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
            <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${autoSave ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
              {autoSave && <i className="fas fa-check text-[8px] text-white"></i>}
              <input type="checkbox" className="hidden" checked={autoSave} onChange={e => onAutoSaveChange(e.target.checked)} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Auto-Preservar</span>
              <span className="text-[8px] opacity-40 uppercase">Ajustes Manuais</span>
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

        <button onClick={onSave} disabled={isProcessing || total === 0} className="w-full py-5 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 uppercase disabled:opacity-50 active:scale-95 transition-all">
           {isProcessing ? <><i className="fas fa-spinner animate-spin"></i> {progress}/{total}</> : <><i className="fas fa-save"></i> Iniciar Exportação</>}
        </button>
      </div>
    </div>
  );
};

export default SidebarAlphaEdge;
