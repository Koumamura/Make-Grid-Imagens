
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

      canvas.width = settings.canvasWidth;
      canvas.height = settings.canvasHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!settings.isTransparent) {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (images.length === 0) return;

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
      const padding = 80;
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
        className="shadow-2xl relative group border"
        style={{
          width: settings.canvasWidth * scaleFactor,
          height: settings.canvasHeight * scaleFactor,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border)',
          backgroundImage: settings.isTransparent ? 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)' : 'none',
          backgroundSize: '20px 20px',
        }}
      >
        <canvas id="grid-canvas" ref={canvasRef} className="w-full h-full block" />
        <div className="absolute -bottom-10 left-0 right-0 text-center opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" 
                style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            {settings.canvasWidth}×{settings.canvasHeight} px • {Math.round(scaleFactor * 100)}% zoom
          </span>
        </div>
      </div>
    </div>
  );
};

export default GridPreview;
