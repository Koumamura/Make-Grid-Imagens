
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

  const setMethod = (method: 'fixed' | 'proportional') => {
    onSettingsChange({ ...settings, activeMethod: method });
  };

  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto scrollbar-hide flex flex-col">
      {/* BOX: IMPORTAÇÃO */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Entrada de Arquivos</h3>
        <button onClick={onAdd} className="w-full py-3.5 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase group relative overflow-hidden transition-transform active:scale-95">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-images"></i> Adicionar Lote
        </button>
      </div>

      {/* BOX: REDIMENSIONAMENTO FIXO */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-4 ${settings.activeMethod === 'fixed' ? 'bg-theme-accent/5 border-theme-accent shadow-sm' : 'border-theme bg-theme-panel/10 opacity-80'}`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 flex justify-between">
          <span>Redimensionamento Fixo</span>
          {settings.activeMethod === 'fixed' && <i className="fas fa-check-circle text-theme-accent"></i>}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Largura (px)</label>
            <input 
              type="number" 
              value={settings.width}
              onChange={(e) => onSettingsChange({ ...settings, width: parseInt(e.target.value) || 0 })}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none focus:border-theme-accent transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase">Altura (px)</label>
            <input 
              type="number" 
              value={settings.height}
              onChange={(e) => onSettingsChange({ ...settings, height: parseInt(e.target.value) || 0 })}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none focus:border-theme-accent transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-bold opacity-50 uppercase block">Modo de Escala</label>
          <div className="flex flex-col gap-1.5">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => onSettingsChange({ ...settings, mode: mode.id, activeMethod: 'fixed' })}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all text-left ${settings.mode === mode.id && settings.activeMethod === 'fixed' ? 'bg-theme-accent text-white border-theme-accent shadow-sm' : 'bg-theme-panel/50 border-theme opacity-60 hover:opacity-100'}`}
              >
                <i className={`fas ${mode.icon} text-[9px]`}></i>
                <span className="text-[9px] font-black uppercase flex-1">{mode.label}</span>
                {settings.mode === mode.id && settings.activeMethod === 'fixed' && <div className="w-1 h-1 rounded-full bg-white animate-in zoom-in"></div>}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => setMethod('fixed')} 
          className={`w-full py-2.5 rounded-xl font-black text-[9px] border flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 ${settings.activeMethod === 'fixed' ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-panel border-theme text-theme-main'}`}
        >
           <i className="fas fa-expand-arrows-alt"></i> Aplicar Fixo
        </button>
      </div>

      {/* BOX: REDIMENSIONAMENTO PROPORCIONAL */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-4 ${settings.activeMethod === 'proportional' ? 'bg-theme-accent/5 border-theme-accent shadow-sm' : 'border-theme bg-theme-panel/10 opacity-80'}`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 flex justify-between">
          <span>Redimensionamento Proporcional</span>
          {settings.activeMethod === 'proportional' && <i className="fas fa-check-circle text-theme-accent"></i>}
        </h3>
        
        <div className="space-y-1">
          <label className="text-[8px] font-bold opacity-50 uppercase">Tamanho Alvo (px)</label>
          <input 
            type="number" 
            placeholder="Ex: 1080"
            value={settings.boundSize || ''}
            onChange={(e) => onSettingsChange({ ...settings, boundSize: parseInt(e.target.value) || 0 })}
            className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] text-theme-main font-mono outline-none focus:border-theme-accent transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onSettingsChange({ ...settings, boundType: 'max', activeMethod: 'proportional' })}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${settings.boundType === 'max' && settings.activeMethod === 'proportional' ? 'bg-theme-accent/20 border-theme-accent shadow-sm' : 'bg-theme-panel border-theme opacity-60'}`}
          >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${settings.boundType === 'max' && settings.activeMethod === 'proportional' ? 'border-theme-accent bg-theme-accent' : 'border-theme'}`}>
              {settings.boundType === 'max' && settings.activeMethod === 'proportional' && <div className="w-1 h-1 rounded-full bg-white"></div>}
            </div>
            <span className="text-[9px] font-black uppercase">Máximo</span>
          </button>

          <button 
            onClick={() => onSettingsChange({ ...settings, boundType: 'min', activeMethod: 'proportional' })}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${settings.boundType === 'min' && settings.activeMethod === 'proportional' ? 'bg-theme-accent/20 border-theme-accent shadow-sm' : 'bg-theme-panel border-theme opacity-60'}`}
          >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${settings.boundType === 'min' && settings.activeMethod === 'proportional' ? 'border-theme-accent bg-theme-accent' : 'border-theme'}`}>
              {settings.boundType === 'min' && settings.activeMethod === 'proportional' && <div className="w-1 h-1 rounded-full bg-white"></div>}
            </div>
            <span className="text-[9px] font-black uppercase">Mínimo</span>
          </button>
        </div>

        <button 
          onClick={() => setMethod('proportional')}
          className={`w-full py-2.5 rounded-xl font-black text-[9px] border flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 ${settings.activeMethod === 'proportional' ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-panel border-theme text-theme-main'}`}
        >
           <i className="fas fa-compress-arrows-alt"></i> Aplicar Proporcional
        </button>
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
              <span className="text-[10px] font-black uppercase leading-tight">Arquivos Separados</span>
              <span className="text-[8px] opacity-50 uppercase tracking-tighter">Um por um</span>
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
              <span className="text-[8px] opacity-50 uppercase tracking-tighter">Pacote Único</span>
            </div>
          </button>
        </div>
      </div>

      {/* BOX: AÇÃO FINAL */}
      <div className="mt-auto pt-4">
        <button 
          onClick={onSave} 
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
               <i className="fas fa-save"></i> <span>Salvar</span>
             </>
           )}
        </button>
      </div>
    </div>
  );
};

export default SidebarResizer;
