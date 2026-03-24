
import React from 'react';
import { GridSettings, GridImage, ImageAlignment } from '../types';
import MiauSlider from './MiauSlider';

interface SidebarProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  onAddMaker: () => void;
  images: GridImage[];
  onUpdateActiveCount: (count: number) => void;
  exportOptions: {
    downloadIndividual: boolean;
    setDownloadIndividual: (v: boolean) => void;
    downloadZip: boolean;
    setDownloadZip: (v: boolean) => void;
  };
  onExport: () => void;
  isProcessing?: boolean;
}

const ALIGNMENT_OPTIONS: { id: ImageAlignment; label: string }[] = [
  { id: 'top-left', label: 'Canto Superior Esquerdo' },
  { id: 'top-center', label: 'Topo Central' },
  { id: 'top-right', label: 'Canto Superior Direito' },
  { id: 'middle-left', label: 'Centro Esquerda' },
  { id: 'center', label: 'Centro Total' },
  { id: 'middle-right', label: 'Centro Direita' },
  { id: 'bottom-left', label: 'Canto Inferior Esquerdo' },
  { id: 'bottom-center', label: 'Base Central' },
  { id: 'bottom-right', label: 'Canto Inferior Direito' },
];

const Sidebar: React.FC<SidebarProps> = ({ settings, onSettingsChange, onAddFile, onAddFolder, onAddMaker, images, onUpdateActiveCount, exportOptions, onExport, isProcessing = false }) => {
  const handleChange = (key: keyof GridSettings, value: any) => { 
    onSettingsChange({ ...settings, [key]: value }); 
  };

  const handleBackgroundChange = (color: string, transparent: boolean) => {
    onSettingsChange({
      ...settings,
      backgroundColor: color,
      isTransparent: transparent
    });
  };

  const activeCount = images.filter(img => img.isActive).length;
  const isAuto = settings.layoutMode === 'auto';
  const isMaker = settings.makerMode;

  return (
    <>
      <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Entrada de Mídia</h3>
        <div className="space-y-2">
          <button 
            onClick={onAddMaker} 
            className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-black text-[11px] transition-all active:scale-95 shadow-xl relative group overflow-hidden uppercase tracking-widest border-2 ${isMaker ? 'bg-theme-main border-theme-accent text-theme-accent' : 'bg-gradient-to-r from-theme-accent via-indigo-600 to-theme-accent border-transparent text-white'}`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className={`fas ${isMaker ? 'fa-magic animate-pulse' : 'fa-th-large'} z-10 text-[13px]`}></i> 
            <span className="z-10">{isMaker ? 'Maker Ativo' : 'Grid Maker Pro'}</span>
            {!isMaker && <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 animate-[shimmer_2s_infinite]"></div>}
          </button>

          <button onClick={onAddFile} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] transition-all active:scale-95 border border-theme bg-theme-panel text-theme-main opacity-80 hover:opacity-100 hover:bg-black/10">
            <i className="fas fa-plus-circle"></i> <span>Adicionar Fotos</span>
          </button>
          <button onClick={onAddFolder} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-[9px] border border-theme bg-theme-panel text-theme-muted opacity-50 hover:opacity-100 transition-all">
            <i className="fas fa-folder"></i> <span>Pasta Completa</span>
          </button>
        </div>

        {isMaker && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-3 rounded-xl bg-theme-accent/5 border border-theme-accent/20">
              <MiauSlider label="Repetir Imagem" min={1} max={500} value={settings.makerRepeat || 1} onChange={(v) => handleChange('makerRepeat', v)} icon="fa-redo-alt" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <div className="flex items-center justify-between border-b border-theme pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Layout & Ancoragem</h3>
          {(isAuto || isMaker) && <i className="fas fa-robot text-theme-accent text-[10px]"></i>}
        </div>
        
        {/* MATRIZ DE ANCORAGEM REFINADA */}
        <div className="flex flex-col items-center gap-3 py-2">
          <label className="text-[8px] font-black uppercase opacity-50 block tracking-widest w-full text-center">Ponto de Alinhamento</label>
          <div className="grid grid-cols-3 gap-2 bg-black/20 p-3 rounded-2xl border border-theme/40 relative">
            {ALIGNMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChange('alignment', opt.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative group
                  ${settings.alignment === opt.id 
                    ? 'bg-theme-accent text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-110 z-10' 
                    : 'bg-theme-panel/50 border border-theme/20 hover:border-theme-accent/50'
                }`}
                title={opt.label}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${settings.alignment === opt.id ? 'bg-white scale-125' : 'bg-theme-muted opacity-30 group-hover:opacity-100'}`}></div>
                {settings.alignment === opt.id && <div className="absolute inset-0 rounded-lg animate-ping bg-theme-accent/20"></div>}
              </button>
            ))}
          </div>
          <span className="text-[7px] font-black uppercase opacity-30 tracking-tighter">{settings.alignment.replace('-', ' ')}</span>
        </div>

        <div className="flex p-1 bg-theme-panel/50 rounded-xl border border-theme">
          <button onClick={() => handleChange('layoutMode', 'grid')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!isAuto ? 'bg-theme-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}>Manual</button>
          <button onClick={() => handleChange('layoutMode', 'auto')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${isAuto ? 'bg-theme-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}>Auto-Flow</button>
        </div>
        
        <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
          <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${settings.forceOriginalSize ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
            {settings.forceOriginalSize && <i className="fas fa-check text-[8px] text-white"></i>}
            <input type="checkbox" className="hidden" checked={settings.forceOriginalSize} onChange={e => handleChange('forceOriginalSize', e.target.checked)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Forçar Tamanho Real</span>
            <span className="text-[8px] opacity-40 uppercase">Ignora Redimensionamento</span>
          </div>
        </label>

        {isAuto && !isMaker && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <MiauSlider label="Itens na Grid" min={1} max={images.length || 1} value={activeCount} onChange={onUpdateActiveCount} icon="fa-layer-group" />
            <div className="space-y-2">
              <label className="text-[9px] font-bold opacity-60 uppercase tracking-wide px-1">Formato do Conjunto</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[{ id: 'square', label: '1:1', icon: 'fa-square' }, { id: 'portrait', label: '3:4', icon: 'fa-columns' }, { id: 'landscape', label: '4:3', icon: 'fa-grip-horizontal' }].map(shape => (
                  <button key={shape.id} onClick={() => handleChange('targetShape', shape.id)} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${settings.targetShape === shape.id ? 'bg-theme-accent border-theme-accent text-white shadow-lg' : 'bg-theme-panel/50 border-theme opacity-50 hover:opacity-100'}`}>
                    <i className={`fas ${shape.icon} text-[10px]`}></i>
                    <span className="text-[7px] font-black uppercase">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Dimensões & Escala</h3>
        <div className={`grid grid-cols-2 gap-3 transition-all ${isAuto && !isMaker ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase block">Largura</label>
            <input type="number" value={settings.canvasWidth} onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)} className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold opacity-50 uppercase block">Altura</label>
            <input type="number" value={settings.canvasHeight} onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)} className="w-full bg-theme-panel border border-theme rounded p-2 text-[10px] outline-none font-mono" />
          </div>
        </div>
        <div className="space-y-4">
          <MiauSlider label="Espaçamento Vertical" min={-500} max={500} value={settings.verticalSpacing || 0} onChange={(v) => handleChange('verticalSpacing', v)} icon="fa-arrows-alt-v" />
          <MiauSlider label="Colunas" min={1} max={12} value={settings.columns} onChange={(v) => handleChange('columns', v)} icon="fa-grip-vertical" />
          <MiauSlider label="Espaçamento Horizontal" min={-500} max={500} value={settings.innerSpacing} onChange={(v) => handleChange('innerSpacing', v)} icon="fa-arrows-alt-h" />
          <MiauSlider 
            label={settings.showCuttingGuides ? "Margem p/ Corte" : "Margem Externa"} 
            min={0} max={500} 
            value={settings.outerMargin} 
            onChange={(v) => handleChange('outerMargin', v)} 
            icon="fa-border-outer" 
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5 animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-center justify-between border-b border-theme pb-2">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-theme-accent">Utilitários de Impressão</h3>
           <i className="fas fa-print opacity-30 text-[9px]"></i>
        </div>
        
        <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
          <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${settings.showCuttingGuides ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
            {settings.showCuttingGuides && <i className="fas fa-check text-[8px] text-white"></i>}
            <input type="checkbox" className="hidden" checked={settings.showCuttingGuides} onChange={e => handleChange('showCuttingGuides', e.target.checked)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight text-theme-main">Guias de Corte</span>
            <span className="text-[8px] opacity-40 uppercase">Marcas de Registro</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-theme bg-theme-panel/50 cursor-pointer group transition-all hover:bg-theme-accent/5">
          <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-all ${settings.showSilhouetteMarks ? 'bg-theme-accent border-theme-accent' : 'bg-transparent'}`}>
            {settings.showSilhouetteMarks && <i className="fas fa-check text-[8px] text-white"></i>}
            <input type="checkbox" className="hidden" checked={settings.showSilhouetteMarks} onChange={e => handleChange('showSilhouetteMarks', e.target.checked)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight text-theme-accent">Silhouette (Print & Cut)</span>
            <span className="text-[8px] opacity-40 uppercase">Marcas de Registro Oficiais</span>
          </div>
        </label>

        <div className={`space-y-4 transition-all duration-300 ${(!settings.showCuttingGuides && !settings.showSilhouetteMarks) ? 'opacity-10 grayscale pointer-events-none' : 'opacity-100'}`}>
          <MiauSlider label="Recuo (Margem Papel)" min={0} max={200} value={settings.guideOffset || 0} onChange={(v) => handleChange('guideOffset', v)} icon="fa-arrows-alt" />
          <MiauSlider label="Comprimento Marca" min={10} max={200} value={settings.guideLength || 30} onChange={(v) => handleChange('guideLength', v)} icon="fa-ruler-horizontal" />
          <MiauSlider label="Grossura da Linha" min={1} max={30} value={settings.guideThickness || 2} onChange={(v) => handleChange('guideThickness', v)} unit="px" icon="fa-pen-nib" />
          <div className="flex items-center justify-between p-3 rounded-xl border border-theme bg-theme-panel/50">
            <label className="text-[9px] font-bold opacity-60 uppercase">Cor da Guia</label>
            <input type="color" value={settings.guideColor || '#4f46e5'} onChange={(e) => handleChange('guideColor', e.target.value)} className="w-8 h-8 rounded-lg border border-theme cursor-pointer bg-theme-panel p-0.5" />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 text-theme-accent">Estética do Fundo</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleBackgroundChange(settings.backgroundColor, !settings.isTransparent)} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-[9px] font-black transition-all ${settings.isTransparent ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-panel border-theme opacity-60'}`}
          >
            <i className={`fas ${settings.isTransparent ? 'fa-check-circle' : 'fa-circle-notch'}`}></i>
            <span>Transparência</span>
          </button>
          
          <div className="relative group">
            <input 
              type="color" 
              value={settings.backgroundColor} 
              onChange={(e) => handleBackgroundChange(e.target.value, false)} 
              className={`w-12 h-12 rounded-xl cursor-pointer border p-1 bg-theme-panel transition-all ${settings.isTransparent ? 'border-theme opacity-20' : 'border-theme-accent shadow-[0_0_15px_rgba(79,70,229,0.2)]'}`} 
            />
            {!settings.isTransparent && <div className="absolute -top-1 -right-1 w-3 h-3 bg-theme-accent rounded-full border-2 border-theme-side"></div>}
          </div>
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 bg-theme-side p-5 pt-4 border-t border-theme z-20 mt-auto">
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Exportação</h3>
        <div className="space-y-1 mb-3">
          <label className="text-[8px] font-black uppercase opacity-40 ml-1">Nome do Arquivo</label>
          <input 
            type="text" 
            placeholder="Ex: grid_final"
            value={settings.exportFilename || ''}
            onChange={(e) => handleChange('exportFilename', e.target.value)}
            className="w-full bg-theme-panel border border-theme rounded-xl p-2.5 text-[10px] outline-none font-bold focus:border-theme-accent transition-colors"
          />
        </div>

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

      <button 
        disabled={images.length === 0 || isProcessing} 
        onClick={onExport} 
        className={`w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl font-black text-[11px] transition-all active:scale-95 shadow-2xl disabled:opacity-30 uppercase tracking-widest relative group overflow-hidden mt-4 ${isProcessing ? 'bg-theme-panel text-theme-accent' : 'bg-theme-accent text-theme-inv'}`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isProcessing ? (
          <><i className="fas fa-spinner animate-spin"></i> <span>Processando...</span></>
        ) : (
          <><i className="fas fa-file-export z-10"></i> <span className="z-10">Exportar e Baixar</span></>
        )}
      </button>
    </div>
    </>
  );
};

export default Sidebar;
