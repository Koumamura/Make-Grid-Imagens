
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import SidebarResizer from '../components/SidebarResizer';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import { GridImage } from '../types';
import { MiauExportEngine } from '../utils/export';

export type ResizeMode = 'fit' | 'fill' | 'stretch';
export type ResizeMethod = 'fixed' | 'proportional';

interface CropBounds { x: number; y: number; w: number; h: number; }

const ResizerTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [currentTrimBounds, setCurrentTrimBounds] = useState<CropBounds | null>(null);
  const [zoom, setZoom] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [settings, setSettings] = useState({ width: 1080, height: 1080, mode: 'fit' as ResizeMode, useTrim: false, trimMargin: 0, lockAspectRatio: true, boundSize: 1080, boundType: 'max' as 'max' | 'min', activeMethod: 'fixed' as ResizeMethod });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const getTrimBounds = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return null;
    canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img, 0, 0); const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0; let found = false;
    for (let y = 0; y < canvas.height; y++) { for (let x = 0; x < canvas.width; x++) { if (imageData[(y * canvas.width + x) * 4 + 3] > 0) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; found = true; } } }
    if (!found) return { x: 0, y: 0, w: canvas.width, h: canvas.height };
    return { x: minX, y: minY, w: (maxX - minX) + 1, h: (maxY - minY) + 1 };
  };

  useEffect(() => {
    const updateBounds = async () => { if (!images[selectedIdx]) { setCurrentTrimBounds(null); return; } const img = await new Promise<HTMLImageElement>(r => { const i = new Image(); i.onload = () => r(i); i.src = images[selectedIdx].previewUrl; }); setCurrentTrimBounds(getTrimBounds(img)); };
    updateBounds();
  }, [selectedIdx, images]);

  useEffect(() => {
    const drawPreview = async () => {
      if (!previewCanvasRef.current || !images[selectedIdx] || !currentTrimBounds) return;
      const canvas = previewCanvasRef.current; const ctx = canvas.getContext('2d'); if (!ctx) return;
      const img = await new Promise<HTMLImageElement>(r => { const i = new Image(); i.onload = () => r(i); i.src = images[selectedIdx].previewUrl; });
      if (settings.useTrim) { canvas.width = currentTrimBounds.w + (settings.trimMargin * 2); canvas.height = currentTrimBounds.h + (settings.trimMargin * 2); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, currentTrimBounds.x, currentTrimBounds.y, currentTrimBounds.w, currentTrimBounds.h, settings.trimMargin, settings.trimMargin, currentTrimBounds.w, currentTrimBounds.h); } 
      else { canvas.width = settings.width; canvas.height = settings.height; ctx.clearRect(0, 0, canvas.width, canvas.height); const ratio = Math.min(canvas.width / img.width, canvas.height / img.height); const dW = img.width * ratio, dH = img.height * ratio; ctx.drawImage(img, (canvas.width - dW) / 2, (canvas.height - dH) / 2, dW, dH); }
    };
    drawPreview();
  }, [selectedIdx, images, currentTrimBounds, settings]);

  const handleSave = async () => {
    if (images.length === 0) return; setIsProcessing(true); setProgress(0);
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); if (!ctx) return;
    const zip = downloadZip ? new JSZip() : null;
    for (let i = 0; i < images.length; i++) {
      setProgress(i + 1); const item = images[i]; const img = await new Promise<HTMLImageElement>(r => { const im = new Image(); im.onload = () => r(im); im.src = item.previewUrl; });
      if (settings.useTrim) { const bounds = getTrimBounds(img); if (bounds) { canvas.width = bounds.w + (settings.trimMargin * 2); canvas.height = bounds.h + (settings.trimMargin * 2); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h, settings.trimMargin, settings.trimMargin, bounds.w, bounds.h); } }
      else { canvas.width = settings.width; canvas.height = settings.height; ctx.clearRect(0, 0, canvas.width, canvas.height); const ratio = Math.min(canvas.width / item.width, canvas.height / item.height); const dW = item.width * ratio, dH = item.height * ratio; ctx.drawImage(img, (canvas.width - dW) / 2, (canvas.height - dH) / 2, dW, dH); }
      const dataUrl = canvas.toDataURL('image/png'); const fileName = `${item.file.name.split('.')[0]}_miau.png`;
      if (downloadIndividual) { await MiauExportEngine.saveImage(dataUrl, fileName); if (!((window as any).__TAURI__)) await new Promise(r => setTimeout(r, 400)); }
      if (zip) zip.file(fileName, dataUrl.split(',')[1], { base64: true });
    }
    if (zip) { const content = await zip.generateAsync({ type: "blob" }); await MiauExportEngine.saveZip(content, `resizer_pack_${Date.now()}.zip`); }
    setIsProcessing(false);
  };

  const previewSize = settings.useTrim && currentTrimBounds ? { w: currentTrimBounds.w + (settings.trimMargin * 2), h: currentTrimBounds.h + (settings.trimMargin * 2) } : { w: settings.width, h: settings.height };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme overflow-y-auto"><SidebarResizer settings={settings} onSettingsChange={setSettings} onAdd={() => fileInputRef.current?.click()} onSave={handleSave} isProcessing={isProcessing} progress={progress} total={images.length} exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }} /></aside>
      <section className={`flex-1 flex flex-col overflow-hidden relative select-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`} onMouseDown={(e) => e.button === 1 && (e.preventDefault(), setIsPanning(true))} onMouseMove={(e) => isPanning && setOffset({ x: offset.x + e.movementX, y: offset.y + e.movementY })} onMouseUp={(e) => e.button === 1 && setIsPanning(false)} onMouseLeave={() => setIsPanning(false)}>
        <Header itemCount={images.length} onClear={() => setImages([])} />
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-hidden bg-black/5">
          {images[selectedIdx] && (
            <div className="relative shadow-2xl border border-theme bg-theme-panel transition-all duration-75 rounded-none overflow-hidden" style={{ width: previewSize.w * zoom, height: previewSize.h * zoom, transform: `translate(${offset.x}px, ${offset.y}px)`, backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.1) 75%)', backgroundSize: '16px 16px' }}>
              <canvas ref={previewCanvasRef} className="w-full h-full block pointer-events-none" />
            </div>
          )}
        </div>
        {images[selectedIdx] && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme px-6 py-2 rounded-full shadow-2xl backdrop-blur-md z-50">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-30"></i>
              <input type="range" min="0.05" max="2" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-24 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
            </div>
            <div className="flex items-center gap-4">
              <button disabled={selectedIdx === 0} onClick={() => setSelectedIdx(selectedIdx - 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-left text-[9px]"></i></button>
              <span className="text-[10px] font-mono font-black text-theme-accent min-w-[50px] text-center">{selectedIdx + 1} / {images.length}</span>
              <button disabled={selectedIdx >= images.length - 1} onClick={() => setSelectedIdx(selectedIdx + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-right text-[9px]"></i></button>
            </div>
            <button onClick={() => {setOffset({x:0,y:0}); setZoom(0.4);}} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-muted transition-all"><i className="fas fa-undo text-[9px]"></i></button>
          </div>
        )}
      </section>
      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files) as File[];
        files.forEach(file => {
          const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => setImages(prev => [...prev, { id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height }]); img.src = url;
        });
      }} />
    </div>
  );
};

export default ResizerTool;
