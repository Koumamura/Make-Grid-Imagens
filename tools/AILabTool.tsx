
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import SidebarAILab from '../components/SidebarAILab';
import HistorySidebar from '../components/HistorySidebar';
import Header from '../components/Header';
import { GridImage, AISettings, HistoryState } from '../types';
import { MiauExportEngine } from '../utils/export';

const INITIAL_SETTINGS: AISettings = {
  mode: 'enhance', sharpness: 0, noiseReduction: 0, brightness: 100, contrast: 100, aiIntensity: 70, edgeSmoothness: 2, smartSharpen: false, highPassRadius: 1.5, isAdvancedSharpen: false, highFreqRadius: 1.2, highFreqOpacity: 100, lowFreqRadius: 8.0, lowFreqOpacity: 50
};

const AILabTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentHistoryIdx, setCurrentHistoryIdx] = useState(-1);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const [isComparing, setIsComparing] = useState(true);
  const [baseImageLayer, setBaseImageLayer] = useState<string | null>(null);
  const [aiEnhancedLayer, setAiEnhancedLayer] = useState<string | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings>(INITIAL_SETTINGS);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentImg = images[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>(r => { const i = new Image(); i.onload = () => r(i); i.src = url; });
      setImages([{ id: uuidv4(), file, previewUrl: url, width: img.width, height: img.height, aspectRatio: img.width / img.height, isActive: true, visible: true }]);
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d'); if (ctx) { ctx.drawImage(img, 0, 0); const dataUrl = canvas.toDataURL('image/png'); setBaseImageLayer(dataUrl); setAiEnhancedLayer(null); addToHistory(dataUrl, "Arquivo Original"); }
    }
  };

  const addToHistory = (url: string, label: string) => {
    const newState = { id: uuidv4(), url, label, timestamp: Date.now(), settingsSnapshot: { ...aiSettings } };
    const newHistory = [...history.slice(0, currentHistoryIdx + 1), newState];
    setHistory(newHistory); setCurrentHistoryIdx(newHistory.length - 1);
  };

  const getFilterString = () => {
    const s = aiSettings.sharpness; const sharpen = s > 0 ? `contrast(${100 + s/2.5}%) brightness(${100 - s/25}%) saturate(${100 + s/10}%)` : '';
    const blur = aiSettings.noiseReduction > 0 ? `blur(${aiSettings.noiseReduction/30}px)` : '';
    return `brightness(${aiSettings.brightness}%) contrast(${aiSettings.contrast}%) ${sharpen} ${blur}`;
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main relative">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme overflow-y-auto custom-scrollbar">
        <SidebarAILab settings={aiSettings} onSettingsChange={setAiSettings} onAdd={() => fileInputRef.current?.click()} onProcess={() => {}} onBakeManual={() => {}} onSave={() => {}} isProcessing={isProcessing} hasManualChanges={false} />
      </aside>
      <section className={`flex-1 flex flex-col overflow-hidden relative select-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`} onMouseDown={(e) => e.button === 1 && (e.preventDefault(), setIsPanning(true))} onMouseMove={(e) => isPanning && setOffset({ x: offset.x + e.movementX, y: offset.y + e.movementY })} onMouseUp={(e) => e.button === 1 && setIsPanning(false)} onMouseLeave={() => setIsPanning(false)}>
        <Header itemCount={images.length} onClear={() => setImages([])} />
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-hidden bg-black/5">
          {baseImageLayer && currentImg && (
            <div className="relative shadow-2xl border border-theme bg-theme-panel transition-all duration-75 rounded-none overflow-hidden" style={{ width: currentImg.width * zoom, height: currentImg.height * zoom, transform: `translate(${offset.x}px, ${offset.y}px)` }}>
              <img src={history[0]?.url || baseImageLayer} className="absolute inset-0 w-full h-full object-cover" alt="original" />
              <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: isComparing ? `inset(0 0 0 ${compareSplit}%)` : 'none' }}>
                <img src={aiEnhancedLayer || baseImageLayer} className="absolute inset-0 w-full h-full object-cover" style={{ filter: getFilterString() }} alt="enhanced" />
              </div>
              {isComparing && (<><div className="absolute top-0 bottom-0 w-0.5 bg-theme-accent z-10" style={{ left: `${compareSplit}%` }} /><input type="range" min="0" max="100" value={compareSplit} onChange={(e) => setCompareSplit(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" /></>)}
            </div>
          )}
        </div>
        {baseImageLayer && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-theme-side/90 border border-theme px-6 py-2 rounded-full shadow-2xl backdrop-blur-md z-50">
            <div className="flex items-center gap-3 pr-6 border-r border-theme/50"><i className="fas fa-search text-[10px] opacity-30"></i><input type="range" min="0.05" max="2" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-24 h-1 bg-theme-accent/10 rounded-lg appearance-none cursor-pointer accent-theme-accent" /></div>
            <button onClick={() => setIsComparing(!isComparing)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${isComparing ? 'bg-theme-accent text-white' : 'bg-theme-panel opacity-40'}`}>Comparar</button>
            <button onClick={() => {setOffset({x:0,y:0}); setZoom(0.4);}} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-theme-accent/20 text-theme-muted transition-all"><i className="fas fa-undo text-[9px]"></i></button>
          </div>
        )}
      </section>
      <HistorySidebar history={history} currentIndex={currentHistoryIdx} onRestore={(idx) => setCurrentHistoryIdx(idx)} isOpen={isHistoryOpen} onToggle={() => setIsHistoryOpen(!isHistoryOpen)} />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
};

export default AILabTool;
