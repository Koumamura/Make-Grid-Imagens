
import React, { useState, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SidebarFraming from '../components/SidebarFraming';
import InteractiveEditor from '../components/InteractiveEditor';
import Header from '../components/Header';
import { GridImage, FrameSettings } from '../types';

interface BatchItemState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const FramingTool: React.FC = () => {
  const [mainBatch, setMainBatch] = useState<GridImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [batchStates, setBatchStates] = useState<Record<string, BatchItemState>>({});
  const [autoSave, setAutoSave] = useState(true);
  const [extraLayers, setExtraLayers] = useState<GridImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.4); // Zoom da visualização (40% default)
  
  const [settings, setSettings] = useState<FrameSettings>({
    borderWidth: 20,
    borderColor: '#ffffff',
    borderRadius: 0,
    padding: 0,
    shadow: 10,
    canvasWidth: 1080,
    canvasHeight: 1080
  });

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);

  const currentMainImage = mainBatch[currentIndex];

  const currentTransform = useMemo(() => {
    if (!currentMainImage) return null;
    return batchStates[currentMainImage.id] || {
      x: (settings.canvasWidth / 2) - (currentMainImage.width * 0.1),
      y: (settings.canvasHeight / 2) - (currentMainImage.height * 0.1),
      scale: 0.2,
      rotation: 0
    };
  }, [currentMainImage, batchStates, settings.canvasWidth, settings.canvasHeight]);

  const selectedElement = useMemo(() => {
    if (selectedId === 'main') return { ...currentMainImage, ...currentTransform };
    return extraLayers.find(img => img.id === selectedId);
  }, [selectedId, currentMainImage, currentTransform, extraLayers]);

  const handleMainFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          setMainBatch(prev => [...prev, {
            id: uuidv4(),
            file,
            previewUrl: url,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          }]);
        };
        img.src = url;
      });
    }
  };

  const handleExtraFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          setExtraLayers(prev => [...prev, {
            id: uuidv4(),
            file,
            previewUrl: url,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            x: 100,
            y: 100,
            scale: 0.15,
            rotation: 0
          }]);
        };
        img.src = url;
      });
    }
  };

  const handleFrameFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      const img = new Image();
      img.onload = () => {
        setSettings(prev => ({
          ...prev,
          frameImageUrl: url,
          frameImageName: file.name,
          canvasWidth: img.width,
          canvasHeight: img.height
        }));
      };
      img.src = url;
    }
    if (e.target) e.target.value = '';
  };

  const updateTransform = (id: string, updates: Partial<BatchItemState | GridImage>) => {
    if (id === 'main' && currentMainImage) {
      setBatchStates(prev => ({
        ...prev,
        [currentMainImage.id]: { ...currentTransform!, ...updates as any }
      }));
    } else {
      setExtraLayers(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
    }
  };

  const handleNext = () => {
    if (currentIndex < mainBatch.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedId('main');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedId('main');
    }
  };

  const clearAll = () => {
    if (window.confirm('Limpar projeto?')) {
      setMainBatch([]);
      setExtraLayers([]);
      setBatchStates({});
      setCurrentIndex(0);
      setSelectedId(null);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme overflow-y-auto">
        <SidebarFraming 
          settings={settings} 
          onSettingsChange={setSettings} 
          onAddLote={() => mainFileInputRef.current?.click()}
          onAddExtras={() => extraFileInputRef.current?.click()}
          onAddFrame={() => frameInputRef.current?.click()}
          autoSave={autoSave}
          onAutoSaveChange={setAutoSave}
        />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden bg-theme-main relative">
        <Header itemCount={mainBatch.length + extraLayers.length} onClear={clearAll} />
        
        {/* TOOLBAR DE TRANSFORMAÇÃO */}
        <div className="h-14 border-b border-theme flex items-center px-6 gap-8 bg-theme-side/30 backdrop-blur-sm">
          <div className={`flex items-center gap-8 transition-all duration-300 ${!selectedElement ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase opacity-40">Posição Atual</span>
              <div className="flex gap-3 font-mono text-[10px] mt-1">
                <span className="opacity-40">X:</span> <span className="text-theme-accent font-bold">{Math.round(selectedElement?.x || 0)}</span>
                <span className="opacity-40 ml-1">Y:</span> <span className="text-theme-accent font-bold">{Math.round(selectedElement?.y || 0)}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase opacity-40">Dimensão</span>
              <div className="flex gap-2 font-mono text-[10px] mt-1">
                <span className="opacity-40">W:</span> <span>{Math.round((selectedElement?.width || 0) * (selectedElement?.scale || 1))}px</span>
              </div>
            </div>

            <div className="w-40 flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase opacity-40">Escala do Elemento</span>
                <span className="text-[10px] font-mono text-theme-accent font-black">{Math.round((selectedElement?.scale || 1) * 100)}%</span>
              </div>
              <input 
                type="range" min="0.01" max="3" step="0.01"
                value={selectedElement?.scale || 1}
                onChange={(e) => updateTransform(selectedId!, { scale: parseFloat(e.target.value) })}
                className="w-full h-1 bg-theme-accent/20 rounded-lg appearance-none cursor-pointer accent-theme-accent"
              />
            </div>

            <div className="flex gap-1.5 pl-4 border-l border-theme">
              <button onClick={() => updateTransform(selectedId!, { rotation: (selectedElement?.rotation || 0) - 90 })} className="w-8 h-8 flex items-center justify-center border border-theme rounded hover:bg-theme-accent/10 transition-colors"><i className="fas fa-undo text-[10px]"></i></button>
              <button onClick={() => updateTransform(selectedId!, { rotation: (selectedElement?.rotation || 0) + 90 })} className="w-8 h-8 flex items-center justify-center border border-theme rounded hover:bg-theme-accent/10 transition-colors"><i className="fas fa-redo text-[10px]"></i></button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center w-full h-full overflow-auto scrollbar-hide">
            <InteractiveEditor 
              loteImages={extraLayers}
              mainImage={currentMainImage ? { ...currentMainImage, ...currentTransform! } : null}
              frameSettings={settings}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateImage={updateTransform}
              zoom={zoom}
            />
          </div>
          
          {/* BARRA DE CONTROLE UNIFICADA E DISCRETA */}
          <div className="mt-8 flex items-center gap-6 bg-theme-side/80 border border-theme py-1.5 px-6 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* ZOOM DISCRETO */}
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50">
              <i className="fas fa-search text-[10px] opacity-20"></i>
              <input 
                type="range" min="0.05" max="1.5" step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent"
              />
              <span className="text-[9px] font-mono opacity-40 min-w-[25px]">{Math.round(zoom * 100)}%</span>
            </div>

            {/* NAVEGAÇÃO CENTRAL */}
            <div className="flex items-center gap-4">
              <button 
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"
              >
                <i className="fas fa-chevron-left text-[9px]"></i>
              </button>
              
              <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-[10px] font-mono font-black text-theme-accent">
                  {mainBatch.length > 0 ? `${currentIndex + 1} / ${mainBatch.length}` : '0 / 0'}
                </span>
              </div>

              <button 
                disabled={currentIndex >= mainBatch.length - 1}
                onClick={handleNext}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-main disabled:opacity-10 transition-all"
              >
                <i className="fas fa-chevron-right text-[9px]"></i>
              </button>
            </div>

            {/* DIMENSÕES DISCRETAS */}
            <div className="flex items-center gap-3 pl-6 border-l border-theme/50">
              <i className="fas fa-expand-alt text-[10px] opacity-20"></i>
              <div className="flex items-baseline gap-1 font-mono text-[10px] opacity-50">
                <span className="font-bold">{settings.canvasWidth}</span>
                <span className="opacity-30 text-[8px]">×</span>
                <span className="font-bold">{settings.canvasHeight}</span>
                <span className="text-[8px] opacity-40 ml-0.5">px</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <aside className="w-80 border-l bg-theme-side border-theme flex flex-col">
        <div className="flex-1 flex flex-col border-b border-theme overflow-hidden">
          <div className="p-4 bg-black/5 flex justify-between items-center border-b border-theme">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Fila do Lote</span>
            <span className="text-[9px] font-mono bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">{mainBatch.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {mainBatch.map((img, idx) => (
              <div 
                key={img.id}
                onClick={() => { setCurrentIndex(idx); setSelectedId('main'); }}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${currentIndex === idx ? 'border-theme-accent bg-theme-accent/10 shadow-sm' : 'border-transparent hover:bg-black/5 opacity-60'}`}
              >
                <img src={img.previewUrl} className="w-8 h-8 rounded object-cover border border-theme" />
                <span className="text-[10px] font-bold truncate flex-1">{img.file.name}</span>
                {currentIndex === idx && <i className="fas fa-play text-theme-accent text-[8px]"></i>}
              </div>
            ))}
          </div>
        </div>

        <div className="h-1/3 flex flex-col overflow-hidden bg-black/5">
          <div className="p-4 bg-black/5 flex justify-between items-center border-b border-theme">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Extras</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {extraLayers.map(img => (
              <div 
                key={img.id}
                onClick={() => setSelectedId(img.id)}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${selectedId === img.id ? 'border-theme-accent bg-theme-accent/5' : 'border-theme bg-theme-panel'}`}
              >
                <img src={img.previewUrl} className="w-8 h-8 rounded object-cover border border-theme" />
                <span className="text-[10px] font-medium truncate flex-1">{img.file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setExtraLayers(extraLayers.filter(l => l.id !== img.id)); if(selectedId === img.id) setSelectedId(null); }} className="text-theme-muted hover:text-red-500 transition-colors"><i className="fas fa-times text-[10px]"></i></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <input type="file" multiple accept="image/*" className="hidden" ref={mainFileInputRef} onChange={handleMainFiles} />
      <input type="file" multiple accept="image/*" className="hidden" ref={extraFileInputRef} onChange={handleExtraFiles} />
      <input type="file" accept="image/png" className="hidden" ref={frameInputRef} onChange={handleFrameFile} />
    </div>
  );
};

export default FramingTool;
