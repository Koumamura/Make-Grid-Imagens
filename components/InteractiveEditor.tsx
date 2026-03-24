
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GridImage, FrameSettings } from '../types';

interface InteractiveEditorProps {
  mainImage: (GridImage & { x: number, y: number, scale: number, rotation: number }) | null;
  loteImages: GridImage[];
  frameSettings: FrameSettings;
  onUpdateImage: (id: string, updates: Partial<GridImage>) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  zoom?: number;
  offset: { x: number, y: number };
  onOffsetChange: (offset: { x: number, y: number }) => void;
  hideLimbo?: boolean;
}

const InteractiveEditor: React.FC<InteractiveEditorProps> = ({ 
  mainImage, loteImages, frameSettings, onUpdateImage, selectedId, onSelect, zoom = 0.4, offset, onOffsetChange, hideLimbo = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  
  const dragInfo = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, id: '', animationFrameId: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    if (e.button === 0) { // Botão Esquerdo: Mover Camada
      e.stopPropagation();
      onSelect(id);
      setIsDragging(true);
      dragInfo.current = { startX: e.clientX, startY: e.clientY, initialPosX: x, initialPosY: y, id: id, animationFrameId: 0 };
    }
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Botão do Meio: PAN do visualizador
      e.preventDefault();
      setIsPanning(true);
    } else if (e.button === 0) {
      onSelect(null);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      onOffsetChange({ x: offset.x + e.movementX, y: offset.y + e.movementY });
      return;
    }

    if (!isDragging || !selectedId) return;
    if (dragInfo.current.animationFrameId) cancelAnimationFrame(dragInfo.current.animationFrameId);

    dragInfo.current.animationFrameId = requestAnimationFrame(() => {
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;
      onUpdateImage(dragInfo.current.id, {
        x: dragInfo.current.initialPosX + (dx / zoom),
        y: dragInfo.current.initialPosY + (dy / zoom)
      });
    });
  }, [isDragging, isPanning, selectedId, zoom, onUpdateImage, offset, onOffsetChange]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 1) setIsPanning(false);
    if (e.button === 0) {
      if (dragInfo.current.animationFrameId) cancelAnimationFrame(dragInfo.current.animationFrameId);
      setIsDragging(false);
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!selectedId) return;
    e.preventDefault();
    const element = selectedId === 'main' ? mainImage : loteImages.find(img => img.id === selectedId);
    if (element) {
      const delta = e.deltaY > 0 ? -0.02 : 0.02;
      const currentScale = (element as any).scale || 1;
      const newScale = Math.max(0.01, Math.min(10, currentScale + delta));
      onUpdateImage(selectedId, { scale: newScale });
    }
  }, [selectedId, mainImage, loteImages, onUpdateImage]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (container) container.removeEventListener('wheel', handleWheel); };
  }, [handleWheel]);

  const SelectionOverlay = ({ isActive }: { isActive: boolean }) => (
    isActive ? (<div className="absolute inset-[-2px] border-2 border-dashed border-theme-accent rounded-none shadow-[0_0_15px_rgba(79,70,229,0.3)] z-[100] pointer-events-none"></div>) : null
  );

  const renderExtra = (img: GridImage, isAbove: boolean) => {
    if (img.visible === false) return null;
    if ((img.aboveFrame !== false) !== isAbove) return null;
    return (
      <div
        key={img.id}
        className={`absolute cursor-move transition-opacity duration-300 ${selectedId === img.id ? 'z-[45] opacity-100' : (isAbove ? 'z-[35]' : 'z-[18]')} opacity-70`}
        style={{ left: (img.x || 0) * zoom, top: (img.y || 0) * zoom, width: (img.width * (img.scale || 1)) * zoom, transform: `rotate(${img.rotation || 0}deg)`, pointerEvents: 'auto', willChange: 'transform, left, top' }}
        onMouseDown={(e) => handleMouseDown(e, img.id, img.x || 0, img.y || 0)}
      >
        <img src={img.previewUrl} className="w-full h-auto pointer-events-none select-none" />
        <SelectionOverlay isActive={selectedId === img.id} />
      </div>
    );
  };

  return (
    <div className={`w-full h-full flex items-center justify-center overflow-hidden bg-transparent select-none outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`} onMouseDown={handleContainerMouseDown}>
      <div 
        ref={containerRef}
        className="relative shadow-2xl border border-white/10 bg-theme-panel transition-all duration-75 ease-out"
        style={{ 
          width: frameSettings.canvasWidth * zoom, height: frameSettings.canvasHeight * zoom,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)',
          backgroundSize: '20px 20px',
        }}
      >
        {!hideLimbo && (
          <div className="absolute inset-[-5000px] pointer-events-none z-[50] bg-black/85" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 5000px 5000px, calc(100% - 5000px) 5000px, calc(100% - 5000px) calc(100% - 5000px), 5000px calc(100% - 5000px), 5000px 5000px)' }}></div>
        )}
        <div className="absolute inset-0 border border-theme-accent/40 border-dashed pointer-events-none z-[60]"></div>
        {mainImage && mainImage.visible !== false && (
          <div className={`absolute cursor-move transition-opacity duration-300 ${selectedId === 'main' ? 'z-[15] opacity-100' : 'z-[10] opacity-70'}`} style={{ left: mainImage.x * zoom, top: mainImage.y * zoom, width: (mainImage.width * mainImage.scale) * zoom, transform: `rotate(${mainImage.rotation}deg)`, pointerEvents: 'auto', willChange: 'transform, left, top' }} onMouseDown={(e) => handleMouseDown(e, 'main', mainImage.x, mainImage.y)}>
            <img src={mainImage.previewUrl} className="w-full h-auto pointer-events-none select-none" />
            <SelectionOverlay isActive={selectedId === 'main'} />
          </div>
        )}
        {loteImages.map(img => renderExtra(img, false))}
        <div className="absolute inset-0 pointer-events-none z-[25] transition-all duration-300" style={{ border: frameSettings.frameImageUrl ? 'none' : `${frameSettings.borderWidth * zoom}px solid ${frameSettings.borderColor}`, borderRadius: `${frameSettings.borderRadius * zoom}px`, boxShadow: `inset 0 0 ${frameSettings.shadow * zoom}px rgba(0,0,0,0.2)` }}>
          {frameSettings.frameImageUrl && <img src={frameSettings.frameImageUrl} className="w-full h-full object-fill" />}
        </div>
        {loteImages.map(img => renderExtra(img, true))}
      </div>
    </div>
  );
};

export default InteractiveEditor;
