
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-600 text-center opacity-50">
        <i className="fas fa-layer-group text-5xl mb-4"></i>
        <p className="text-sm font-medium">Sua galeria está vazia</p>
        <p className="text-xs mt-1">Carregue imagens para começar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {images.map((img, index) => (
        <div 
          key={img.id} 
          className="group flex items-center gap-3 bg-slate-800/50 border border-slate-800 p-2 rounded-lg hover:border-indigo-500/50 hover:bg-slate-800 transition-all shadow-md"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-slate-900 rounded-md overflow-hidden border border-slate-700">
            <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{img.file.name}</p>
            <p className="text-[10px] text-slate-500 font-mono">{img.width}x{img.height}px</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col">
              <button 
                onClick={() => onMove(index, 'up')}
                disabled={index === 0}
                className={`p-1 text-slate-500 hover:text-indigo-400 transition-colors ${index === 0 ? 'invisible' : ''}`}
              >
                <i className="fas fa-caret-up"></i>
              </button>
              <button 
                onClick={() => onMove(index, 'down')}
                disabled={index === images.length - 1}
                className={`p-1 text-slate-500 hover:text-indigo-400 transition-colors ${index === images.length - 1 ? 'invisible' : ''}`}
              >
                <i className="fas fa-caret-down"></i>
              </button>
            </div>
            <button 
              onClick={() => onRemove(img.id)}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Remover"
            >
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
