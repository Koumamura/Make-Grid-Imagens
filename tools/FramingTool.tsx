
import React, { useState, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import SidebarFraming from '../components/SidebarFraming';
import InteractiveEditor from '../components/InteractiveEditor';
import Header from '../components/Header';
import { GridImage, FrameSettings } from '../types';

interface BatchItemState { x: number; y: number; scale: number; rotation: number; }

const FramingTool: React.FC = () => {
  const [mainBatch, setMainBatch] = useState<GridImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [batchStates, setBatchStates] = useState<Record<string, BatchItemState>>({});
  const [autoSave, setAutoSave] = useState(true);
  const [extraLayers, setExtraLayers] = useState<GridImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.4); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [settings, setSettings] = useState<FrameSettings>({ borderWidth: 20, borderColor: '#ffffff', borderRadius: 0, padding: 0, shadow: 10, canvasWidth: 1080, canvasHeight: 1080 });

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);

  const currentMainImage = mainBatch[currentIndex];
  const currentTransform = useMemo(() => {
    if (!currentMainImage) return null;
    return batchStates[currentMainImage.id] || { x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1), y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1), scale: 0.2, rotation: 0 };
  }, [currentMainImage, batchStates, settings.canvasWidth, settings.canvasHeight]);

  const selectedElement = useMemo(() => {
    if (selectedId === 'main') return { ...currentMainImage, ...currentTransform };
    return extraLayers.find(img => img.id === selectedId);
  }, [selectedId, currentMainImage, currentTransform, extraLayers]);

  const updateTransform = (id: string, updates: Partial<BatchItemState | GridImage>) => {
    if (id === 'main' && currentMainImage) {
      setBatchStates(prev => ({ ...prev, [currentMainImage.id]: { ...currentTransform!, ...updates as any } }));
    } else {
      setExtraLayers(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
    }
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => resolve(img); img.onerror = () => reject(new Error("Erro"));
      img.src = url;
    });
  };

  const handleProcessAll = async () => {
    if (mainBatch.length === 0) return;
    setIsProcessing(true); setProcessProgress(0);
    const canvas = document.createElement('canvas');
    canvas.width = settings.canvasWidth; canvas.height = settings.canvasHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const zip = downloadZip ? new JSZip() : null;
    try {
      const extraImgs = await Promise.all(extraLayers.map(l => loadImage(l.previewUrl)));
      let frameImg: HTMLImageElement | null = null;
      if (settings.frameImageUrl) frameImg = await loadImage(settings.frameImageUrl);

      const fallbackTransform = currentTransform || { x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1), y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1), scale: 0.2, rotation: 0 };

      for (let i = 0; i < mainBatch.length; i++) {
        setProcessProgress(i + 1);
        const item = mainBatch[i]; const transform = batchStates[item.id] || { ...fallbackTransform };
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const mainImgObj = await loadImage(item.previewUrl);
        ctx.save();
        const drawW = item.width * transform.scale, drawH = item.height * transform.scale;
        ctx.translate(transform.x + drawW / 2, transform.y + drawH / 2); ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.drawImage(mainImgObj, -drawW / 2, -drawH / 2, drawW, drawH); ctx.restore();

        extraLayers.forEach((layer, idx) => {
          ctx.save(); const lW = layer.width * (layer.scale || 1), lH = layer.height * (layer.scale || 1);
          ctx.translate((layer.x || 0) + lW / 2, (layer.y || 0) + lH / 2); ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
          ctx.drawImage(extraImgs[idx], -lW / 2, -lH / 2, lW, lH); ctx.restore();
        });

        if (frameImg) ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        else {
          ctx.strokeStyle = settings.borderColor; ctx.lineWidth = settings.borderWidth;
          ctx.strokeRect(settings.borderWidth / 2, settings.borderWidth / 2, canvas.width - settings.borderWidth, canvas.height - settings.borderWidth);
        }

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const fileName = `miau_${item.file.name.replace(/\.[^/.]+$/, "")}.png`;
        if (downloadIndividual) {
          const link = document.createElement('a'); link.download = fileName; link.href = dataUrl;
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
          await new Promise(r => setTimeout(r, 400));
        }
        if (zip) zip.file(fileName, dataUrl.split(',')[1], { base64: true });
      }
      if (zip) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a'); link.href = URL.createObjectURL(zipBlob);
        link.download = `miau_tools_${Date.now()}.zip`; link.click();
      }
    } finally { setIsProcessing(false); setProcessProgress(0); }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme overflow-y-auto">
        <SidebarFraming settings={settings} onSettingsChange={setSettings} onAddLote={() => mainFileInputRef.current?.click()} onAddExtras={() => extraFileInputRef.current?.click()} onAddFrame={() => frameInputRef.current?.click()} autoSave={autoSave} onAutoSaveChange={setAutoSave} onProcessAll={handleProcessAll} isProcessing={isProcessing} progress={processProgress} total={mainBatch.length} exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }} />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden bg-theme-main relative">
        <Header itemCount={mainBatch.length + extraLayers.length} onClear={() => {setMainBatch([]); setExtraLayers([]); setBatchStates({});}} />
        
        {/* BARRA DE PROPRIEDADES COMPACTA (DESIGN REINVENTADO) */}
        <div className="h-11 border-b border-theme flex items-center px-6 gap-6 bg-theme-side/40 backdrop-blur-sm z-30">
          <div className={`flex items-center gap-6 transition-all ${!selectedElement ? 'opacity-10 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-black uppercase opacity-30">Escala</span>
              <input type="range" min="0.01" max="3" step="0.01" value={selectedElement?.scale || 1} onChange={(e) => updateTransform(selectedId!, { scale: parseFloat(e.target.value) })} className="w-24 h-0.5 bg-theme-accent/20 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
              <span className="text-[9px] font-mono text-theme-accent font-black w-10 text-right">{Math.round((selectedElement?.scale || 1) * 100)}%</span>
            </div>

            <div className="h-4 w-[1px] bg-theme/50"></div>

            <div className="flex gap-1">
              <button onClick={() => updateTransform(selectedId!, { rotation: (selectedElement?.rotation || 0) - 15 })} className="w-6 h-6 flex items-center justify-center border border-theme rounded hover:bg-theme-accent/10 transition-colors"><i className="fas fa-undo text-[8px]"></i></button>
              <button onClick={() => updateTransform(selectedId!, { rotation: (selectedElement?.rotation || 0) + 15 })} className="w-6 h-6 flex items-center justify-center border border-theme rounded hover:bg-theme-accent/10 transition-colors"><i className="fas fa-redo text-[8px]"></i></button>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase opacity-30 leading-none">Posição</span>
              <span className="text-[8px] font-mono opacity-50">{Math.round(selectedElement?.x || 0)}, {Math.round(selectedElement?.y || 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center w-full h-full overflow-auto scrollbar-hide">
            <InteractiveEditor loteImages={extraLayers} mainImage={currentMainImage ? { ...currentMainImage, ...currentTransform! } : null} frameSettings={settings} selectedId={selectedId} onSelect={setSelectedId} onUpdateImage={updateTransform} zoom={zoom} />
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme py-1.5 px-6 rounded-full shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-20"></i>
              <input type="range" min="0.05" max="2" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-24 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
              <span className="text-[9px] font-mono opacity-40 min-w-[25px]">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <button disabled={currentIndex === 0} onClick={() => { setCurrentIndex(prev => prev - 1); setSelectedId('main'); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-left text-[9px]"></i></button>
              <span className="text-[10px] font-mono font-black text-theme-accent min-w-[60px] text-center">{mainBatch.length > 0 ? `${currentIndex + 1} / ${mainBatch.length}` : '0 / 0'}</span>
              <button disabled={currentIndex >= mainBatch.length - 1} onClick={() => { setCurrentIndex(prev => prev + 1); setSelectedId('main'); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"><i className="fas fa-chevron-right text-[9px]"></i></button>
            </div>
          </div>
        </div>
      </section>

      <aside className="w-80 border-l bg-theme-side border-theme flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col border-b border-theme overflow-hidden">
          <div className="p-3 bg-black/5 flex justify-between items-center border-b border-theme">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Fila do Lote</span>
            <span className="text-[9px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">{mainBatch.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {mainBatch.map((img, idx) => (
              <div key={img.id} onClick={() => { setCurrentIndex(idx); setSelectedId('main'); }} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${currentIndex === idx ? 'border-theme-accent bg-theme-accent/10' : 'border-transparent opacity-60'}`}>
                <img src={img.previewUrl} className="w-7 h-7 rounded object-cover border border-theme" />
                <span className="text-[9px] font-bold truncate flex-1">{img.file.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Fix: Added explicit casting to File[] for Array.from(e.target.files) to resolve 'unknown' type error in URL.createObjectURL */}
      <input type="file" multiple accept="image/*" className="hidden" ref={mainFileInputRef} onChange={(e) => {
        if (e.target.files) (Array.from(e.target.files) as File[]).forEach(file => {
          const img = new Image(); const url = URL.createObjectURL(file);
          img.onload = () => setMainBatch(prev => [...prev, { id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height }]);
          img.src = url;
        });
      }} />
      {/* Fix: Added explicit casting to File[] for Array.from(e.target.files) to resolve 'unknown' type error in URL.createObjectURL */}
      <input type="file" multiple accept="image/*" className="hidden" ref={extraFileInputRef} onChange={(e) => {
        if (e.target.files) (Array.from(e.target.files) as File[]).forEach(file => {
          const img = new Image(); const url = URL.createObjectURL(file);
          img.onload = () => setExtraLayers(prev => [...prev, { id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height, x: 100, y: 100, scale: 0.15, rotation: 0 }]);
          img.src = url;
        });
      }} />
      <input type="file" accept="image/png" className="hidden" ref={frameInputRef} onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0]; const url = URL.createObjectURL(file);
          const img = new Image(); img.onload = () => setSettings(prev => ({ ...prev, frameImageUrl: url, frameImageName: file.name, canvasWidth: img.width, canvasHeight: img.height }));
          img.src = url;
        }
      }} />
    </div>
  );
};

export default FramingTool;
