
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import Sidebar from '../components/Sidebar';
import GridPreview from '../components/GridPreview';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import { GridImage, GridSettings } from '../types';
import { MiauExportEngine } from '../utils/export';

const PRESETS = [
  { name: 'Quadrado (2K)', w: 2048, h: 2048 },
  { name: 'Quadrado (4K)', w: 4096, h: 4096 },
  { name: 'A4 (300DPI)', w: 2480, h: 3508 },
  { name: 'Insta Story', w: 1080, h: 1920 },
  { name: 'Full HD', w: 1920, h: 1080 }
];

const GridTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(0.3);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [settings, setSettings] = useState<GridSettings>({
    canvasWidth: 2048,
    canvasHeight: 2048,
    columns: 3,
    innerSpacing: 20,
    verticalSpacing: 20,
    outerMargin: 40,
    backgroundColor: '#0f172a',
    isTransparent: false,
    layoutMode: 'grid',
    itemScale: 0,
    targetShape: 'square',
    showCuttingGuides: false,
    showSilhouetteMarks: false,
    guideOffset: 5,
    guideLength: 30,
    guideThickness: 2,
    guideColor: '#4f46e5',
    makerMode: false,
    makerRepeat: 10,
    alignment: 'center'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const makerInputRef = useRef<HTMLInputElement>(null);

  const applyPreset = (w: number, h: number) => {
    setSettings(prev => ({ ...prev, canvasWidth: w, canvasHeight: h }));
  };

  const processFiles = async (files: File[], isMaker: boolean = false) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const filteredFiles = files.filter(file => validTypes.includes(file.type));
    const newImages: GridImage[] = [];

    for (const file of filteredFiles) {
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
        });

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
        console.error("Erro ao processar imagem:", file.name);
      }
    }

    if (newImages.length > 0) {
      if (isMaker) {
        setImages([newImages[0]]);
        setSettings(prev => ({ ...prev, makerMode: true, layoutMode: 'auto' }));
      } else {
        setImages(prev => [...prev, ...newImages]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let filesArray = Array.from(e.target.files) as File[];
      processFiles(filesArray);
    }
    if (e.target) e.target.value = '';
  };

  const handleMakerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles([e.target.files[0]], true);
    }
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(img => img.id !== id);
    });
    if (images.length <= 1) setSettings(prev => ({ ...prev, makerMode: false }));
  };

  const toggleActive = (id: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, isActive: !img.isActive } : img));
  };

  const updateActiveCount = (count: number) => {
    setImages(prev => prev.map((img, idx) => ({
      ...img,
      isActive: idx < count
    })));
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...images];
    const draggedItem = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedItem);
    setImages(newImages);
  };

  const handleExport = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    setIsProcessing(true);
    try {
      const customName = settings.exportFilename?.trim();
      const fileName = `${customName || `grid_miau_${Date.now()}`}.png`;
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      if (downloadIndividual) {
        await MiauExportEngine.saveImage(dataUrl, fileName);
      }
      
      if (downloadZip) {
        const zip = new JSZip();
        zip.file(fileName, dataUrl.split(',')[1], { base64: true });
        const content = await zip.generateAsync({ type: "blob" });
        await MiauExportEngine.saveZip(content, `grid_pack_miau_${Date.now()}.zip`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = useCallback(() => {
    images.forEach(img => { if (img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
    setImages([]); setOffset({ x: 0, y: 0 }); setZoom(0.3);
    setSettings(prev => ({ ...prev, makerMode: false }));
  }, [images]);

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 flex-shrink-0 border-r flex flex-col bg-theme-side border-theme">
        <div className="p-4 border-b border-theme bg-black/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Tamanho da Grid</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(p => (
              <button 
                key={p.name} 
                onClick={() => applyPreset(p.w, p.h)}
                className="text-[8px] font-black uppercase p-2 border border-theme rounded-lg bg-theme-panel hover:bg-theme-accent hover:text-white transition-all"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <Sidebar 
          settings={settings} 
          onSettingsChange={setSettings} 
          onAddFile={() => fileInputRef.current?.click()}
          onAddFolder={() => folderInputRef.current?.click()}
          onAddMaker={() => makerInputRef.current?.click()}
          images={images}
          onUpdateActiveCount={updateActiveCount}
          exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }}
          onExport={handleExport}
          isProcessing={isProcessing}
        />
      </aside>

      <section 
        className="flex-1 overflow-hidden relative flex flex-col"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Header 
          itemCount={images.length} 
          onClear={clearAll} 
          onExport={handleExport}
          isProcessing={isProcessing}
        />
        
        <div className="flex-1 relative flex flex-col items-center justify-center bg-black/5 overflow-hidden">
          {isDraggingOver && (
            <div className="absolute inset-0 z-[100] bg-theme-accent/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-theme-accent m-4 rounded-[3rem] animate-in fade-in zoom-in duration-300 pointer-events-none">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-theme-accent text-white flex items-center justify-center text-3xl shadow-2xl animate-bounce">
                  <i className="fas fa-file-import"></i>
                </div>
                <p className="text-xl font-black uppercase tracking-widest text-theme-accent">Solte para Adicionar</p>
              </div>
            </div>
          )}

          <div className="flex-1 w-full h-full">
            <GridPreview 
              images={images} 
              settings={settings} 
              zoom={zoom} 
              offset={offset}
              onOffsetChange={setOffset}
            />
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-theme-side/90 border border-theme/40 py-2.5 px-8 rounded-full shadow-2xl backdrop-blur-xl z-50">
            <div className="flex items-center gap-4 pr-8 border-r border-theme/30">
              <i className="fas fa-search text-[10px] opacity-30"></i>
              <input type="range" min="0.01" max="1" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-48 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
              <span className="text-[10px] font-mono opacity-40 w-12 text-center">{Math.round(zoom * 100)}%</span>
            </div>
            <button onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(0.3); }} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main transition-all group active:scale-90" title="Reset Viewport">
              <i className="fas fa-undo-alt text-[10px] opacity-40 group-hover:opacity-100 group-hover:rotate-[-45deg] transition-all"></i>
            </button>
          </div>
        </div>
      </section>

      <aside className="w-80 flex-shrink-0 border-l overflow-hidden flex flex-col bg-theme-side border-theme">
        <div className="p-4 border-b font-black text-[10px] uppercase tracking-[0.2em] flex justify-between items-center text-theme-muted bg-black/5">
          <span>Item Manager</span>
          <i className="fas fa-layer-group opacity-30"></i>
        </div>
        <ImageList 
          images={images} 
          onRemove={removeImage} 
          onMove={() => {}}
          onToggleActive={toggleActive}
          onReorder={handleReorder}
        />
      </aside>

      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <input type="file" {...({ webkitdirectory: "" } as any)} className="hidden" ref={folderInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" className="hidden" ref={makerInputRef} onChange={handleMakerChange} />
    </div>
  );
};

export default GridTool;
