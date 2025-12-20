
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import Sidebar from '../components/Sidebar';
import GridPreview from '../components/GridPreview';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import { GridImage, GridSettings } from '../types';

const GridTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);
  const [zoom, setZoom] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState<GridSettings>({
    canvasWidth: 2048,
    canvasHeight: 2048,
    columns: 3,
    innerSpacing: 5,
    outerMargin: 5,
    backgroundColor: '#0f172a',
    isTransparent: false,
    layoutMode: 'grid',
    itemScale: 0,
    targetShape: 'square'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
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
          isActive: true, // Por padrão todos entram ativos
          visible: true
        });
      } catch (err) {
        console.error("Erro ao processar imagem:", file.name);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let filesArray = Array.from(e.target.files) as File[];
      processFiles(filesArray);
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(img => img.id !== id);
    });
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

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const handleExport = async () => {
    const canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const fileName = `grid_${Date.now()}.png`;
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    if (downloadIndividual) {
      const link = document.createElement('a');
      link.download = fileName; link.href = dataUrl; link.click();
    }
    if (downloadZip) {
      const zip = new JSZip();
      zip.file(fileName, dataUrl.split(',')[1], { base64: true });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `grid_miau_${Date.now()}.zip`; link.click();
    }
  };

  const clearAll = useCallback(() => {
    images.forEach(img => { if (img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
    setImages([]); setOffset({ x: 0, y: 0 }); setZoom(0.4);
  }, [images]);

  const activeCount = images.filter(img => img.isActive).length;

  return (
    <div className="flex-1 flex overflow-hidden">
      <aside className="w-80 flex-shrink-0 border-r overflow-y-auto bg-theme-side border-theme">
        <Sidebar 
          settings={settings} 
          onSettingsChange={setSettings} 
          onAddFile={() => fileInputRef.current?.click()}
          onAddFolder={() => folderInputRef.current?.click()}
          images={images}
          onUpdateActiveCount={updateActiveCount}
          exportOptions={{ downloadIndividual, setDownloadIndividual, downloadZip, setDownloadZip }}
          onExport={handleExport}
        />
      </aside>

      <section className="flex-1 overflow-hidden relative flex flex-col bg-theme-main">
        <Header itemCount={images.length} onClear={clearAll} />
        
        <div className="flex-1 relative flex flex-col items-center justify-center bg-black/5 overflow-hidden">
          <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
            <GridPreview 
              images={images} 
              settings={settings} 
              zoom={zoom} 
              offset={offset}
              onOffsetChange={setOffset}
            />
          </div>

          {/* PAINEL DE INFO DINÂMICO - MOVIDO PARA A MESMA ALTURA DO ZOOM (BOTTOM-8) */}
          {images.length > 0 && (
            <div className="absolute bottom-8 left-8 flex flex-col items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-700 pointer-events-none z-50">
              <div className="flex items-center gap-4 bg-theme-side/90 border border-theme/40 px-4 py-2 rounded-full shadow-2xl backdrop-blur-3xl">
                <div className="flex flex-col items-start leading-none gap-1">
                  <span className="text-[6px] font-black uppercase opacity-30 tracking-[0.2em]">ENGINE</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${settings.layoutMode === 'auto' ? 'bg-theme-accent animate-pulse' : 'bg-theme-muted'}`}></div>
                    <span className="text-[9px] font-mono font-bold opacity-60">
                      {settings.layoutMode === 'auto' ? 'Auto-Flow' : 'Manual'}
                    </span>
                  </div>
                </div>
                
                <div className="w-[1px] h-6 bg-theme/30"></div>
                
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[6px] font-black uppercase text-theme-accent tracking-widest">Canvas Final</span>
                  <span className="text-[10px] font-mono font-black text-theme-accent tracking-tighter">
                    {Math.round(settings.canvasWidth)}<span className="opacity-40 mx-0.5">×</span>{settings.layoutMode === 'auto' ? 'Dinâmica' : settings.canvasHeight}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW CONTROLLER */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme/40 py-1.5 px-6 rounded-full shadow-2xl backdrop-blur-md z-50">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-20"></i>
              <input type="range" min="0.05" max="2" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-40 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" />
              <span className="text-[9px] font-mono opacity-40 w-10">{Math.round(zoom * 100)}%</span>
            </div>
            <button onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(0.4); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main transition-all group" title="Reset View">
              <i className="fas fa-undo-alt text-[9px] opacity-40 group-hover:opacity-100"></i>
            </button>
          </div>
        </div>
      </section>

      <aside className="w-80 flex-shrink-0 border-l overflow-hidden flex flex-col bg-theme-side border-theme">
        <div className="p-4 border-b font-black text-[10px] uppercase tracking-widest flex justify-between items-center text-theme-muted bg-black/5">
          <span>Gerenciador de Itens</span>
          <i className="fas fa-list-ul opacity-40"></i>
        </div>
        <ImageList 
          images={images} 
          onRemove={removeImage} 
          onMove={moveImage}
          onToggleActive={toggleActive}
        />
      </aside>

      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <input type="file" {...({ webkitdirectory: "" } as any)} className="hidden" ref={folderInputRef} onChange={handleFileChange} />
    </div>
  );
};

export default GridTool;
