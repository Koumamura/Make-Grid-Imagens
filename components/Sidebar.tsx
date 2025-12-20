
import React from 'react';
import { GridSettings, GridImage } from '../types';

interface SidebarProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  images: GridImage[];
  onUpdateActiveCount: (count: number) => void;
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
  onUpdateActiveCount,
  exportOptions,
  onExport
}) => {
  const handleChange = (key: keyof GridSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const activeCount = images.filter(img => img.isActive).length;

  const isAuto = settings.layoutMode === 'auto';

  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto scrollbar-hide flex flex-col">
      {/* BOX: CONTEÚDO */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Entrada de Mídia</h3>
        <div className="space-y-2">
          <button 
            onClick={onAddFile}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-[10px] transition-all active:scale-95 shadow-lg hover:opacity-90 relative group overflow-hidden uppercase bg-theme-accent text-theme-inv"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className="fas fa-plus-circle z-10"></i> <span className="z-10">Adicionar Fotos</span>
          </button>
          <button 
            onClick={onAddFolder}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-[9px] border transition-all active:scale-95 shadow-sm hover:bg-black/10 relative group overflow-hidden uppercase border-theme bg-theme-panel text-theme-main"
          >
            <i className="fas fa-folder z-10"></i> <span className="z-10">Pasta Completa</span>
          </button>
        </div>
      </div>

      {/* BOX: INTELIGÊNCIA DE LAYOUT */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <div className="flex items-center justify-between border-b border-theme pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Organização</h3>
          {isAuto && <i className="fas fa-robot text-theme-accent text-[10px]"></i>}
        </div>
        
        <div className="flex p-1 bg-theme-panel/50 rounded-xl border border-theme">
          <button 
            onClick={() => handleChange('layoutMode', 'grid')}
            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!isAuto ? 'bg-theme-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
          >
            Manual
          </button>
          <button 
            onClick={() => handleChange('layoutMode', 'auto')}
            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${isAuto ? 'bg-theme-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
          >
            Auto-Flow
          </button>
        </div>
        
        {isAuto && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
             <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-bold opacity-60 uppercase tracking-wide">Itens na Grid</label>
                <span className="text-[9px] font-black text-theme-accent">{activeCount} / {images.length}</span>
              </div>
              <input 
                type="range" 
                min="1" max={images.length || 1} 
                value={activeCount} 
                onChange={(e) => onUpdateActiveCount(parseInt(e.target.value))}
                className="w-full h-1 bg-theme-panel rounded-lg appearance-none cursor-pointer accent-theme-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold opacity-60 uppercase tracking-wide px-1">Formato do Conjunto</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'square', label: '1:1', icon: 'fa-square' },
                  { id: 'portrait', label: '3:4', icon: 'fa-columns' },
                  { id: 'landscape', label: '4:3', icon: 'fa-grip-horizontal' },
                ].map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => handleChange('targetShape', shape.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${settings.targetShape === shape.id ? 'bg-theme-accent border-theme-accent text-white shadow-lg' : 'bg-theme-panel/50 border-theme opacity-50 hover:opacity-100'}`}
                  >
                    <i className={`fas ${shape.icon} text-[10px]`}></i>
                    <span className="text-[7px] font-black uppercase">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOX: DIMENSÕES & ESPAÇAMENTO */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Dimensões & Escala</h3>
        
        <div className={`grid grid-cols-2 gap-3 transition-all ${isAuto ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
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

        <div className="space-y-5">
           <div className="space-y-3 pt-2 border-t border-theme/20">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-bold opacity-60 uppercase tracking-wide">Sizer (Zoom Elementos)</label>
                <span className="text-[9px] font-black text-theme-accent">{settings.itemScale || 0}%</span>
              </div>
              <input 
                type="range" 
                min="-50" max="50" 
                value={settings.itemScale || 0} 
                onChange={(e) => handleChange('itemScale', parseInt(e.target.value))}
                className="w-full h-1 bg-theme-panel rounded-lg appearance-none cursor-pointer accent-theme-accent"
              />
            </div>

          {[
            { label: 'Colunas', key: 'columns', min: 1, max: 12, hideOnAuto: true },
            { label: 'Espaçamento', key: 'innerSpacing', min: 0, max: 200 },
            { label: 'Margem Externa', key: 'outerMargin', min: 0, max: 200 }
          ].map((item) => (
            <div key={item.key} className={`space-y-2 transition-all ${(item.hideOnAuto && isAuto) ? 'hidden' : ''}`}>
              <div className="flex justify-between items-center px-1">
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
      </div>

      {/* BOX: APARÊNCIA */}
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Estética do Fundo</h3>
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
              className="w-10 h-10 bg-theme-panel rounded-xl cursor-pointer border border-theme p-1"
            />
        </div>
      </div>

      {/* BOTÃO FINAL: EXPORTAR */}
      <div className="mt-auto pt-4">
        <button 
          disabled={images.length === 0}
          onClick={onExport}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl font-black text-[11px] transition-all active:scale-95 shadow-2xl disabled:opacity-30 uppercase tracking-widest bg-theme-accent text-theme-inv relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-file-export z-10"></i> <span className="z-10">Exportar Resultado</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
