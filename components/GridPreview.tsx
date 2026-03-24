
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { GridImage, GridSettings, ImageAlignment } from '../types';

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
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [isPanning, setIsPanning] = useState(false);

  const activeImages = useMemo(() => {
    const active = images.filter(img => img.isActive);
    if (settings.makerMode && active.length > 0) {
      const repeat = settings.makerRepeat || 1;
      return Array(repeat).fill(active[0]);
    }
    return active;
  }, [images, settings.makerMode, settings.makerRepeat]);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      const imagesToLoad = settings.makerMode && images.length > 0 ? [images[0]] : images.filter(img => img.isActive);
      
      const promises = imagesToLoad.map(img => {
        if (imageCache.current.has(img.id)) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const i = new Image();
          i.onload = () => {
            if (isMounted) imageCache.current.set(img.id, i);
            resolve();
          };
          i.src = img.previewUrl;
        });
      });
      await Promise.all(promises);
      if (isMounted) drawGrid();
    };
    loadImages();
    return () => { isMounted = false; };
  }, [images, settings.makerMode]);

  const dimensions = useMemo(() => {
    const isAuto = settings.layoutMode === 'auto';
    const hSpacing = settings.innerSpacing;
    const vSpacing = settings.verticalSpacing ?? settings.innerSpacing;
    const bleed = settings.showCuttingGuides ? (settings.guideOffset || 0) : 0;
    const effectiveMargin = settings.outerMargin + bleed;

    let cols = settings.columns;
    if (isAuto && activeImages.length > 0) {
      let targetRatio = 1;
      if (settings.targetShape === 'portrait') targetRatio = 0.75;
      if (settings.targetShape === 'landscape') targetRatio = 1.33;
      const avgItemRatio = activeImages.reduce((acc, img) => acc + img.aspectRatio, 0) / activeImages.length;
      cols = Math.max(1, Math.round(Math.sqrt((targetRatio * activeImages.length) / avgItemRatio)));
    }

    let finalW = settings.canvasWidth;
    let finalH = settings.canvasHeight;
    
    if (isAuto && activeImages.length > 0) {
      const actualCellWidth = (settings.canvasWidth - (2 * effectiveMargin) - ((cols - 1) * hSpacing)) / cols;
      const rows = Math.ceil(activeImages.length / cols);
      finalW = settings.canvasWidth;
      finalH = (rows * actualCellWidth) + (2 * effectiveMargin) + ((rows - 1) * vSpacing);
    }
    
    return { width: Math.floor(finalW), height: Math.floor(finalH), cols: Math.max(1, cols), effectiveMargin };
  }, [settings, activeImages.length]);

  const calculateOffsets = (alignment: ImageAlignment, diffW: number, diffH: number) => {
    let offsetX = 0;
    let offsetY = 0;

    // Horizontal Alignment
    if (alignment.includes('center')) offsetX = diffW / 2;
    else if (alignment.includes('right')) offsetX = diffW;
    else if (alignment === 'center') offsetX = diffW / 2; // Caso específico de center puro

    // Vertical Alignment
    if (alignment.includes('middle')) offsetY = diffH / 2;
    else if (alignment.includes('bottom')) offsetY = diffH;
    else if (alignment === 'center') offsetY = diffH / 2;

    return { offsetX, offsetY };
  };

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const { width, height, cols, effectiveMargin } = dimensions;
    const hSpacing = settings.innerSpacing;
    const vSpacing = settings.verticalSpacing ?? settings.innerSpacing;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!settings.isTransparent) {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (activeImages.length === 0) return;

    const actualCellWidth = (canvas.width - (2 * effectiveMargin) - ((cols - 1) * hSpacing)) / cols;
    const rows = Math.ceil(activeImages.length / cols);
    const actualCellHeight = settings.layoutMode === 'auto' 
      ? actualCellWidth 
      : (canvas.height - (2 * effectiveMargin) - ((rows - 1) * vSpacing)) / rows;

    activeImages.forEach((imgObj, index) => {
      const img = imageCache.current.get(imgObj.id);
      if (!img) return;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = effectiveMargin + (col * (actualCellWidth + hSpacing));
      const y = effectiveMargin + (row * (actualCellHeight + vSpacing));
      
      let drawW, drawH;

      if (settings.forceOriginalSize) {
        drawW = imgObj.width;
        drawH = imgObj.height;
      } else {
        drawW = actualCellWidth;
        drawH = actualCellWidth / imgObj.aspectRatio;
        if (drawH > actualCellHeight) {
          drawH = actualCellHeight;
          drawW = actualCellHeight * imgObj.aspectRatio;
        }
      }
      
      // NOVA LÓGICA DE ALINHAMENTO EXPLÍCITO
      const { offsetX, offsetY } = calculateOffsets(settings.alignment, actualCellWidth - drawW, actualCellHeight - drawH);
      
      ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);
    });

    if (settings.showCuttingGuides) {
      const guideColor = settings.guideColor || '#4f46e5';
      const bleed = settings.guideOffset || 0;
      const len = settings.guideLength || 30;
      const thickness = settings.guideThickness || 2;
      ctx.strokeStyle = guideColor;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'square';
      ctx.beginPath();
      const top = bleed; const left = bleed; const right = canvas.width - bleed; const bottom = canvas.height - bleed;
      ctx.moveTo(left, top + len); ctx.lineTo(left, top); ctx.lineTo(left + len, top);
      ctx.moveTo(right - len, top); ctx.lineTo(right, top); ctx.lineTo(right, top + len);
      ctx.moveTo(left, bottom - len); ctx.lineTo(left, bottom); ctx.lineTo(left + len, bottom);
      ctx.moveTo(right - len, bottom); ctx.lineTo(right, bottom); ctx.lineTo(right, bottom - len);
      ctx.stroke();
    }

    if (settings.showSilhouetteMarks) {
      const bleed = settings.guideOffset || 0;
      const thickness = settings.guideThickness || 2;
      const len = settings.guideLength || 30;
      const markSize = Math.max(20, len); // Tamanho do quadrado e braços do L
      
      // Desenhar fundo branco atrás das marcas para garantir leitura do sensor
      ctx.fillStyle = '#FFFFFF';
      // Fundo do Quadrado
      ctx.fillRect(bleed - 5, bleed - 5, markSize + 10, markSize + 10);
      // Fundo do L Superior Direito
      ctx.fillRect(canvas.width - bleed - markSize - 5, bleed - 5, markSize + 10, markSize + 10);
      // Fundo do L Inferior Esquerdo
      ctx.fillRect(bleed - 5, canvas.height - bleed - markSize - 5, markSize + 10, markSize + 10);

      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = thickness;
      ctx.lineCap = 'square';

      // 1. Quadrado Superior Esquerdo
      ctx.fillRect(bleed, bleed, markSize, markSize);

      // 2. L Superior Direito
      ctx.beginPath();
      ctx.moveTo(canvas.width - bleed - markSize, bleed);
      ctx.lineTo(canvas.width - bleed, bleed);
      ctx.lineTo(canvas.width - bleed, bleed + markSize);
      ctx.stroke();

      // 3. L Inferior Esquerdo
      ctx.beginPath();
      ctx.moveTo(bleed, canvas.height - bleed - markSize);
      ctx.lineTo(bleed, canvas.height - bleed);
      ctx.lineTo(bleed + markSize, canvas.height - bleed);
      ctx.stroke();

      // Opcional: Desenhar uma borda de "área segura" (opcional, mas ajuda a visualizar)
      // ctx.setLineDash([5, 5]);
      // ctx.strokeRect(bleed + markSize, bleed + markSize, canvas.width - 2*(bleed + markSize), canvas.height - 2*(bleed + markSize));
      // ctx.setLineDash([]);
    }
  }, [activeImages, settings, dimensions]);

  useEffect(() => { drawGrid(); }, [drawGrid]);

  const renderDimensionBadge = (imgObj: GridImage, drawW: number, drawH: number, isLarge: boolean = false) => {
    const diffW = Math.round(drawW - imgObj.width);
    const diffH = Math.round(drawH - imgObj.height);
    
    let color = "text-[#22c55e]"; // Verde
    if (diffW > 1 || diffH > 1) color = "text-[#a855f7]"; // Roxo
    else if (diffW < -1 || diffH < -1) color = "text-[#ef4444]"; // Vermelho

    const labelW = `${Math.round(drawW)}${diffW !== 0 ? `(${diffW > 0 ? '+' : ''}${diffW})` : ''}`;
    const labelH = `${Math.round(drawH)}${diffH !== 0 ? `(${diffH > 0 ? '+' : ''}${diffH})` : ''}`;

    return (
      <div className={`pointer-events-none font-mono font-black flex items-center justify-center whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 shadow-2xl ${isLarge ? 'text-[12px]' : 'text-[9px]'} ${color}`}>
        {labelW}px X {labelH}px
      </div>
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      containerRef.current?.focus();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onOffsetChange({ x: offset.x + e.movementX, y: offset.y + e.movementY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) setIsPanning(false);
  };

  const uiOverlays = useMemo(() => {
    if (activeImages.length === 0) return null;
    const { cols, effectiveMargin } = dimensions;
    const hSpacing = settings.innerSpacing;
    const vSpacing = settings.verticalSpacing ?? settings.innerSpacing;
    const actualCellWidth = (dimensions.width - (2 * effectiveMargin) - ((cols - 1) * hSpacing)) / cols;
    const rows = Math.ceil(activeImages.length / cols);
    const actualCellHeight = settings.layoutMode === 'auto' 
      ? actualCellWidth 
      : (dimensions.height - (2 * effectiveMargin) - ((rows - 1) * vSpacing)) / rows;

    const silhouetteOverlay = settings.showSilhouetteMarks ? (
      <div className="absolute inset-0 pointer-events-none z-[80]">
        {/* Visualização da área de segurança (não exportada) */}
        <div 
          className="absolute border-2 border-dashed border-red-500/30 bg-red-500/5"
          style={{
            left: (settings.guideOffset || 0) * zoom,
            top: (settings.guideOffset || 0) * zoom,
            width: (dimensions.width - 2 * (settings.guideOffset || 0)) * zoom,
            height: (dimensions.height - 2 * (settings.guideOffset || 0)) * zoom,
          }}
        >
          <div className="absolute top-2 left-2 text-[8px] font-black uppercase text-red-500/50 bg-black/20 px-1 rounded">Área de Registro</div>
        </div>
      </div>
    ) : null;

    if (settings.makerMode && activeImages.length > 0) {
      const imgObj = activeImages[0];
      let drawW, drawH;
      if (settings.forceOriginalSize) {
        drawW = imgObj.width;
        drawH = imgObj.height;
      } else {
        drawW = actualCellWidth;
        drawH = actualCellWidth / imgObj.aspectRatio;
        if (drawH > actualCellHeight) {
          drawH = actualCellHeight;
          drawW = actualCellHeight * imgObj.aspectRatio;
        }
      }

      return (
        <>
          {silhouetteOverlay}
          <div className="absolute top-4 right-4 z-[100] animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-theme-accent opacity-60">Status de Escala (Maker)</span>
              {renderDimensionBadge(imgObj, drawW, drawH, true)}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        {silhouetteOverlay}
        {activeImages.map((imgObj, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = effectiveMargin + (col * (actualCellWidth + hSpacing));
          const y = effectiveMargin + (row * (actualCellHeight + vSpacing));
          
          let drawW, drawH;
          if (settings.forceOriginalSize) {
            drawW = imgObj.width;
            drawH = imgObj.height;
          } else {
            drawW = actualCellWidth;
            drawH = actualCellWidth / imgObj.aspectRatio;
            if (drawH > actualCellHeight) {
              drawH = actualCellHeight;
              drawW = actualCellHeight * imgObj.aspectRatio;
            }
          }
          
          // Aplicamos a mesma lógica de ancoragem na UI Overlay
          const { offsetX, offsetY } = calculateOffsets(settings.alignment, actualCellWidth - drawW, actualCellHeight - drawH);

          return (
            <div 
              key={`badge-${index}`}
              className="absolute z-[90] pointer-events-none flex items-center justify-center transition-all duration-300"
              style={{
                left: (x + offsetX) * zoom,
                top: (y + offsetY) * zoom,
                width: drawW * zoom,
                height: drawH * zoom,
              }}
            >
              <div className="mt-auto mb-2 scale-[1.1]">
                {renderDimensionBadge(imgObj, drawW, drawH, true)}
              </div>
            </div>
          );
        })}
      </>
    );
  }, [activeImages, settings, dimensions, zoom]);

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className={`w-full h-full flex items-center justify-center relative select-none overflow-hidden bg-transparent outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPanning(false)}
      onContextMenu={(e) => isPanning && e.preventDefault()}
    >
      <div 
        className="relative shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_18px_36px_-18px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-75 rounded-none overflow-visible"
        style={{
          width: dimensions.width * zoom,
          height: dimensions.height * zoom,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          backgroundColor: settings.isTransparent ? 'transparent' : settings.backgroundColor,
          backgroundImage: settings.isTransparent ? 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.1) 75%)' : 'none',
          backgroundSize: '20px 20px'
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
        
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {uiOverlays}
        </div>
      </div>
    </div>
  );
};

export default GridPreview;
