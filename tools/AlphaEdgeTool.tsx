
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import SidebarAlphaEdge from '../components/SidebarAlphaEdge';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import AdvancedBorderModal from '../components/AdvancedBorderModal';
import { GridImage, AlphaEdgeSettings, AdvancedBorderSettings, PreviewQuality } from '../types';
import { MiauExportEngine } from '../utils/export';

interface AlphaEdgeToolProps {
  globalPreviewQuality?: PreviewQuality;
}

const DEFAULT_SETTINGS: AlphaEdgeSettings = {
  thickness: 20,
  softness: 5,
  borderScale: 100,
  opacity: 100,
  color: '#ffffff',
  boundaryMode: 'silhouette',
  geometricShape: 'circle',
  shapeOffsetX: 0,
  shapeOffsetY: 0,
  advanced: { enabled: false, gridEnabled: true, scatterEnabled: false, shapeType: 'circle', size: 15, spacingX: 10, spacingY: 10, color: '#ffffff', backgroundType: 'solid', bgColor: '#000000', gradientAngle: 0, gradientStops: [{ id: '1', color: '#1e293b', offset: 0 }, { id: '2', color: '#4f46e5', offset: 1 }], individualRotation: 0, globalRotation: 0, offsetX: 0, offsetY: 0, scatterSize: 20, scatterDensity: 40, scatterRadiusOffset: 0, scatterIndividualRotation: 0 }
};

const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
  const spikes = 5; const outerRadius = size / 2; const innerRadius = size / 4; let rot = (Math.PI / 2) * 3; let x = 0; let y = 0; const step = Math.PI / spikes; ctx.beginPath(); ctx.moveTo(0, -outerRadius); for (let i = 0; i < spikes; i++) { x = Math.cos(rot) * outerRadius; y = Math.sin(rot) * outerRadius; ctx.lineTo(x, y); rot += step; x = Math.cos(rot) * innerRadius; y = Math.sin(rot) * innerRadius; ctx.lineTo(x, y); rot += step; } ctx.lineTo(0, -outerRadius); ctx.closePath();
};

