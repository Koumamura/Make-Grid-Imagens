
import React from 'react';
import { GridImage } from '../types';

interface ImageListProps {
  images: GridImage[];
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, onRemove, onMove }) => {
  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
        <i className="fas fa-layer-group text-4xl mb-3"></i>
        <p className="text-[10px] font-black uppercase tracking-widest">Galeria Vazia</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {images.map((img, index) => (
        <div 
          key={img.id} 
          className="group flex items-center gap-2 border p-1.5 rounded-lg transition-all shadow-sm"
          style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-black/10 rounded-md overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold truncate leading-tight" style={{ color: 'var(--text-main)' }}>{img.file.name}</p>
            <p className="text-[9px] font-mono opacity-50" style={{ color: 'var(--text-muted)' }}>{img.width}x{img.height}</p>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onMove(index, 'up')}
              className="p-1.5 transition-colors hover:text-theme-accent"
              style={{ color: 'var(--text-muted)' }}
            >
              <i className="fas fa-chevron-up text-[9px]"></i>
            </button>
            <button 
              onClick={() => onRemove(img.id)}
              className="p-1.5 hover:text-red-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <i className="fas fa-trash-alt text-[9px]"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
