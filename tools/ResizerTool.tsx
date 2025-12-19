
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import SidebarResizer from '../components/SidebarResizer';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import { GridImage } from '../types';

export type ResizeMode = 'fit' | 'fill' | 'stretch';
export type ResizeMethod = 'fixed' | 'proportional';

interface CropBounds {
  x: number; y: number; w: number; h: number;
}

const ResizerTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [currentTrimBounds, setCurrentTrimBounds] = useState<CropBounds | null>(null);
  const [zoom, setZoom] = useState(0.4);

  const [settings, setSettings] = useState({
    width: 1080,
    height: 1080,
    mode: 'fit' as ResizeMode,
    useTrim: false,
    trimMargin: 0,
    lockAspectRatio: true,
    boundSize: 1080,
    boundType: 'max' as 'max' | 'min',
    activeMethod: 'fixed' as ResizeMethod
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const getTrimBounds = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (imageData[(y * canvas.width + x) * 4 + 3] > 0) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
          found = true;
        }
      }
    }
    if (!found) return { x: 0, y: 0, w: canvas.width, h: canvas.height };
    return { x: minX, y: minY, w: (maxX - minX) + 1, h: (maxY - minY) + 1 };
  };

  useEffect(() => {
    const updateBounds = async () => {
      if (!images[selectedIdx]) { setCurrentTrimBounds(null); return; }
      const img = await loadImage(images[selectedIdx].previewUrl);
      setCurrentTrimBounds(getTrimBounds(img));
    };
    updateBounds();
  }, [selectedIdx, images]);

  useEffect(() => {
    const drawPreview = async () => {
      if (!previewCanvasRef.current || !images[selectedIdx] || !currentTrimBounds) return;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = await loadImage(images[selectedIdx].previewUrl);
      const margin = settings.trimMargin;

      if (settings.useTrim) {
        canvas.width = currentTrimBounds.w + (margin * 2);
        canvas.height = currentTrimBounds.h + (margin * 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, currentTrimBounds.x, currentTrimBounds.y, currentTrimBounds.w, currentTrimBounds.h, margin, margin, currentTrimBounds.w, currentTrimBounds.h);
      } else {
        canvas.width = settings.width;
        canvas.height = settings.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const dW = img.width * ratio, dH = img.height * ratio;
        ctx.drawImage(img, (canvas.width - dW) / 2, (canvas.height - dH) / 2, dW, dH);
      }
    };
    drawPreview();
  }, [selectedIdx, images, currentTrimBounds, settings.useTrim, settings.trimMargin, settings.width, settings.height]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files) as File[];
    const promises = files.map(async (file) => {
      const url = URL.createObjectURL(file);
      return new Promise<GridImage>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height });
        img.src = url;
      });
    });
    const successful = await Promise.all(promises);
    setImages(prev => [...prev, ...successful]);
    if (e.target) e.target.value = '';
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => resolve(img); img.onerror = () => reject(new Error("Erro"));
      img.src = url;
    });
  };

  const handleSave = async () => {
    if (images.length === 0) return;
    setIsProcessing(true); setProcessProgress(0);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const zip = downloadZip ? new JSZip() : null;
    try {
      for (let i = 0; i < images.length; i++) {
        setProcessProgress(i + 1);
        const item = images[i]; const imgObj = await loadImage(item.previewUrl);
        if (settings.useTrim) {
          const bounds = getTrimBounds(imgObj);
          if (bounds) {
            const margin = settings.trimMargin;
            canvas.width = bounds.w + (margin * 2); canvas.height = bounds.h + (margin * 2);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imgObj, bounds.x, bounds.y, bounds.w, bounds.h, margin, margin, bounds.w, bounds.h);
          }
        } else {
          canvas.width = settings.width; canvas.height = settings.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const ratio = Math.min(canvas.width / item.width, canvas.height / item.height);
          const dW = item.width * ratio, dH = item.height * ratio;
          ctx.drawImage(imgObj, (canvas.width - dW) / 2, (canvas.height - dH) / 2, dW, dH);
        }
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const fileName = `${item.file.name.split('.')[0]}_miau.png`;
        if (downloadIndividual) {
          const link = document.createElement('a'); link.download = fileName; link.href = dataUrl;
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
          await new Promise(r => setTimeout(r, 400));
        }
        if (zip) zip.file(fileName, dataUrl.split(',')[1], { base64: true });
      }
      if (zip) {
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a'); link.href = URL.createObjectURL(content);
        link.download = `master_export_${Date.now()}.zip`; link.click();
      }
    } finally { setIsProcessing(false); setProcessProgress(0); }
  };

  const currentImg = images[selectedIdx];
  const previewSize = settings.useTrim && currentTrimBounds 
    ? { w: currentTrimBounds.w + (settings.trimMargin * 2), h: currentTrimBounds.h + (settings.trimMargin * 2) }
    : { w: settings.width, h: settings.height };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme overflow-y-auto">
        <SidebarResizer 
          settings={settings} onSettingsChange={setSettings} 
          onAdd={() => fileInputRef.current?.click()} onSave={handleSave}
          isProcessing={isProcessing} progress={processProgress} total={images.length}
          exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }}
        />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden relative">
        <Header itemCount={images.length} onClear={() => setImages([])} />
        
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-hidden bg-black/5 relative">
          {currentImg ? (
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-10">
               
               <div 
                className="relative shadow-2xl border border-theme bg-theme-panel overflow-hidden transition-all duration-300 rounded-lg"
                style={{ 
                   width: previewSize.w * zoom, 
                   height: previewSize.h * zoom,
                   backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.1) 75%)',
                   backgroundSize: '16px 16px'
                 }}>
                <canvas ref={previewCanvasRef} className="w-full h-full block" />
              </div>

              {/* PAINEL DE METADATA (RESOLUÇÃO) REESTILIZADO */}
              <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3">
                   {settings.useTrim && (
                     <div className="flex items-center gap-1.5 bg-theme-accent text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-lg shadow-theme-accent/20">
                        <i className="fas fa-magic text-[10px]"></i>
                        <span className="text-[10px] font-black uppercase tracking-wider">Auto Crop</span>
                     </div>
                   )}
                   
                   <div className="flex items-center gap-4 bg-theme-panel/60 border border-theme px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
                      <div className="flex flex-col items-start leading-none gap-1">
                        <span className="text-[7px] font-black uppercase opacity-30 tracking-widest">Original</span>
                        <span className="text-[11px] font-mono font-bold opacity-60 tracking-tighter">
                          {currentImg.width}<span className="opacity-30 mx-0.5">×</span>{currentImg.height}
                        </span>
                      </div>

                      <div className="w-6 h-6 flex items-center justify-center bg-theme-accent/10 rounded-full">
                        <i className="fas fa-long-arrow-alt-right text-theme-accent text-xs"></i>
                      </div>

                      <div className="flex flex-col items-start leading-none gap-1 text-right">
                        <span className="text-[7px] font-black uppercase text-theme-accent tracking-widest">Resultado</span>
                        <span className="text-[11px] font-mono font-black text-theme-accent tracking-tighter">
                          {Math.round(previewSize.w)}<span className="opacity-40 mx-0.5">×</span>{Math.round(previewSize.h)}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2 opacity-30">
                   <div className="h-[1px] w-4 bg-current"></div>
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                     {settings.useTrim ? 'Smart Processing' : 'Fixed Dimension'}
                   </span>
                   <div className="h-[1px] w-4 bg-current"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-10 flex flex-col items-center gap-4">
              <i className="fas fa-expand-arrows-alt text-9xl"></i>
              <p className="font-black text-2xl uppercase tracking-[0.3em]">Master Resizer</p>
            </div>
          )}

          {/* BARRA DE CONTROLE DE VIEW NO PREVIEW */}
          {currentImg && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme px-6 py-2 rounded-full shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
                <i className="fas fa-search text-[10px] opacity-30"></i>
                <input type="range" min="0.05" max="2" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-24 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
                <span className="text-[9px] font-mono opacity-40 w-8">{Math.round(zoom * 100)}%</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button disabled={selectedIdx === 0} onClick={() => setSelectedIdx(prev => prev - 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-left text-[9px]"></i></button>
                <span className="text-[10px] font-mono font-black text-theme-accent min-w-[50px] text-center">{selectedIdx + 1} / {images.length}</span>
                <button disabled={selectedIdx >= images.length - 1} onClick={() => setSelectedIdx(prev => prev + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-right text-[9px]"></i></button>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="w-80 border-l bg-theme-side border-theme flex flex-col overflow-hidden">
        <div className="p-4 border-b border-theme font-black text-[10px] uppercase tracking-widest text-theme-muted bg-black/5 flex justify-between items-center">
          <span>Fila Master</span>
          <span className="text-[9px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">{images.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ImageList images={images} onRemove={(id) => setImages(prev => prev.filter(img => img.id !== id))} onMove={() => {}} />
        </div>
      </aside>
      <input type="file" multiple accept="image/png, image/jpeg, image/webp" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
};

export default ResizerTool;
