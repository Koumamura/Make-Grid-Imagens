
import React, { useRef, useEffect, useState } from 'react';
import { GridImage, GridSettings } from '../types';

interface GridPreviewProps {
  images: GridImage[];
  settings: GridSettings;
}

const GridPreview: React.FC<GridPreviewProps> = ({ images, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderGrid = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Setup Canvas
      canvas.width = settings.canvasWidth;
      canvas.height = settings.canvasHeight;

      // 2. Background
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (images.length === 0) return;

      // 3. Calculate Grid
      const cols = settings.columns;
      const margin = settings.outerMargin;
      const spacing = settings.innerSpacing;

      const availableWidth = canvas.width - (2 * margin) - ((cols - 1) * spacing);
      const cellWidth = availableWidth / cols;

      // In this mode, we calculate cell heights dynamically or keep them uniform
      // User requested "maintain aspect ratio", so we'll treat each row height
      // based on the images in it. To keep a "grid", we usually use uniform cells.
      // Let's implement uniform cells but fit images inside them preserving ratio.
      
      const rows = Math.ceil(images.length / cols);
      const availableHeight = canvas.height - (2 * margin) - ((rows - 1) * spacing);
      const cellHeight = availableHeight / rows;

      const loadAndDraw = async (imgObj: GridImage, index: number) => {
        return new Promise<void>((resolve) => {
          const col = index % cols;
          const row = Math.floor(index / cols);

          const x = margin + (col * (cellWidth + spacing));
          const y = margin + (row * (cellHeight + spacing));

          const img = new Image();
          img.onload = () => {
            // Calculate best fit maintaining aspect ratio (Object-fit: contain)
            let drawW = cellWidth;
            let drawH = cellWidth / imgObj.aspectRatio;

            if (drawH > cellHeight) {
              drawH = cellHeight;
              drawW = cellHeight * imgObj.aspectRatio;
            }

            const offsetX = x + (cellWidth - drawW) / 2;
            const offsetY = y + (cellHeight - drawH) / 2;

            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
            resolve();
          };
          img.src = imgObj.previewUrl;
        });
      };

      for (let i = 0; i < images.length; i++) {
        await loadAndDraw(images[i], i);
      }
    };

    renderGrid();
  }, [images, settings]);

  // Handle auto-scaling the preview to fit the container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 40;
      const scaleX = (clientWidth - padding) / settings.canvasWidth;
      const scaleY = (clientHeight - padding) / settings.canvasHeight;
      setScaleFactor(Math.min(scaleX, scaleY, 1)); // Don't scale up past original size
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.canvasWidth, settings.canvasHeight]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        className="shadow-2xl bg-white border border-slate-300 relative"
        style={{
          width: settings.canvasWidth * scaleFactor,
          height: settings.canvasHeight * scaleFactor,
          transition: 'all 0.3s ease-out'
        }}
      >
        <canvas 
          id="grid-canvas"
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
        
        {/* Dimensions Badge */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {settings.canvasWidth} x {settings.canvasHeight} px (Preview: {Math.round(scaleFactor * 100)}%)
          </span>
        </div>
      </div>

      {images.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
          <i className="fas fa-layer-group text-8xl mb-6 opacity-20"></i>
          <h2 className="text-xl font-semibold">Preview da Grid</h2>
          <p className="text-sm">Adicione imagens para começar a criar seu mural</p>
        </div>
      )}
    </div>
  );
};

export default GridPreview;
