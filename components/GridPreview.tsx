
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

      // 2. Background Handling
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!settings.isTransparent) {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw background image if exists
      if (settings.backgroundImageUrl) {
        await new Promise<void>((resolve) => {
          const bgImg = new Image();
          bgImg.onload = () => {
            // Draw background image using cover logic
            const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
            const w = bgImg.width * scale;
            const h = bgImg.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.drawImage(bgImg, x, y, w, h);
            resolve();
          };
          bgImg.src = settings.backgroundImageUrl!;
        });
      }

      if (images.length === 0) return;

      // 3. Calculate Grid
      const cols = settings.columns;
      const margin = settings.outerMargin;
      const spacing = settings.innerSpacing;

      const availableWidth = canvas.width - (2 * margin) - ((cols - 1) * spacing);
      const cellWidth = availableWidth / cols;
      
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

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 60;
      const scaleX = (clientWidth - padding) / settings.canvasWidth;
      const scaleY = (clientHeight - padding) / settings.canvasHeight;
      setScaleFactor(Math.min(scaleX, scaleY, 1));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.canvasWidth, settings.canvasHeight]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <div 
        className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900 border border-slate-800 relative group"
        style={{
          width: settings.canvasWidth * scaleFactor,
          height: settings.canvasHeight * scaleFactor,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundImage: settings.isTransparent ? 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)' : 'none',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        <canvas 
          id="grid-canvas"
          ref={canvasRef}
          className="w-full h-full block"
        />
        
        {/* Info Overlay */}
        <div className="absolute -bottom-10 left-0 right-0 text-center opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full">
            {settings.canvasWidth}×{settings.canvasHeight} px • {Math.round(scaleFactor * 100)}% zoom
          </span>
        </div>
      </div>

      {images.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-700">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-800">
            <i className="fas fa-layer-group text-4xl text-slate-600"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-400">Canvas Vazio</h2>
          <p className="text-sm text-slate-600 mt-1">Sua arte aparecerá aqui</p>
        </div>
      )}
    </div>
  );
};

export default GridPreview;
