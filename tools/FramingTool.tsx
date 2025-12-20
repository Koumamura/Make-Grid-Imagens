
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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

  const selectedElement = useMemo(() => {
    if (selectedId === 'main') return { ...currentMainImage, ...currentTransform };
    return extraLayers.find(img => img.id === selectedId);
  }, [selectedId, currentMainImage, currentTransform, extraLayers]);

  const updateTransform = useCallback((id: string, updates: Partial<BatchItemState | GridImage>) => {
    if (id === 'main' && currentMainImage) {
      setBatchStates(prev => ({ 
        ...prev, 
        [currentMainImage.id]: { 
          ...(prev[currentMainImage.id] || { x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1), y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1), scale: 0.2, rotation: 0 }), 
          ...updates as any 
        } 
      }));
    } else {
      setExtraLayers(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
    }
  }, [currentMainImage, settings]);

  const toggleVisibility = (id: string) => {
    if (id === 'main') {
      // Por enquanto visibilidade para o principal não é estritamente necessária no lote, 
      // mas podemos implementar se desejado.
    } else {
      setExtraLayers(prev => prev.map(img => img.id === id ? { ...img, visible: img.visible === false } : img));
    }
  };

  // Lógica de Escala Suave (Infinite Drag)
  const onScaleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedId || !selectedElement) return;
    
    // Ativa captura de pointer para o elemento
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    
    setIsScaling(true);
    scaleDragRef.current = {
      lastX: e.clientX,
      currentScale: selectedElement.scale || 1
    };

    // Bloqueia seleção e esconde cursor globalmente
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'drag-cursor-none';
    style.innerHTML = '*{ cursor: none !important; user-select: none !important; }';
    document.head.appendChild(style);
  };

  useEffect(() => {
    if (!isScaling) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - scaleDragRef.current.lastX;
      scaleDragRef.current.lastX = e.clientX;
      
      const sensitivity = 0.0035; 
      const newScale = Math.max(0.01, Math.min(10, scaleDragRef.current.currentScale + (deltaX * sensitivity)));
      scaleDragRef.current.currentScale = newScale;
      
      updateTransform(selectedId!, { scale: newScale });
    };

    const handleMouseUp = () => {
      setIsScaling(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = 'default';
      document.getElementById('drag-cursor-none')?.remove();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScaling, selectedId, updateTransform]);

  const removeExtraLayer = (id: string) => {
    setExtraLayers(prev => prev.filter(img => img.id !== id));
    if (selectedId === id) setSelectedId(null);
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
          if (layer.visible === false) return; // Não processa se invisível
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
        
        {/* BARRA DE TRANSFORMAÇÃO DINÂMICA */}
        <div className={`h-14 border-b flex items-center px-6 gap-8 backdrop-blur-xl z-30 transition-all duration-300 ${selectedId ? 'bg-theme-accent/15 border-theme-accent/40 shadow-[inset_0_0_30px_rgba(79,70,229,0.1)]' : 'bg-theme-side/50 border-theme'}`}>
          <div className={`flex items-center gap-8 transition-all duration-500 ${!selectedElement ? 'opacity-5 grayscale pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="flex flex-col gap-1">
              <span className={`text-[7px] font-black uppercase tracking-[0.2em] transition-colors ${selectedId ? 'text-theme-accent' : 'opacity-40'}`}>Scale Precision</span>
              <div 
                onPointerDown={onScaleMouseDown}
                className={`flex items-center gap-3 bg-theme-panel/40 border px-4 py-1.5 rounded-lg cursor-ew-resize transition-all group ${isScaling ? 'border-theme-accent ring-2 ring-theme-accent/20 bg-theme-accent/5' : 'border-theme hover:border-theme-accent/50'}`}
              >
                <i className={`fas fa-expand-alt text-[9px] ${isScaling ? 'text-theme-accent scale-125' : 'opacity-30'} transition-all`}></i>
                <div className="w-24 h-1 bg-theme/20 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-theme-accent transition-all duration-100 shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
                    style={{ width: `${Math.min(100, (selectedElement?.scale || 1) * 20)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-theme-accent font-black w-10 text-right">{Math.round((selectedElement?.scale || 1) * 100)}%</span>
              </div>
            </div>

            <div className={`h-8 w-[1px] transition-colors ${selectedId ? 'bg-theme-accent/30' : 'bg-theme/50'}`}></div>

            <div className="flex flex-col gap-1">
              <span className={`text-[7px] font-black uppercase tracking-[0.2em] transition-colors ${selectedId ? 'text-theme-accent' : 'opacity-40'}`}>Rotation</span>
              <div className="flex gap-1.5 bg-theme-panel/40 p-1 rounded-lg border border-theme">
                <button onClick={() => updateTransform(selectedId!, { rotation: (selectedElement?.rotation || 0) - 15 })} className="w-7 h-7 flex items-center justify-center rounded hover:bg-theme-accent/20 transition-all active:scale-90"><i className="fas fa-undo text-[9px]"></i></button>
                <div className="w-10 flex items-center justify-center text-[10px] font-mono font-black opacity-60">{(selectedElement?.rotation || 0)}°</div>
                <button onClick={() => updateTransform(selectedId!, { rotation: (selectedElement?.rotation || 0) + 15 })} className="w-7 h-7 flex items-center justify-center rounded hover:bg-theme-accent/20 transition-all active:scale-90"><i className="fas fa-redo text-[9px]"></i></button>
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5 ml-auto">
              <span className={`text-[7px] font-black uppercase leading-none transition-colors ${selectedId ? 'text-theme-accent/60' : 'opacity-30'}`}>Global Position</span>
              <span className={`text-[10px] font-mono font-black tracking-tighter ${selectedId ? 'text-theme-accent' : 'text-theme-main opacity-60'}`}>
                X:{Math.round(selectedElement?.x || 0)} <span className="opacity-20 mx-1">/</span> Y:{Math.round(selectedElement?.y || 0)}
              </span>
            </div>
          </div>
          
          {!selectedElement && mainBatch.length > 0 && (
            <div className="flex items-center gap-3 animate-pulse">
              <i className="fas fa-mouse-pointer text-[10px] opacity-20"></i>
              <span className="text-[9px] font-black uppercase opacity-20 tracking-widest text-theme-accent">Selecione uma imagem para editar</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center w-full h-full overflow-auto scrollbar-hide">
            <InteractiveEditor loteImages={extraLayers} mainImage={currentMainImage ? { ...currentMainImage, ...currentTransform! } : null} frameSettings={settings} selectedId={selectedId} onSelect={setSelectedId} onUpdateImage={updateTransform} zoom={zoom} />
          </div>
          
          {/* ZOOM BAR GLASS */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme/40 py-1.5 px-6 rounded-full shadow-2xl backdrop-blur-md z-50">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-20"></i>
              <input type="range" min="0.05" max="2" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-40 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
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
        {/* FILA DO LOTE */}
        <div className="h-1/2 flex flex-col border-b border-theme overflow-hidden">
          <div className="p-3 bg-black/5 flex justify-between items-center border-b border-theme">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Lote Principal</span>
            <span className="text-[9px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">{mainBatch.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {mainBatch.map((img, idx) => (
              <div key={img.id} onClick={() => { setCurrentIndex(idx); setSelectedId('main'); }} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${currentIndex === idx && selectedId === 'main' ? 'border-theme-accent bg-theme-accent/10' : 'border-transparent opacity-60'}`}>
                <img src={img.previewUrl} className="w-7 h-7 rounded object-cover border border-theme" />
                <span className="text-[9px] font-bold truncate flex-1">{img.file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CAMADAS EXTRAS */}
        <div className="h-1/2 flex flex-col overflow-hidden bg-black/5">
          <div className="p-3 bg-black/5 flex justify-between items-center border-b border-theme">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Camadas Extras</span>
            <span className="text-[9px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">{extraLayers.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {extraLayers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                <i className="fas fa-layer-group text-2xl mb-2"></i>
                <p className="text-[8px] font-black uppercase">Nenhum elemento extra</p>
              </div>
            ) : (
              extraLayers.map((img) => (
                <div key={img.id} onClick={() => setSelectedId(img.id)} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer group ${selectedId === img.id ? 'border-theme-accent bg-theme-accent/10' : 'border-transparent opacity-60'}`}>
                  {/* BOTÃO DE VISIBILIDADE */}
                  <button onClick={(e) => { e.stopPropagation(); toggleVisibility(img.id); }} className="p-1 hover:text-theme-accent transition-all">
                    <i className={`fas ${img.visible === false ? 'fa-eye-slash opacity-40' : 'fa-eye'}`}></i>
                  </button>
                  <img src={img.previewUrl} className="w-7 h-7 rounded object-cover border border-theme" />
                  <span className="text-[9px] font-bold truncate flex-1">{img.file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeExtraLayer(img.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <input type="file" multiple accept="image/*" className="hidden" ref={mainFileInputRef} onChange={(e) => {
        if (e.target.files) (Array.from(e.target.files) as File[]).forEach(file => {
          const img = new Image(); const url = URL.createObjectURL(file);
          img.onload = () => setMainBatch(prev => [...prev, { id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height, visible: true }]);
          img.src = url;
        });
      }} />
      <input type="file" multiple accept="image/*" className="hidden" ref={extraFileInputRef} onChange={(e) => {
        if (e.target.files) (Array.from(e.target.files) as File[]).forEach(file => {
          const img = new Image(); const url = URL.createObjectURL(file);
          img.onload = () => setExtraLayers(prev => [...prev, { id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height, x: 100, y: 100, scale: 0.15, rotation: 0, visible: true }]);
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
