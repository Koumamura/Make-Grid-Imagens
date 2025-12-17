
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center">
        <i className="fas fa-images text-4xl mb-4 opacity-20"></i>
        <p className="text-sm">Nenhuma imagem adicionada ainda.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {images.map((img, index) => (
        <div 
          key={img.id} 
          className="group flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-slate-200 rounded overflow-hidden">
            <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{img.file.name}</p>
            <p className="text-[10px] text-slate-400">{img.width}x{img.height} px</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => onMove(index, 'up')}
                disabled={index === 0}
                className={`p-1 text-slate-400 hover:text-indigo-600 transition-colors ${index === 0 ? 'invisible' : ''}`}
                title="Mover para cima"
              >
                <i className="fas fa-chevron-up text-[10px]"></i>
              </button>
              <button 
                onClick={() => onMove(index, 'down')}
                disabled={index === images.length - 1}
                className={`p-1 text-slate-400 hover:text-indigo-600 transition-colors ${index === images.length - 1 ? 'invisible' : ''}`}
                title="Mover para baixo"
              >
                <i className="fas fa-chevron-down text-[10px]"></i>
              </button>
            </div>
            <button 
              onClick={() => onRemove(img.id)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Remover"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
