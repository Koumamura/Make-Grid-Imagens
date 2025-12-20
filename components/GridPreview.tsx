
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GridImage, GridSettings } from '../types';

interface GridPreviewProps {
  images: GridImage[];
  settings: GridSettings;
  zoom?: number;
  offset: { x: number, y: number };
  onOffsetChange: (offset: { x: number, y: number }) => void;
}

const GridPreview: React.FC<GridPreviewProps> = ({ 
  images, 
  settings, 
  zoom = 0.4,
  offset,
  onOffsetChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderRequestId = useRef<number>(0);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [currentCanvasHeight, setCurrentCanvasHeight] = useState(settings.canvasHeight);
  const [calculatedCols, setCalculatedCols] = useState(settings.columns);
  
  const dragInfo = useRef({
    startX: 0,
    startY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
    animationFrameId: 0
  });

  const activeImages = images.filter(img => img.isActive);

  // Pré-carrega imagens
  useEffect(() => {
    const loadImages = async () => {
      const promises = activeImages.map(img => {
        if (imageCache.current.has(img.id)) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const i = new Image();
          i.onload = () => {
            imageCache.current.set(img.id, i);
            resolve();
          };
          i.src = img.previewUrl;
        });
      });
      await Promise.all(promises);
      requestAnimationFrame(() => drawGrid());
    };
    loadImages();
  }, [images]);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isAuto = settings.layoutMode === 'auto';
    const margin = settings.outerMargin;
    const spacing = settings.innerSpacing;
    const scaleFactor = 1 + ((settings.itemScale || 0) / 100);

    let cols = settings.columns;

    // LÓGICA AUTO-FLOW DINÂMICA
    if (isAuto && activeImages.length > 0) {
      let targetRatio = 1;
      if (settings.targetShape === 'portrait') targetRatio = 0.65;
      if (settings.targetShape === 'landscape') targetRatio = 1.6;

      const avgItemRatio = activeImages.reduce((acc, img) => acc + img.aspectRatio, 0) / activeImages.length;
      const optimalCols = Math.max(1, Math.round(Math.sqrt((targetRatio * activeImages.length) / avgItemRatio)));
      cols = optimalCols;
      if (calculatedCols !== cols) setCalculatedCols(cols);
    }

    let finalCanvasWidth = settings.canvasWidth;
    let finalCanvasHeight = settings.canvasHeight;

    if (isAuto) {
      const baseCellWidth = (settings.canvasWidth - (2 * margin) - ((cols - 1) * spacing)) / cols;
      const cellWidth = baseCellWidth * scaleFactor;
      const cellHeight = cellWidth; // Guia quadrada para o grid auto
      const rows = Math.ceil(activeImages.length / cols);
      
      finalCanvasHeight = (rows * cellHeight) + (2 * margin) + ((rows - 1) * spacing);
      finalCanvasWidth = (cols * cellWidth) + (2 * margin) + ((cols - 1) * spacing);

      if (activeImages.length === 0) {
        finalCanvasHeight = settings.canvasHeight;
        finalCanvasWidth = settings.canvasWidth;
      }
      
      if (currentCanvasHeight !== finalCanvasHeight) {
        setCurrentCanvasHeight(finalCanvasHeight);
      }
    }

    if (canvas.width !== finalCanvasWidth || canvas.height !== finalCanvasHeight) {
      canvas.width = finalCanvasWidth;
      canvas.height = finalCanvasHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!settings.isTransparent) {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (activeImages.length === 0) return;

    const actualCellWidth = (canvas.width - (2 * margin) - ((cols - 1) * spacing)) / cols;
    const rows = Math.ceil(activeImages.length / cols);
    const actualCellHeight = (canvas.height - (2 * margin) - ((rows - 1) * spacing)) / rows;

    activeImages.forEach((imgObj, index) => {
      const img = imageCache.current.get(imgObj.id);
      if (!img) return;

      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = margin + (col * (actualCellWidth + spacing));
      const y = margin + (row * (actualCellHeight + spacing));

      let drawW = actualCellWidth;
      let drawH = actualCellWidth / imgObj.aspectRatio;

      if (drawH > actualCellHeight) {
        drawH = actualCellHeight;
        drawW = actualCellHeight * imgObj.aspectRatio;
      }

      const offsetX = x + (actualCellWidth - drawW) / 2;
      const offsetY = y + (actualCellHeight - drawH) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    });
  }, [activeImages, settings, currentCanvasHeight, calculatedCols]);

  useEffect(() => {
    if (renderRequestId.current) cancelAnimationFrame(renderRequestId.current);
    renderRequestId.current = requestAnimationFrame(() => drawGrid());
    return () => {
      if (renderRequestId.current) cancelAnimationFrame(renderRequestId.current);
    };
  }, [drawGrid, settings]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: offset.x,
      initialOffsetY: offset.y,
      animationFrameId: 0
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    if (dragInfo.current.animationFrameId) {
      cancelAnimationFrame(dragInfo.current.animationFrameId);
    }

    dragInfo.current.animationFrameId = requestAnimationFrame(() => {
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;

      onOffsetChange({
        x: dragInfo.current.initialOffsetX + dx,
        y: dragInfo.current.initialOffsetY + dy
      });
    });
  }, [isDragging, onOffsetChange]);

  const handleMouseUp = useCallback(() => {
    if (dragInfo.current.animationFrameId) {
      cancelAnimationFrame(dragInfo.current.animationFrameId);
    }
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isAuto = settings.layoutMode === 'auto';
  let actualCols = settings.columns;
  if (isAuto && activeImages.length > 0) actualCols = calculatedCols;

  const margin = settings.outerMargin;
  const spacing = settings.innerSpacing;
  const scaleFactor = 1 + ((settings.itemScale || 0) / 100);
  
  const baseCellW = (settings.canvasWidth - (2 * margin) - ((actualCols - 1) * spacing)) / actualCols;
  const cellW = baseCellW * (isAuto ? scaleFactor : 1);

  const finalW = isAuto ? (actualCols * cellW) + (2 * margin) + ((actualCols - 1) * spacing) : settings.canvasWidth;
  const finalH = isAuto ? currentCanvasHeight : settings.canvasHeight;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none overflow-hidden"
      onMouseDown={handleMouseDown}
    >
      <div 
        className="shadow-2xl relative border bg-theme-panel flex-shrink-0 transition-all duration-300 ease-out"
        style={{
          width: finalW * zoom,
          height: finalH * zoom,
          minWidth: finalW * zoom,
          minHeight: finalH * zoom,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          borderColor: 'var(--border)',
          backgroundImage: settings.isTransparent ? 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)' : 'none',
          backgroundSize: '20px 20px',
          willChange: 'transform, width, height'
        }}
      >
        <canvas 
          id="grid-canvas" 
          ref={canvasRef} 
          className="w-full h-full block" 
        />
      </div>
    </div>
  );
};

export default GridPreview;
