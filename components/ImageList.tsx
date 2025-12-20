
import React from 'react';
import { GridImage } from '../types';

interface ImageListProps {
  images: GridImage[];
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleActive: (id: string) => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, onRemove, onMove, onToggleActive }) => {
  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
        <i className="fas fa-layer-group text-4xl mb-3"></i>
        <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Fotos</p>
      </div>
    );
  }

  const activeImages = images.filter(img => img.isActive);
  const inactiveImages = images.filter(img => !img.isActive);

  const renderItem = (img: GridImage, index: number, isInactive: boolean) => (
    <div 
      key={img.id} 
      className={`group flex items-center gap-2 border p-1.5 rounded-lg transition-all shadow-sm ${isInactive ? 'opacity-50 grayscale scale-[0.98]' : ''}`}
      style={{ backgroundColor: 'var(--bg-panel)', borderColor: isInactive ? 'var(--border)' : 'var(--accent)' }}
    >
      <div className="w-10 h-10 flex-shrink-0 bg-black/10 rounded-md overflow-hidden border relative" style={{ borderColor: 'var(--border)' }}>
        <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
        {isInactive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <i className="fas fa-eye-slash text-[8px] text-white"></i>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold truncate leading-tight" style={{ color: 'var(--text-main)' }}>{img.file.name}</p>
        <p className="text-[8px] font-mono opacity-50" style={{ color: 'var(--text-muted)' }}>{img.width}x{img.height}</p>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onToggleActive(img.id)}
          className={`p-1.5 transition-colors ${isInactive ? 'text-green-500' : 'text-amber-500'}`}
          title={isInactive ? "Voltar para Grid" : "Remover da Grid"}
        >
          <i className={`fas ${isInactive ? 'fa-plus-circle' : 'fa-minus-circle'} text-[10px]`}></i>
        </button>
        {!isInactive && (
          <button 
            onClick={() => onMove(index, 'up')}
            className="p-1.5 transition-colors hover:text-theme-accent"
            style={{ color: 'var(--text-muted)' }}
          >
            <i className="fas fa-chevron-up text-[8px]"></i>
          </button>
        )}
        <button 
          onClick={() => onRemove(img.id)}
          className="p-1.5 hover:text-red-500 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <i className="fas fa-trash-alt text-[8px]"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
      {/* SEÇÃO ATIVOS */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Na Grid</span>
          <span className="text-[8px] font-mono opacity-40">{activeImages.length}</span>
        </div>
        {activeImages.length > 0 ? (
          activeImages.map((img, idx) => renderItem(img, idx, false))
        ) : (
          <p className="text-[8px] text-center opacity-20 py-4 uppercase font-bold italic tracking-tighter">Nenhum item ativo</p>
        )}
      </div>

      {/* SEÇÃO REMOVIDOS */}
      <div className="p-3 border-t border-theme/20 bg-black/5 flex-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Banco de Reserva</span>
          <span className="text-[8px] font-mono opacity-40">{inactiveImages.length}</span>
        </div>
        <div className="space-y-2">
          {inactiveImages.map((img, idx) => renderItem(img, idx, true))}
        </div>
      </div>
    </div>
  );
};

export default ImageList;
