
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import SidebarFraming from '../components/SidebarFraming';
import InteractiveEditor from '../components/InteractiveEditor';
import FramingPresetModal from '../components/FramingPresetModal';
import FramingLayerSidebar from '../components/FramingLayerSidebar';
import Header from '../components/Header';
import { GridImage, FrameSettings, FramingPreset } from '../types';
import { MiauExportEngine } from '../utils/export';

interface BatchItemState { x: number; y: number; scale: number; rotation: number; exportPrefix?: string; exportFilename?: string; }

interface FramingToolProps { cacheDirHandle?: any; isSettingsOpen?: boolean; }

const FramingTool: React.FC<FramingToolProps> = ({ cacheDirHandle, isSettingsOpen = false }) => {
  const [mainBatch, setMainBatch] = useState<GridImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [batchStates, setBatchStates] = useState<Record<string, BatchItemState>>({});
  const [autoSave, setAutoSave] = useState(true);
  const [extraLayers, setExtraLayers] = useState<GridImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.4); 
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [settings, setSettings] = useState<FrameSettings>({ borderWidth: 20, borderColor: '#ffffff', borderRadius: 0, padding: 0, shadow: 10, canvasWidth: 1080, canvasHeight: 1080 });
  const [showPresets, setShowPresets] = useState(false);
  const [isLayerSidebarOpen, setIsLayerSidebarOpen] = useState(true);
  const [showCachePicker, setShowCachePicker] = useState(false);
  const [cacheFiles, setCacheFiles] = useState<{name: string, handle: any, url: string}[]>([]);
  const [isScaling, setIsScaling] = useState(false);
  const scaleDragRef = useRef({ lastX: 0, currentScale: 1 });
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);
  const currentMainImage = mainBatch[currentIndex];
  
  const currentTransform = useMemo(() => {
    if (!currentMainImage) return null;
    return batchStates[currentMainImage.id] || { x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1), y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1), scale: 0.2, rotation: 0 };
  }, [currentMainImage, batchStates, settings.canvasWidth, settings.canvasHeight]);

  const updateSettings = (newSettings: FrameSettings) => {
    setSettings(newSettings);
    if (currentMainImage) setBatchStates(prev => ({ ...prev, [currentMainImage.id]: { ...(prev[currentMainImage.id] || { x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1), y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1), scale: 0.2, rotation: 0 }), exportPrefix: newSettings.exportPrefix, exportFilename: newSettings.exportFilename } }));
  };

  const applyScaleToAllBatch = () => {
    if (!currentTransform) return;
    const currentScale = currentTransform.scale;
    setBatchStates(prev => { const newState = { ...prev }; mainBatch.forEach(img => { newState[img.id] = { ...(newState[img.id] || { x: (settings.canvasWidth / 2) - (img.width * 0.1), y: (settings.canvasHeight / 2) - (img.height * 0.1), scale: currentScale, rotation: 0 }), scale: currentScale }; }); return newState; });
  };

  const updateTransform = useCallback((id: string, updates: Partial<BatchItemState | GridImage>) => {
    if (id === 'main' && currentMainImage) setBatchStates(prev => ({ ...prev, [currentMainImage.id]: { ...(prev[currentMainImage.id] || { x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1), y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1), scale: 0.2, rotation: 0 }), ...updates as any } }));
    else setExtraLayers(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  }, [currentMainImage, settings]);

  const loadImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => resolve(img); img.onerror = () => reject(new Error("Erro")); img.src = url; });

  const handleProcessAll = async () => {
    if (mainBatch.length === 0) return;
    setIsProcessing(true); setProcessProgress(0);
    const canvas = document.createElement('canvas'); canvas.width = settings.canvasWidth; canvas.height = settings.canvasHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return;
    const zip = downloadZip ? new JSZip() : null;
    try {
      const extraImgs = await Promise.all(extraLayers.map(l => loadImage(l.previewUrl)));
      let frameImg: HTMLImageElement | null = null;
      if (settings.frameImageUrl) frameImg = await loadImage(settings.frameImageUrl);
      for (let i = 0; i < mainBatch.length; i++) {
        setProcessProgress(i + 1); const item = mainBatch[i]; 
        const state = batchStates[item.id] || { x: (settings.canvasWidth / 2) - (item.width * 0.1), y: (settings.canvasHeight / 2) - (item.height * 0.1), scale: 0.2, rotation: 0 };
        ctx.clearRect(0, 0, canvas.width, canvas.height); const mainImgObj = await loadImage(item.previewUrl);
        ctx.save(); const drawW = item.width * state.scale, drawH = item.height * state.scale; ctx.translate(state.x + drawW / 2, state.y + drawH / 2); ctx.rotate((state.rotation * Math.PI) / 180); ctx.drawImage(mainImgObj, -drawW / 2, -drawH / 2, drawW, drawH); ctx.restore();
        extraLayers.forEach((layer, idx) => { if (layer.visible === false || layer.aboveFrame !== false) return; ctx.save(); const lW = layer.width * (layer.scale || 1), lH = layer.height * (layer.scale || 1); ctx.translate((layer.x || 0) + lW / 2, (layer.y || 0) + lH / 2); ctx.rotate(((layer.rotation || 0) * Math.PI) / 180); ctx.drawImage(extraImgs[idx], -lW / 2, -lH / 2, lW, lH); ctx.restore(); });
        if (frameImg) ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        else { ctx.strokeStyle = settings.borderColor; ctx.lineWidth = settings.borderWidth; ctx.strokeRect(settings.borderWidth / 2, settings.borderWidth / 2, canvas.width - settings.borderWidth, canvas.height - settings.borderWidth); }
        extraLayers.forEach((layer, idx) => { if (layer.visible === false || layer.aboveFrame === false) return; ctx.save(); const lW = layer.width * (layer.scale || 1), lH = layer.height * (layer.scale || 1); ctx.translate((layer.x || 0) + lW / 2, (layer.y || 0) + lH / 2); ctx.rotate(((layer.rotation || 0) * Math.PI) / 180); ctx.drawImage(extraImgs[idx], -lW / 2, -lH / 2, lW, lH); ctx.restore(); });
        const dataUrl = canvas.toDataURL('image/png', 1.0); const fileName = `${state.exportPrefix || ''}${state.exportFilename?.trim() || item.file.name.replace(/\.[^/.]+$/, "")}.png`;
        if (downloadIndividual) { await MiauExportEngine.saveImage(dataUrl, fileName); if (!((window as any).__TAURI__)) await new Promise(r => setTimeout(r, 400)); }
        if (zip) zip.file(fileName, dataUrl.split(',')[1], { base64: true });
      }
      if (zip) { const zipBlob = await zip.generateAsync({ type: "blob" }); await MiauExportEngine.saveZip(zipBlob, `batch_framing_${Date.now()}.zip`); }
    } finally { setIsProcessing(false); setProcessProgress(0); }
  };

  // Fix: Added missing handleMainFileChange
  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add explicit File[] type casting to resolve unknown type errors
      const files = Array.from(e.target.files) as File[];
      const newImages: GridImage[] = [];
      for (const file of files) {
        try {
          const url = URL.createObjectURL(file);
          const img = await loadImage(url);
          newImages.push({
            id: uuidv4(),
            file,
            previewUrl: url,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            isActive: true,
            visible: true
          });
        } catch (err) {
          console.error("Erro ao carregar imagem principal:", err);
        }
      }
      if (newImages.length > 0) {
        setMainBatch(prev => [...prev, ...newImages]);
      }
    }
    if (e.target) e.target.value = '';
  };

  // Fix: Added missing handleExtraFileChange
  const handleExtraFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add explicit File[] type casting to resolve unknown type errors
      const files = Array.from(e.target.files) as File[];
      const newLayers: GridImage[] = [];
      for (const file of files) {
        try {
          const url = URL.createObjectURL(file);
          const img = await loadImage(url);
          newLayers.push({
            id: uuidv4(),
            file,
            previewUrl: url,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            isActive: true,
            visible: true,
            x: 0,
            y: 0,
            scale: 0.5,
            rotation: 0
          });
        } catch (err) {
          console.error("Erro ao carregar layer extra:", err);
        }
      }
      if (newLayers.length > 0) {
        setExtraLayers(prev => [...prev, ...newLayers]);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleReorderMain = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...mainBatch]; const item = newItems[dragIndex]; newItems.splice(dragIndex, 1); newItems.splice(hoverIndex, 0, item); setMainBatch(newItems);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme">
        <SidebarFraming settings={settings} onSettingsChange={updateSettings} onAddLote={() => mainFileInputRef.current?.click()} onAddExtras={() => extraFileInputRef.current?.click()} onAddFrame={() => frameInputRef.current?.click()} onOpenPresets={() => setShowPresets(true)} autoSave={autoSave} onAutoSaveChange={setAutoSave} onProcessAll={handleProcessAll} isProcessing={isProcessing} progress={processProgress} total={mainBatch.length} exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }} onApplyPrefixToAll={() => {}} />
      </aside>
      <section className="flex-1 flex flex-col overflow-hidden bg-theme-main relative">
        <Header 
          itemCount={mainBatch.length + extraLayers.length} 
          onClear={() => {setMainBatch([]); setExtraLayers([]); setBatchStates({});}} 
          onExport={handleProcessAll}
          isProcessing={isProcessing}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
          <InteractiveEditor loteImages={extraLayers} mainImage={currentMainImage ? { ...currentMainImage, ...currentTransform! } : null} frameSettings={settings} selectedId={selectedId} onSelect={setSelectedId} onUpdateImage={updateTransform} zoom={zoom} offset={offset} onOffsetChange={setOffset} hideLimbo={isSettingsOpen || showPresets} />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme/40 py-1.5 px-6 rounded-full shadow-2xl backdrop-blur-md z-[70]">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-20"></i>
              <input type="range" min="0.05" max="2" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-40 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
            </div>
            <div className="flex items-center gap-4">
              <button disabled={currentIndex === 0} onClick={() => { setCurrentIndex(prev => prev - 1); setSelectedId('main'); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-left text-[9px]"></i></button>
              <span className="text-[10px] font-mono font-black text-theme-accent min-w-[60px] text-center">{mainBatch.length > 0 ? `${currentIndex + 1} / ${mainBatch.length}` : '0 / 0'}</span>
              <button disabled={currentIndex >= mainBatch.length - 1} onClick={() => { setCurrentIndex(prev => prev + 1); setSelectedId('main'); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-right text-[9px]"></i></button>
            </div>
            <button onClick={() => { setOffset({x:0,y:0}); setZoom(0.4); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-muted transition-all"><i className="fas fa-undo text-[9px]"></i></button>
          </div>
        </div>
      </section>
      <FramingLayerSidebar mainBatch={mainBatch} extraLayers={extraLayers} currentIndex={currentIndex} selectedId={selectedId} onSelectMain={(idx) => { setCurrentIndex(idx); setSelectedId('main'); }} onSelectExtra={(id) => setSelectedId(id)} onUpdateExtra={updateTransform} onRemoveExtra={(id) => { setExtraLayers(prev => prev.filter(l => l.id !== id)); if (selectedId === id) setSelectedId(null); }} onReorderMain={handleReorderMain} onReorderExtra={(dragIdx, hoverIdx) => { const newLayers = [...extraLayers]; const item = newLayers[dragIdx]; newLayers.splice(dragIdx, 1); newLayers.splice(hoverIdx, 0, item); setExtraLayers(newLayers); }} isOpen={isLayerSidebarOpen} onToggle={() => setIsLayerSidebarOpen(!isLayerSidebarOpen)} />
      <input type="file" multiple accept="image/*" className="hidden" ref={mainFileInputRef} onChange={handleMainFileChange} />
      <input type="file" multiple accept="image/*" className="hidden" ref={extraFileInputRef} onChange={handleExtraFileChange} />
      <input type="file" accept="image/png" className="hidden" ref={frameInputRef} onChange={(e) => { if (e.target.files?.[0]) { const url = URL.createObjectURL(e.target.files[0]); const img = new Image(); img.onload = () => { setSettings(prev => ({ ...prev, frameImageUrl: url, frameImageName: e.target.files![0].name, canvasWidth: img.width, canvasHeight: img.height })); }; img.src = url; } }} />
    </div>
  );
};

export default FramingTool;