const drawCatPawClassic = (ctx: CanvasRenderingContext2D, size: number) => {
  const s = size / 2; ctx.save(); ctx.beginPath(); ctx.ellipse(0, s * 0.2, s * 0.65, s * 0.5, 0, 0, Math.PI * 2); ctx.fill(); const toeRadius = s * 0.22; ctx.beginPath(); ctx.arc(-s * 0.5, -s * 0.25, toeRadius, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-s * 0.18, -s * 0.5, toeRadius, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(s * 0.18, -s * 0.5, toeRadius, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.25, toeRadius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
};

const AlphaEdgeTool: React.FC<AlphaEdgeToolProps> = ({ globalPreviewQuality = 'fast' }) => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoom, setZoom] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [batchSettings, setBatchSettings] = useState<Record<string, AlphaEdgeSettings>>({});
  const [settings, setSettings] = useState<AlphaEdgeSettings>(DEFAULT_SETTINGS);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const currentImg = images[selectedIdx];

  useEffect(() => {
    if (currentImg && batchSettings[currentImg.id]) setSettings(batchSettings[currentImg.id]);
  }, [selectedIdx, currentImg]);

  const handleSettingsChange = (newSettings: AlphaEdgeSettings) => {
    setSettings(newSettings);
    if (autoSave && currentImg) setBatchSettings(prev => ({ ...prev, [currentImg.id]: newSettings }));
  };

  const applyToAll = () => {
    const newBatch: Record<string, AlphaEdgeSettings> = {};
    images.forEach(img => { newBatch[img.id] = { ...settings, exportPrefix: batchSettings[img.id]?.exportPrefix || settings.exportPrefix, exportFilename: batchSettings[img.id]?.exportFilename || '' }; });
    setBatchSettings(newBatch);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...images];
    const draggedItem = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedItem);
    setImages(newImages);
  };

  const getScaledPadding = useCallback((imgW: number, imgH: number, s: AlphaEdgeSettings) => {
    const scale = s.borderScale / 100;
    const effectiveBorder = (s.thickness + (s.softness * 1.5)) * scale;
    const offsetX = Math.abs(s.shapeOffsetX) * scale;
    const offsetY = Math.abs(s.shapeOffsetY) * scale;
    return Math.ceil(Math.max(2, effectiveBorder, offsetX, offsetY) + 5);
  }, []);

  const drawShape = (ctx: CanvasRenderingContext2D, type: string, size: number) => {
    if (type === 'none') return;
    const s = size / 2; ctx.beginPath();
    if (type === 'circle') ctx.arc(0, 0, s, 0, Math.PI * 2);
    else if (type === 'square') ctx.rect(-s, -s, size, size);
    else if (type === 'triangle') { ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); }
    else if (type === 'heart') { const hr = size * 0.4; ctx.moveTo(0, hr); ctx.bezierCurveTo(-size * 0.7, -size * 0.1, -size * 0.5, -size * 0.9, 0, -size * 0.4); ctx.bezierCurveTo(size * 0.5, -size * 0.9, size * 0.7, -size * 0.1, 0, hr); }
    else if (type === 'diamond') { ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath(); }
    else if (type === 'star') { drawStar(ctx, size); }
    else if (type === 'pata') { drawCatPawClassic(ctx, size); return; }
    ctx.fill();
  };

  const drawEdge = useCallback(async (img: HTMLImageElement, canvas: HTMLCanvasElement, config: AlphaEdgeSettings, isExport: boolean) => {
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const bScale = config.borderScale / 100;
    const finalPadding = getScaledPadding(img.width, img.height, config);
    canvas.width = img.width + (finalPadding * 2); canvas.height = img.height + (finalPadding * 2);
    const centerX = canvas.width / 2; const centerY = canvas.height / 2;
    const maskSize = Math.max(img.width, img.height) * 2;
    const silCanvas = document.createElement('canvas'); silCanvas.width = maskSize; silCanvas.height = maskSize;
    const sCtx = silCanvas.getContext('2d');
    if (sCtx) {
      sCtx.translate(maskSize / 2, maskSize / 2);
      if (config.boundaryMode === 'silhouette') { sCtx.drawImage(img, -img.width/2, -img.height/2); sCtx.globalCompositeOperation = 'source-in'; sCtx.fillStyle = '#ffffff'; sCtx.fillRect(-maskSize/2, -maskSize/2, maskSize, maskSize); } 
      else { drawShape(sCtx, config.geometricShape, Math.max(img.width, img.height)); }
    }
    const maskCanvas = document.createElement('canvas'); maskCanvas.width = maskSize; maskCanvas.height = maskSize;
    const mCtx = maskCanvas.getContext('2d');
    if (mCtx) {
      mCtx.drawImage(silCanvas, 0, 0);
      const layers = isExport ? 20 : 6;
      for (let l = 1; l <= layers; l++) { const r = (config.thickness / layers) * l; for (let i = 0; i < 12; i++) { const angle = (i / 12) * Math.PI * 2; mCtx.drawImage(silCanvas, Math.cos(angle) * r, Math.sin(angle) * r); } }
      if (config.softness > 0) { mCtx.filter = `blur(${config.softness}px)`; const temp = document.createElement('canvas'); temp.width = maskCanvas.width; temp.height = maskCanvas.height; temp.getContext('2d')?.drawImage(maskCanvas, 0, 0); mCtx.clearRect(0,0,maskCanvas.width,maskCanvas.height); mCtx.drawImage(temp, 0, 0); mCtx.filter = 'none'; }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.globalAlpha = config.opacity / 100; ctx.translate(centerX + config.shapeOffsetX * bScale, centerY + config.shapeOffsetY * bScale); ctx.scale(bScale, bScale); ctx.fillStyle = config.color; ctx.drawImage(maskCanvas, -maskCanvas.width/2, -maskCanvas.height/2); ctx.restore();
    ctx.save(); ctx.translate(centerX - img.width/2, centerY - img.height/2); ctx.drawImage(img, 0, 0); ctx.restore();
  }, [getScaledPadding]);

  useEffect(() => {
    if (currentImg) {
      const img = new Image(); img.src = currentImg.previewUrl;
      img.onload = () => drawEdge(img, previewCanvasRef.current!, settings, false);
    }
  }, [selectedIdx, currentImg, settings, drawEdge]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const newImgs: GridImage[] = [];
    for (const file of files) {
      const id = uuidv4(); const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve) => { const i = new Image(); i.onload = () => resolve(i); i.src = url; });
      newImgs.push({ id, file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width/img.height, isActive: true });
    }
    setImages(prev => [...prev, ...newImgs]);
    if (e.target) e.target.value = '';
  };

  const handleSave = async () => {
    if (images.length === 0) return;
    setIsProcessing(true); setProgress(0);
    const canvas = document.createElement('canvas');
    const zip = downloadZip ? new JSZip() : null;
    for (let i = 0; i < images.length; i++) {
      setProgress(i + 1); const item = images[i]; const currentConfig = batchSettings[item.id] || settings;
      const img = await new Promise<HTMLImageElement>((resolve) => { const im = new Image(); im.onload = () => resolve(im); im.src = item.previewUrl; });
      await drawEdge(img, canvas, currentConfig, true);
      const dataUrl = canvas.toDataURL('image/png'); const fileName = `${currentConfig.exportPrefix || ''}${currentConfig.exportFilename?.trim() || item.file.name.split('.')[0]}.png`;
      if (downloadIndividual) { await MiauExportEngine.saveImage(dataUrl, fileName); if (!((window as any).__TAURI__)) await new Promise(r => setTimeout(r, 400)); }
      if (zip) zip.file(fileName, dataUrl.split(',')[1], { base64: true });
    }
    if (zip) { const content = await zip.generateAsync({ type: "blob" }); await MiauExportEngine.saveZip(content, `alpha_edge_pack_${Date.now()}.zip`); }
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main relative">
      <aside className="w-80 border-r flex flex-shrink-0 flex-col bg-theme-side border-theme overflow-y-auto custom-scrollbar">
        <SidebarAlphaEdge settings={settings} onSettingsChange={handleSettingsChange} onAdd={() => fileInputRef.current?.click()} onSave={handleSave} isProcessing={isProcessing} progress={progress} total={images.length} exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }} onOpenAdvanced={() => setIsModalOpen(true)} autoSave={autoSave} onAutoSaveChange={setAutoSave} onApplyToAll={applyToAll} onExportGrid={() => {}} />
      </aside>
      <section className={`flex-1 flex flex-col overflow-hidden relative select-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`} onMouseDown={(e) => e.button === 1 && (e.preventDefault(), setIsPanning(true))} onMouseMove={(e) => isPanning && setOffset({ x: offset.x + e.movementX, y: offset.y + e.movementY })} onMouseUp={(e) => e.button === 1 && setIsPanning(false)} onMouseLeave={() => setIsPanning(false)}>
        <Header itemCount={images.length} onClear={() => { setImages([]); setBatchSettings({}); }} />
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-hidden bg-black/5">
          {currentImg && (
            <div className="relative shadow-2xl border border-theme bg-theme-panel transition-all duration-75 rounded-none overflow-hidden" style={{ width: (currentImg.width + getScaledPadding(currentImg.width, currentImg.height, settings) * 2) * zoom, height: (currentImg.height + getScaledPadding(currentImg.width, currentImg.height, settings) * 2) * zoom, transform: `translate(${offset.x}px, ${offset.y}px)` }}>
              <canvas ref={previewCanvasRef} className="w-full h-full block pointer-events-none" />
            </div>
          )}
        </div>
        {currentImg && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme px-8 py-3 rounded-full shadow-2xl backdrop-blur-xl z-50">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-30"></i>
              <input type="range" min="0.05" max="2" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-40 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
            </div>
            <div className="flex items-center gap-6">
              <button disabled={selectedIdx === 0} onClick={() => setSelectedIdx(selectedIdx - 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-left text-[10px]"></i></button>
              <span className="text-[11px] font-mono font-black text-theme-accent min-w-[70px] text-center">{selectedIdx + 1} / {images.length}</span>
              <button disabled={selectedIdx >= images.length - 1} onClick={() => setSelectedIdx(selectedIdx + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-right text-[10px]"></i></button>
            </div>
            <button onClick={() => { setOffset({x:0,y:0}); setZoom(0.4); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-muted transition-all"><i className="fas fa-undo text-[10px]"></i></button>
          </div>
        )}
      </section>
      <aside className="w-80 border-l bg-theme-side border-theme flex flex-col overflow-hidden">
        <ImageList images={images} onRemove={(id) => setImages(prev => prev.filter(img => img.id !== id))} onMove={() => {}} onToggleActive={() => {}} onReorder={handleReorder} />
      </aside>
      <input type="file" multiple accept="image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <AdvancedBorderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} settings={settings.advanced!} onUpdate={(adv) => handleSettingsChange({ ...settings, advanced: adv })} baseImage={currentImg ? { url: currentImg.previewUrl, width: currentImg.width, height: currentImg.height } : null} />
    </div>
  );
};

export default AlphaEdgeTool;
