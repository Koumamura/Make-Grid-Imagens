
import React, { useState } from 'react';
import { GridImage } from '../types';

interface FramingLayerSidebarProps {
  mainBatch: GridImage[];
  extraLayers: GridImage[];
  currentIndex: number;
  selectedId: string | null;
  onSelectMain: (index: number) => void;
  onSelectExtra: (id: string) => void;
  onUpdateExtra: (id: string, updates: Partial<GridImage>) => void;
  onRemoveExtra: (id: string) => void;
  onReorderMain?: (dragIdx: number, hoverIdx: number) => void;
  onReorderExtra?: (dragIdx: number, hoverIdx: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FramingLayerSidebar: React.FC<FramingLayerSidebarProps> = ({ 
  mainBatch, extraLayers, currentIndex, selectedId, onSelectMain, onSelectExtra, onUpdateExtra, onRemoveExtra, onReorderMain, onReorderExtra, isOpen, onToggle 
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'main' | 'extra' | null>(null);

  const handleDragStart = (type: 'main' | 'extra', idx: number) => {
    setDraggedIdx(idx);
    setDragType(type);
  };

  const handleDragOver = (e: React.DragEvent, type: 'main' | 'extra', idx: number) => {
    e.preventDefault();
    if (dragType !== type || draggedIdx === null || draggedIdx === idx) return;
    setOverIdx(idx);
  };

  const handleDrop = (type: 'main' | 'extra', idx: number) => {
    if (draggedIdx !== null && dragType === type) {
      if (type === 'main' && onReorderMain) onReorderMain(draggedIdx, idx);
      if (type === 'extra' && onReorderExtra) onReorderExtra(draggedIdx, idx);
    }
    setDraggedIdx(null);
    setOverIdx(null);
    setDragType(null);
  };

  return (
    <div className="relative flex h-full">
      <button 
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -left-6 z-50 w-6 h-20 bg-theme-panel border border-theme flex items-center justify-center rounded-l-xl hover:bg-theme-accent transition-all group shadow-[-5px_0_15px_rgba(0,0,0,0.1)]"
      >
        <i className={`fas ${isOpen ? 'fa-chevron-right' : 'fa-layer-group'} text-[10px] transition-transform duration-500 ${isOpen ? 'rotate-0' : 'rotate-12 group-hover:rotate-0'}`}></i>
      </button>

      <aside className={`border-l border-theme bg-theme-side transition-all duration-500 overflow-hidden flex flex-col relative ${isOpen ? 'w-64' : 'w-0'}`}>
        <div className="min-w-[256px] h-full flex flex-col">
          <div className="p-4 border-b border-theme/30 bg-black/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-accent">Gerenciador de Camadas</span>
            <span className="text-[9px] opacity-30 font-mono">{mainBatch.length + extraLayers.length} total</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {/* SEÇÃO LOTE PRINCIPAL */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between opacity-40 px-1">
                <span className="text-[8px] font-black uppercase tracking-widest">Fila do Lote</span>
                <i className="fas fa-images text-[9px]"></i>
              </div>
              <div className="space-y-2">
                {mainBatch.length === 0 ? (
                  <p className="text-[9px] opacity-20 text-center py-4 uppercase">Vazio</p>
                ) : (
                  mainBatch.map((img, idx) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => handleDragStart('main', idx)}
                      onDragOver={(e) => handleDragOver(e, 'main', idx)}
                      onDrop={() => handleDrop('main', idx)}
                      className={`w-full group flex items-center gap-3 p-1.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing relative
                        ${currentIndex === idx && selectedId === 'main' ? 'border-theme-accent bg-theme-accent/5' : 'border-transparent bg-theme-panel/30 hover:bg-theme-panel/50'}
                        ${draggedIdx === idx && dragType === 'main' ? 'opacity-20 scale-95' : ''}
                        ${overIdx === idx && dragType === 'main' ? 'translate-y-2 border-theme-accent' : ''}
                      `}
                      onClick={() => onSelectMain(idx)}
                    >
                      {overIdx === idx && dragType === 'main' && (
                         <div className="absolute -top-1 left-0 right-0 h-0.5 bg-theme-accent shadow-lg z-10" />
                      )}
                      <div className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden border border-theme/30 flex-shrink-0">
                        <img src={img.previewUrl} className="w-full h-full object-cover pointer-events-none" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-[9px] font-black truncate uppercase ${currentIndex === idx && selectedId === 'main' ? 'text-theme-accent' : 'opacity-60'}`}>Item #{idx + 1}</p>
                        <p className="text-[7px] opacity-30 truncate font-mono">{img.file.name}</p>
                      </div>
                      {currentIndex === idx && selectedId === 'main' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-theme-accent mr-2 shadow-[0_0_8px_rgba(79,70,229,1)]"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SEÇÃO EXTRAS */}
            <div className="p-4 space-y-3 border-t border-theme/10 bg-black/5 flex-1">
              <div className="flex items-center justify-between opacity-40 px-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-theme-accent">Elementos Extras</span>
                <i className="fas fa-plus-circle text-[9px]"></i>
              </div>
              <div className="space-y-2">
                {extraLayers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-10">
                    <i className="fas fa-layer-group text-2xl mb-2"></i>
                    <p className="text-[8px] font-black uppercase">Sem extras</p>
                  </div>
                ) : (
                  extraLayers.map((layer, idx) => (
                    <div 
                      key={layer.id}
                      draggable
                      onDragStart={() => handleDragStart('extra', idx)}
                      onDragOver={(e) => handleDragOver(e, 'extra', idx)}
                      onDrop={() => handleDrop('extra', idx)}
                      className={`group flex flex-col gap-2 p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing relative
                        ${selectedId === layer.id ? 'border-theme-accent bg-theme-accent/5 shadow-inner' : 'border-transparent bg-theme-panel/30 hover:border-theme'}
                        ${draggedIdx === idx && dragType === 'extra' ? 'opacity-20 scale-95' : ''}
                        ${overIdx === idx && dragType === 'extra' ? 'translate-y-2 border-theme-accent' : ''}
                      `}
                      onClick={() => onSelectExtra(layer.id)}
                    >
                      {overIdx === idx && dragType === 'extra' && (
                         <div className="absolute -top-1 left-0 right-0 h-0.5 bg-theme-accent shadow-lg z-10" />
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden border border-theme/30 flex-shrink-0">
                          <img src={layer.previewUrl} className="w-full h-full object-cover pointer-events-none" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-[9px] font-black truncate uppercase ${selectedId === layer.id ? 'text-theme-accent' : 'opacity-60'}`}>Extra</p>
                          <p className="text-[7px] opacity-30 truncate font-mono">Layer #{layer.id.slice(0,4)}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRemoveExtra(layer.id); }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-theme-muted hover:text-red-500 transition-all"
                        >
                          <i className="fas fa-trash-alt text-[10px]"></i>
                        </button>
                      </div>
                      
                      {/* CONTROLES DE CAMADA */}
                      <div className="flex gap-1.5 pt-1 border-t border-theme/10 mt-1 pointer-events-auto">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateExtra(layer.id, { visible: layer.visible === false }); }}
                          className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase flex items-center justify-center gap-1.5 transition-all ${layer.visible !== false ? 'bg-theme-accent/20 text-theme-accent' : 'bg-red-500/10 text-red-500 opacity-60'}`}
                          title={layer.visible !== false ? 'Esconder Camada' : 'Mostrar Camada'}
                        >
                          <i className={`fas ${layer.visible !== false ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          <span>{layer.visible !== false ? 'Visível' : 'Oculto'}</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateExtra(layer.id, { aboveFrame: !(layer.aboveFrame ?? true) }); }}
                          className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase flex items-center justify-center gap-1.5 transition-all ${layer.aboveFrame !== false ? 'bg-theme-accent text-white shadow-sm' : 'bg-theme-panel/50 text-theme-muted'}`}
                          title={layer.aboveFrame !== false ? 'Mover para Trás da Moldura' : 'Mover para Frente da Moldura'}
                        >
                          <i className={`fas ${layer.aboveFrame !== false ? 'fa-layer-group' : 'fa-level-down-alt'}`}></i>
                          <span>{layer.aboveFrame !== false ? 'Sobre Moldura' : 'Abaixo Moldura'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default FramingLayerSidebar;
