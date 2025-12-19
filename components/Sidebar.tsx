
import React from 'react';
import { GridSettings, GridImage } from '../types';

interface SidebarProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  images: GridImage[];
  exportOptions: {
    downloadIndividual: boolean;
    setDownloadIndividual: (v: boolean) => void;
    downloadZip: boolean;
    setDownloadZip: (v: boolean) => void;
  };
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  settings, 
  onSettingsChange, 
  onAddFile, 
  onAddFolder, 
  images,
  exportOptions,
  onExport
}) => {
  const handleChange = (key: keyof GridSettings, value: any) => {
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
      {/* BOX: CONTEÚDO */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Conteúdo</h3>
        <div className="space-y-2">
          <button 
            onClick={onAddFile}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-[10px] transition-all active:scale-95 shadow-lg hover:opacity-90 relative group overflow-hidden uppercase bg-theme-accent text-theme-inv"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className="fas fa-plus-circle z-10"></i> <span className="z-10">Arquivos</span>
          </button>
          <button 
            onClick={onAddFolder}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-[9px] border transition-all active:scale-95 shadow-sm hover:bg-black/10 relative group overflow-hidden uppercase border-theme bg-theme-panel text-theme-main"
          >
            <i className="fas fa-folder z-10"></i> <span className="z-10">Importar Pasta</span>
          </button>
        </div>
      </div>

      {/* BOX: CONFIGURAÇÃO DA GRID */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Configuração da Grid</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase block">Largura (px)</label>
            <input 
              type="number" 
              value={settings.canvasWidth} 
              onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase block">Altura (px)</label>
            <input 
              type="number" 
              value={settings.canvasHeight} 
              onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)}
              className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono"
            />
          </div>
        </div>

        {[
          { label: 'Colunas', key: 'columns', min: 1, max: 12 },
          { label: 'Espaçamento', key: 'innerSpacing', min: 0, max: 100 },
          { label: 'Margem Externa', key: 'outerMargin', min: 0, max: 200 }
        ].map((item) => (
          <div key={item.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold opacity-60 uppercase tracking-wide">{item.label}</label>
              <span className="text-[9px] font-black text-theme-accent">{(settings as any)[item.key]}</span>
            </div>
            <input 
              type="range" 
              min={item.min} max={item.max} 
              value={(settings as any)[item.key]} 
              onChange={(e) => handleChange(item.key as any, parseInt(e.target.value))}
              className="w-full h-1 bg-theme-panel rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
            />
          </div>
        ))}
      </div>

      {/* BOX: APARÊNCIA */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Aparência</h3>
        <div className="flex items-center gap-2">
           <button 
              onClick={() => handleChange('isTransparent', !settings.isTransparent)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[9px] font-black transition-all ${settings.isTransparent ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-panel border-theme opacity-60'}`}
           >
              <i className={`fas ${settings.isTransparent ? 'fa-check-circle' : 'fa-circle-notch'}`}></i>
              <span>Transparência</span>
           </button>
           <input 
              type="color" 
              value={settings.backgroundColor} 
              onChange={(e) => {
                handleChange('backgroundColor', e.target.value);
                handleChange('isTransparent', false);
              }}
              className="w-10 h-10 bg-theme-panel rounded-xl cursor-pointer border border-theme p-1 transition-transform active:scale-90"
            />
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
              <span className="text-[10px] font-black uppercase leading-tight">Arquivos Separados</span>
              <span className="text-[8px] opacity-50 uppercase tracking-tighter">Download Direto</span>
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

      {/* BOTÃO FINAL: SALVAR */}
      <div className="mt-auto pt-4">
        <button 
          disabled={images.length === 0}
          onClick={onExport}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl font-black text-[11px] transition-all active:scale-95 shadow-2xl disabled:opacity-30 uppercase tracking-widest bg-theme-accent text-theme-inv relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-file-export z-10"></i> <span className="z-10">Salvar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
