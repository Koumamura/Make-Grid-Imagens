
import React, { useState } from 'react';
import { GridImage } from '../types';

interface ImageListProps {
  images: GridImage[];
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleActive: (id: string) => void;
  onReorder?: (dragIndex: number, hoverIndex: number) => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, onRemove, onMove, onToggleActive, onReorder }) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
        <i className="fas fa-layer-group text-4xl mb-3"></i>
        <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Fotos</p>
      </div>
    );
  }

  // Lógica de Drag and Drop Nativa
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx !== null && onReorder) {
      onReorder(draggedIdx, idx);
    }
    setDraggedIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setOverIdx(null);
  };

  const renderItem = (img: GridImage, index: number, isInactive: boolean) => {
    const isDragging = draggedIdx === index;
    const isOver = overIdx === index;

    return (
      <div 
        key={img.id}
        draggable={!isInactive}
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={() => handleDrop(index)}
        onDragEnd={handleDragEnd}
        className={`group flex items-center gap-2 border p-1.5 rounded-lg transition-all shadow-sm cursor-grab active:cursor-grabbing relative
          ${isInactive ? 'opacity-40 grayscale scale-[0.98]' : 'hover:border-theme-accent bg-theme-panel/20'}
          ${isDragging ? 'opacity-20 scale-95 border-theme-accent ring-2 ring-theme-accent/20' : ''}
          ${isOver ? 'translate-y-2 border-theme-accent' : ''}
        `}
        style={{ 
          borderColor: isInactive ? 'var(--border)' : (isOver ? 'var(--accent)' : 'var(--border)'),
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease'
        }}
      >
        {/* Placeholder visual de inserção */}
        {isOver && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-theme-accent shadow-[0_0_8px_rgba(79,70,229,0.8)] animate-pulse rounded-full z-10" />
        )}

        <div className="w-10 h-10 flex-shrink-0 bg-black/10 rounded-md overflow-hidden border relative" style={{ borderColor: 'var(--border)' }}>
          <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover pointer-events-none" />
          <div className="absolute top-0 left-0 bg-black/40 px-1 py-0.5 text-[6px] text-white font-black rounded-br-md">
            #{index + 1}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 pointer-events-none">
          <p className="text-[9px] font-bold truncate leading-tight text-theme-main">{img.file.name}</p>
          <p className="text-[8px] font-mono opacity-50 text-theme-muted">{img.width}x{img.height}</p>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onToggleActive(img.id)}
            className={`p-1.5 transition-colors ${isInactive ? 'text-green-500' : 'text-amber-500'}`}
            title={isInactive ? "Ativar" : "Desativar"}
          >
            <i className={`fas ${isInactive ? 'fa-plus-circle' : 'fa-minus-circle'} text-[10px]`}></i>
          </button>
          <button 
            onClick={() => onRemove(img.id)}
            className="p-1.5 hover:text-red-500 transition-colors text-theme-muted"
            title="Remover"
          >
            <i className="fas fa-trash-alt text-[8px]"></i>
          </button>
          <div className="p-1.5 text-theme-muted opacity-30 group-hover:opacity-100 transition-opacity">
            <i className="fas fa-grip-lines text-[10px]"></i>
          </div>
        </div>
      </div>
    );
  };

  const activeImages = images.filter(img => img.isActive);
  const inactiveImages = images.filter(img => !img.isActive);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-2">
            <i className="fas fa-sort text-[8px] text-theme-accent opacity-60"></i>
            <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Ativas no Projeto</span>
          </div>
          <span className="text-[8px] font-mono opacity-40">{activeImages.length}</span>
        </div>
        {images.map((img, idx) => img.isActive && renderItem(img, idx, false))}
      </div>

      {inactiveImages.length > 0 && (
        <div className="p-3 border-t border-theme/20 bg-black/5 flex-1">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Reserva</span>
            <span className="text-[8px] font-mono opacity-40">{inactiveImages.length}</span>
          </div>
          <div className="space-y-2">
            {images.map((img, idx) => !img.isActive && renderItem(img, idx, true))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageList;
