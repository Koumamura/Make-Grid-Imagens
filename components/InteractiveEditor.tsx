
import React, { useState, useRef, useEffect } from 'react';
import { GridImage, FrameSettings } from '../types';

interface InteractiveEditorProps {
  mainImage: (GridImage & { x: number, y: number, scale: number, rotation: number }) | null;
  loteImages: GridImage[];
  frameSettings: FrameSettings;
  onUpdateImage: (id: string, updates: Partial<GridImage>) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  zoom?: number;
}

const InteractiveEditor: React.FC<InteractiveEditorProps> = ({ 
  mainImage,
  loteImages, 
  frameSettings, 
  onUpdateImage,
  selectedId,
  onSelect,
  zoom = 0.4
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    e.stopPropagation(); // Impede que o clique chegue ao fundo (que desseleciona)
    onSelect(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: x, y: y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !selectedId) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    onUpdateImage(selectedId, {
      x: initialPos.x + (dx / zoom),
      y: initialPos.y + (dy / zoom)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedId, dragStart, initialPos, zoom]);

  return (
    <div 
      ref={containerRef}
      className="relative shadow-2xl overflow-hidden border border-theme bg-theme-panel transition-all duration-300"
      style={{ 
        width: frameSettings.canvasWidth * zoom, 
        height: frameSettings.canvasHeight * zoom,
        minWidth: frameSettings.canvasWidth * zoom,
        minHeight: frameSettings.canvasHeight * zoom,
        backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)',
        backgroundSize: '20px 20px'
      }}
      onMouseDown={() => onSelect(null)} // Clicar no fundo limpo desseleciona
    >
      {/* Camada 1: Imagem Principal do Lote */}
      {mainImage && (
        <div
          className={`absolute cursor-move transition-shadow ${selectedId === 'main' ? 'ring-2 ring-theme-accent shadow-2xl z-30' : 'z-10'}`}
          style={{
            left: mainImage.x * zoom,
            top: mainImage.y * zoom,
            width: (mainImage.width * mainImage.scale) * zoom,
            transform: `rotate(${mainImage.rotation}deg)`,
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'main', mainImage.x, mainImage.y)}
        >
          <img src={mainImage.previewUrl} className="w-full h-auto pointer-events-none select-none" />
          {selectedId === 'main' && (
             <div className="absolute inset-0 border border-theme-accent/50 pointer-events-none"></div>
          )}
        </div>
      )}

      {/* Camada 2: Elementos Extras */}
      {loteImages.map((img, idx) => (
        <div
          key={img.id}
          className={`absolute cursor-move transition-all ${selectedId === img.id ? 'ring-2 ring-theme-accent shadow-2xl z-40' : 'z-20'}`}
          style={{
            left: (img.x || 0) * zoom,
            top: (img.y || 0) * zoom,
            width: (img.width * (img.scale || 1)) * zoom,
            transform: `rotate(${img.rotation || 0}deg)`,
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => handleMouseDown(e, img.id, img.x || 0, img.y || 0)}
        >
          <img src={img.previewUrl} className="w-full h-auto pointer-events-none select-none" />
          {selectedId === img.id && (
             <div className="absolute inset-0 border border-theme-accent/50 pointer-events-none"></div>
          )}
        </div>
      ))}

      {/* Camada 3: Moldura (Sempre no Topo) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[100]"
        style={{
          border: frameSettings.frameImageUrl ? 'none' : `${frameSettings.borderWidth * zoom}px solid ${frameSettings.borderColor}`,
          borderRadius: `${frameSettings.borderRadius * zoom}px`,
          boxShadow: `inset 0 0 ${frameSettings.shadow * zoom}px rgba(0,0,0,0.2)`
        }}
      >
        {frameSettings.frameImageUrl && (
          <img src={frameSettings.frameImageUrl} className="w-full h-full object-fill" />
        )}
      </div>
    </div>
  );
};

export default InteractiveEditor;
