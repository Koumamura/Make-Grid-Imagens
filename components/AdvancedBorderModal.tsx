
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AdvancedBorderSettings, PatternPreset, GradientStop } from '../types';
import MiauSlider from './MiauSlider';

interface AdvancedBorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdvancedBorderSettings;
  onUpdate: (s: AdvancedBorderSettings) => void;
  baseImage: { url: string, width: number, height: number } | null;
}

const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = size / 4;
  let rot = (Math.PI / 2) * 3;
  let x = 0;
  let y = 0;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(0, -outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = Math.cos(rot) * outerRadius;
    y = Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = Math.cos(rot) * innerRadius;
    y = Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(0, -outerRadius);
  ctx.closePath();
};

const drawCatPawClassic = (ctx: CanvasRenderingContext2D, size: number) => {
  const s = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, s * 0.2, s * 0.65, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const toeRadius = s * 0.22;
  ctx.beginPath(); ctx.arc(-s * 0.5, -s * 0.25, toeRadius, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-s * 0.18, -s * 0.5, toeRadius, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.18, -s * 0.5, toeRadius, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.25, toeRadius, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

const PresetThumbnail: React.FC<{ settings: AdvancedBorderSettings }> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const customImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (settings.shapeType === 'custom' && settings.customShapeUrl) {
      const img = new Image();
      img.src = settings.customShapeUrl;
      img.onload = () => {
        customImgRef.current = img;
        render();
      };
    } else {
      render();
    }

    function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const size = 64; canvas.width = size; canvas.height = size;
      const s = size / 520; ctx.clearRect(0, 0, size, size);
      
      if (settings.backgroundType === 'solid') {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, size, size);
      } else {
        const angle = (settings.gradientAngle * Math.PI) / 180;
        const grad = ctx.createLinearGradient(
          size/2 - Math.cos(angle) * size/2, size/2 - Math.sin(angle) * size/2,
          size/2 + Math.cos(angle) * size/2, size/2 + Math.sin(angle) * size/2
        );
        settings.gradientStops.forEach(st => grad.addColorStop(st.offset, st.color));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }

      const drawShapeInternal = (c: CanvasRenderingContext2D, type: string, sz: number) => {
        if (type === 'none') return;
        const h = sz / 2; c.beginPath();
        if (type === 'circle') c.arc(0, 0, h, 0, Math.PI * 2);
        else if (type === 'square') c.rect(-h, -h, sz, sz);
        else if (type === 'triangle') { c.moveTo(0, -h); c.lineTo(h, h); c.lineTo(-h, h); c.closePath(); }
        else if (type === 'x') { c.moveTo(-h, -h); c.lineTo(h, h); c.moveTo(h, -h); c.lineTo(-h, h); c.lineWidth = sz / 4; c.strokeStyle = c.fillStyle; c.stroke(); return; }
        else if (type === 'heart') { 
          const hr = sz * 0.4; c.moveTo(0, hr); 
          c.bezierCurveTo(-sz * 0.7, -sz * 0.1, -sz * 0.5, -sz * 0.9, 0, -sz * 0.4);
          c.bezierCurveTo(sz * 0.5, -sz * 0.9, sz * 0.7, -sz * 0.1, 0, hr);
        }
        else if (type === 'diamond') { c.moveTo(0, -h); c.lineTo(h, 0); c.lineTo(0, h); c.lineTo(-h, 0); c.closePath(); }
        else if (type === 'star') { drawStar(c, sz); }
        else if (type === 'pata') { drawCatPawClassic(c, sz); return; }
        else if (type === 'custom' && customImgRef.current) {
          c.drawImage(customImgRef.current, -h, -h, sz, sz);
          return;
        }
        c.fill();
      };

      if (settings.gridEnabled) {
        ctx.save(); ctx.translate(size / 2 + (settings.offsetX * s), size / 2 + (settings.offsetY * s)); ctx.rotate((settings.globalRotation * Math.PI) / 180); ctx.translate(-size / 2, -size / 2); ctx.fillStyle = settings.color;
        const stepX = (settings.size + settings.spacingX) * s; const stepY = (settings.size + settings.spacingY) * s; const dSize = settings.size * s;
        for (let x = -size; x < size * 2; x += stepX) { for (let y = -size; y < size * 2; y += stepY) { ctx.save(); ctx.translate(x, y); ctx.rotate((settings.individualRotation * Math.PI) / 180); drawShapeInternal(ctx, settings.shapeType, dSize); ctx.restore(); } }
        ctx.restore();
      }
    }
  }, [settings]);
  return <canvas ref={canvasRef} className="w-10 h-10 rounded-lg shadow-inner bg-black/20 border border-white/10" />;
};

const AdvancedBorderModal: React.FC<AdvancedBorderModalProps> = ({ isOpen, onClose, settings, onUpdate, baseImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientBarRef = useRef<HTMLDivElement>(null);
  const customShapeInputRef = useRef<HTMLInputElement>(null);
  const [guideImg, setGuideImg] = useState<HTMLImageElement | null>(null);
  const [customShapeImg, setCustomShapeImg] = useState<HTMLImageElement | null>(null);
  const [presets, setPresets] = useState<PatternPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isNamingOpen, setIsNamingOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [activeStopId, setActiveStopId] = useState<string | null>(settings.gradientStops[0]?.id || null);
  const [isDraggingStop, setIsDraggingStop] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('miau_pattern_presets');
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  const savePresets = (newPresets: PatternPreset[]) => { setPresets(newPresets); localStorage.setItem('miau_pattern_presets', JSON.stringify(newPresets)); };

  const previewScale = useMemo(() => { if (!baseImage) return 1; return 520 / Math.max(baseImage.width, baseImage.height); }, [baseImage]);
  
  const shapes: { id: AdvancedBorderSettings['shapeType'], icon: string, customClass?: string }[] = [
    { id: 'none', icon: 'fa-border-none', customClass: 'opacity-50' },
    { id: 'circle', icon: 'fa-circle' }, 
    { id: 'square', icon: 'fa-square' }, 
    { id: 'triangle', icon: 'fa-caret-up' },
    { id: 'x', icon: 'fa-times' }, 
    { id: 'heart', icon: 'fa-heart' }, 
    { id: 'diamond', icon: 'fa-clone' },
    { id: 'star', icon: 'fa-star' },
    { id: 'pata', icon: 'fa-paw' }
  ];

  useEffect(() => { if (baseImage?.url) { const img = new Image(); img.src = baseImage.url; img.onload = () => setGuideImg(img); } }, [baseImage?.url]);
  
  useEffect(() => {
    if (settings.customShapeUrl) {
      const img = new Image();
      img.src = settings.customShapeUrl;
      img.onload = () => setCustomShapeImg(img);
    } else {
      setCustomShapeImg(null);
    }
  }, [settings.customShapeUrl]);

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, type: string, size: number) => {
    if (type === 'none') return;
    const s = size / 2; ctx.beginPath();
    if (type === 'circle') ctx.arc(0, 0, s, 0, Math.PI * 2);
    else if (type === 'square') ctx.rect(-s, -s, size, size);
    else if (type === 'triangle') { ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); }
    else if (type === 'x') { ctx.moveTo(-s, -s); ctx.lineTo(s, s); ctx.moveTo(s, -s); ctx.lineTo(-s, s); ctx.lineWidth = size / 4; ctx.strokeStyle = ctx.fillStyle; ctx.stroke(); return; }
    else if (type === 'heart') {
      const hr = size * 0.4; ctx.moveTo(0, hr);
      ctx.bezierCurveTo(-size * 0.7, -size * 0.1, -size * 0.5, -size * 0.9, 0, -size * 0.4);
      ctx.bezierCurveTo(size * 0.5, -size * 0.9, size * 0.7, -size * 0.1, 0, hr);
    } else if (type === 'diamond') { ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath(); }
    else if (type === 'star') { drawStar(ctx, size); }
    else if (type === 'pata') { drawCatPawClassic(ctx, size); return; }
    else if (type === 'custom' && customShapeImg) {
      ctx.drawImage(customShapeImg, -s, -s, size, size);
      return;
    }
    ctx.fill();
  }, [customShapeImg]);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = 520, h = 520; canvas.width = w; canvas.height = h; const s = previewScale; ctx.clearRect(0, 0, w, h);
    
    // Background Layer
    ctx.save();
    if (settings.backgroundType === 'solid') {
      ctx.fillStyle = settings.bgColor;
      ctx.fillRect(0, 0, w, h);
    } else {
      const angle = (settings.gradientAngle * Math.PI) / 180;
      const x1 = w/2 - Math.cos(angle) * w/2;
      const y1 = h/2 - Math.sin(angle) * h/2;
      const x2 = w/2 + Math.cos(angle) * w/2;
      const y2 = h/2 + Math.sin(angle) * h/2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      settings.gradientStops.forEach(st => grad.addColorStop(st.offset, st.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    // Pattern Layer
    if (settings.gridEnabled) {
      ctx.save(); ctx.translate(w / 2 + (settings.offsetX * s), h / 2 + (settings.offsetY * s)); ctx.rotate((settings.globalRotation * Math.PI) / 180); ctx.translate(-w / 2, -h / 2); ctx.fillStyle = settings.color;
      const stepX = (settings.size + settings.spacingX) * s; const stepY = (settings.size + settings.spacingY) * s; const drawSize = settings.size * s;
      for (let x = -w; x < w * 2; x += stepX) { for (let y = -h; y < h * 2; y += stepY) { ctx.save(); ctx.translate(x, y); ctx.rotate((settings.individualRotation * Math.PI) / 180); drawShape(ctx, settings.shapeType, drawSize); ctx.restore(); } }
      ctx.restore();
    }
    
    if (guideImg) { ctx.save(); ctx.globalAlpha = 0.4; const ratio = Math.min(350 / guideImg.width, 350 / guideImg.height); const dw = guideImg.width * ratio, dh = guideImg.height * ratio; ctx.drawImage(guideImg, (w - dw) / 2, (h - dh) / 2, dw, dh); ctx.restore(); }
  }, [settings, guideImg, previewScale, drawShape]);

  useEffect(() => { if (isOpen) renderPreview(); }, [isOpen, renderPreview]);

  const handleSaveClick = () => { if (selectedPresetId) { setIsNamingOpen(true); const current = presets.find(p => p.id === selectedPresetId); setNewPresetName(current?.name || ''); } else { setIsNamingOpen(true); setNewPresetName(`Pattern ${presets.length + 1}`); } };
  const handleFinalSave = (overwrite: boolean) => { if (overwrite && selectedPresetId) { const updated = presets.map(p => p.id === selectedPresetId ? { ...p, settings, name: newPresetName } : p); savePresets(updated); } else { const newPreset: PatternPreset = { id: uuidv4(), name: newPresetName, settings: { ...settings }, createdAt: Date.now() }; savePresets([newPreset, ...presets]); setSelectedPresetId(newPreset.id); } setIsNamingOpen(false); };
  const deletePreset = (e: React.MouseEvent, id: string) => { e.stopPropagation(); savePresets(presets.filter(p => p.id !== id)); if (selectedPresetId === id) setSelectedPresetId(null); };

  const addGradientStop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (isDraggingStop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const id = uuidv4();
    const newStop: GradientStop = { id, color: '#ffffff', offset };
    const newStops = [...settings.gradientStops, newStop].sort((a,b) => a.offset - b.offset);
    onUpdate({ ...settings, gradientStops: newStops });
    setActiveStopId(id);
  };

  const removeGradientStop = (id: string) => {
    if (settings.gradientStops.length <= 2) return;
    const newStops = settings.gradientStops.filter(s => s.id !== id);
    onUpdate({ ...settings, gradientStops: newStops });
    if (activeStopId === id) setActiveStopId(newStops[0].id);
  };

  const updateStopOffset = useCallback((id: string, offset: number) => {
    const newStops = settings.gradientStops.map(s => s.id === id ? { ...s, offset } : s);
    onUpdate({ ...settings, gradientStops: newStops });
  }, [settings, onUpdate]);

  const updateStopColor = (id: string, color: string) => {
    const newStops = settings.gradientStops.map(s => s.id === id ? { ...s, color } : s);
    onUpdate({ ...settings, gradientStops: newStops });
  };

  const handleStopMouseDown = (e: React.MouseEvent, stopId: string) => {
    e.stopPropagation();
    setActiveStopId(stopId);
    setIsDraggingStop(true);
    const bar = gradientBarRef.current;
    if (!bar) return;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = bar.getBoundingClientRect();
      const newOffset = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      updateStopOffset(stopId, newOffset);
    };
    const handleMouseUp = () => {
      setIsDraggingStop(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleCustomShapeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdate({ ...settings, shapeType: 'custom', customShapeUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const gradientCSS = useMemo(() => {
    const sortedStops = [...settings.gradientStops].sort((a,b) => a.offset - b.offset);
    return `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`;
  }, [settings.gradientStops]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
      <div className="bg-theme-side border border-theme w-full max-w-7xl rounded-[3rem] shadow-2xl flex overflow-hidden h-[90vh] relative">
        <aside className="w-64 border-r border-theme/30 flex flex-col bg-black/10">
          <div className="p-6 border-b border-theme/20"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Miau Patterns</h3><h4 className="text-sm font-black uppercase text-theme-accent">Biblioteca</h4></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {presets.length === 0 ? (<div className="h-40 flex flex-col items-center justify-center text-center opacity-20 p-4"><i className="fas fa-layer-group text-2xl mb-2"></i><p className="text-[9px] font-black uppercase">Nenhum padrão salvo</p></div>) : (presets.map(p => (<div key={p.id} onClick={() => { onUpdate(p.settings); setSelectedPresetId(p.id); }} className={`group flex items-center gap-3 p-2 rounded-2xl border transition-all cursor-pointer ${selectedPresetId === p.id ? 'bg-theme-accent/10 border-theme-accent' : 'bg-theme-panel/20 border-transparent hover:border-theme'}`}><PresetThumbnail settings={p.settings} /><div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase truncate text-theme-main">{p.name}</p><p className="text-[7px] opacity-40 uppercase">Design #{p.id.slice(0,4)}</p></div><button onClick={(e) => deletePreset(e, p.id)} className="opacity-0 group-hover:opacity-100 p-2 text-theme-muted hover:text-red-500 transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button></div>)))}
          </div>
          <div className="p-4 border-t border-theme/20 bg-theme-panel/10"><button onClick={handleSaveClick} className="w-full py-3.5 rounded-2xl bg-theme-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-theme-accent/90 transition-all flex items-center justify-center gap-2"><i className="fas fa-bookmark"></i>{selectedPresetId ? 'Atualizar Estampa' : 'Salvar Estampa'}</button></div>
        </aside>

        <div className="flex-1 bg-black/5 flex flex-col items-center justify-center relative p-10 gap-6">
           <div className="absolute top-8 left-8 flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-theme-accent flex items-center justify-center text-white shadow-lg rotate-3"><i className="fas fa-wand-magic-sparkles"></i></div><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Editor Pro</span><span className="text-xl font-black tracking-tighter uppercase">{selectedPresetId ? presets.find(p=>p.id===selectedPresetId)?.name : 'Novo Padrão'}</span></div></div>
           <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/5 bg-theme-panel/20 p-2"><canvas ref={canvasRef} className="block rounded-[2rem] shadow-inner" /></div>
        </div>

        <div className="w-[400px] p-8 flex flex-col gap-6 overflow-y-auto bg-theme-side custom-scrollbar border-l border-theme/30">
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => onUpdate({ ...settings, enabled: !settings.enabled })} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all ${settings.enabled ? 'bg-green-500 text-white' : 'bg-theme-accent text-white'}`}><i className={`fas ${settings.enabled ? 'fa-check-circle' : 'fa-power-off'}`}></i>{settings.enabled ? 'Estampa Ativa' : 'Aplicar Estampa'}</button>
            <button onClick={onClose} className="ml-4 w-12 h-12 rounded-2xl bg-theme-panel hover:bg-red-500 hover:text-white text-theme-main transition-all flex items-center justify-center shadow-lg"><i className="fas fa-times"></i></button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 bg-theme-panel/20 p-4 rounded-2xl border border-theme/50">
              <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Forma da Estampa</label>
              <div className="grid grid-cols-5 gap-2">
                {shapes.map(s => (
                  <button key={s.id} onClick={() => onUpdate({ ...settings, shapeType: s.id })} className={`h-10 rounded-xl border flex items-center justify-center text-md transition-all ${settings.shapeType === s.id ? 'bg-theme-accent text-white border-theme-accent shadow-lg scale-105' : 'bg-theme-panel border-theme opacity-30 hover:opacity-100 hover:bg-theme-panel/50'}`}>
                    <i className={`fas ${s.icon} ${s.customClass || ''}`}></i>
                  </button>
                ))}
                <button onClick={() => customShapeInputRef.current?.click()} className={`h-10 rounded-xl border flex items-center justify-center text-md transition-all ${settings.shapeType === 'custom' ? 'bg-theme-accent text-white border-theme-accent shadow-lg scale-105' : 'bg-theme-panel border-theme opacity-30 hover:opacity-100 hover:bg-theme-panel/50'}`}><i className="fas fa-image"></i></button>
                <input type="file" ref={customShapeInputRef} className="hidden" accept="image/png, image/webp" onChange={handleCustomShapeUpload} />
              </div>
              <div className="pt-2"><label className="text-[8px] font-black uppercase opacity-40">Cor da Forma</label><input type="color" value={settings.color} onChange={(e) => onUpdate({ ...settings, color: e.target.value })} className="w-full h-8 rounded-lg border border-theme mt-1 bg-theme-panel cursor-pointer" /></div>
            </div>

            <div className="space-y-4 bg-theme-panel/20 p-5 rounded-3xl border border-theme/50">
              <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase tracking-widest text-theme-accent">Fundo da Estampa</h4><div className="flex bg-black/20 p-1 rounded-lg border border-theme/30"><button onClick={() => onUpdate({ ...settings, backgroundType: 'solid' })} className={`px-3 py-1 text-[8px] font-black rounded ${settings.backgroundType === 'solid' ? 'bg-theme-accent text-white shadow' : 'opacity-30'}`}>SOLID</button><button onClick={() => onUpdate({ ...settings, backgroundType: 'gradient' })} className={`px-3 py-1 text-[8px] font-black rounded ${settings.backgroundType === 'gradient' ? 'bg-theme-accent text-white shadow' : 'opacity-30'}`}>GRADIENT</button></div></div>
              {settings.backgroundType === 'solid' ? (<div className="animate-in fade-in duration-300"><label className="text-[8px] font-black uppercase opacity-40 block mb-1">Cor do Fundo</label><input type="color" value={settings.bgColor} onChange={(e) => onUpdate({ ...settings, bgColor: e.target.value })} className="w-full h-12 rounded-2xl border border-theme bg-theme-panel cursor-pointer p-1" /></div>) : (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3"><label className="text-[8px] font-black uppercase opacity-40 block mb-1">Editor de Degradê</label>
                    <div ref={gradientBarRef} onMouseDown={addGradientStop} className="relative h-10 w-full mb-8 rounded-xl border-2 border-white/5 shadow-2xl cursor-copy" style={{ background: gradientCSS }}>
                      {settings.gradientStops.map(stop => (<div key={stop.id} onMouseDown={(e) => handleStopMouseDown(e, stop.id)} onClick={(e) => e.stopPropagation()} className={`absolute top-1/2 -translate-y-1/2 w-5 h-8 rounded-md border-2 shadow-2xl cursor-ew-resize transition-transform hover:scale-110 active:scale-125 ${activeStopId === stop.id ? 'border-white ring-4 ring-theme-accent/40 z-50' : 'border-black/50 opacity-80 z-10'}`} style={{ left: `calc(${stop.offset * 100}% - 10px)`, backgroundColor: stop.color }}><div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-theme-accent transition-opacity ${activeStopId === stop.id ? 'opacity-100' : 'opacity-0'}`}></div></div>))}
                    </div>
                    <div className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-theme/30"><input type="color" value={settings.gradientStops.find(s => s.id === activeStopId)?.color || '#ffffff'} onChange={(e) => activeStopId && updateStopColor(activeStopId, e.target.value)} className="w-10 h-10 rounded-xl bg-theme-panel border border-theme cursor-pointer p-1 transition-transform hover:scale-105" /><div className="flex-1"><span className="text-[9px] font-black uppercase text-theme-accent">Cor do Ponto</span><p className="text-[7px] opacity-40 uppercase">Ajuste o marcador ativo</p></div><button onClick={() => activeStopId && removeGradientStop(activeStopId)} disabled={settings.gradientStops.length <= 2} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-10 shadow-lg"><i className="fas fa-trash-alt text-[10px]"></i></button></div>
                  </div>
                  <MiauSlider label="Direção das Cores" min={0} max={360} value={settings.gradientAngle} onChange={(v) => onUpdate({...settings, gradientAngle: v})} unit="°" icon="fa-compass" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-theme/20 pb-2"><h4 className="text-[10px] font-black uppercase tracking-widest text-theme-accent">Grid Engine</h4><button onClick={() => onUpdate({ ...settings, gridEnabled: !settings.gridEnabled })} className={`w-8 h-4 rounded-full relative transition-all ${settings.gridEnabled ? 'bg-theme-accent' : 'bg-theme-panel'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.gridEnabled ? 'right-0.5' : 'left-0.5'}`}></div></button></div>
              <div className={`space-y-4 transition-all ${!settings.gridEnabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                 <MiauSlider label="Tamanho da Forma" min={2} max={200} value={settings.size} onChange={(v) => onUpdate({...settings, size: v})} icon="fa-expand" />
                 <div className="grid grid-cols-2 gap-4">
                   <MiauSlider label="Espaço X" min={0} max={200} value={settings.spacingX} onChange={(v) => onUpdate({...settings, spacingX: v})} icon="fa-arrows-h" />
                   <MiauSlider label="Espaço Y" min={0} max={200} value={settings.spacingY} onChange={(v) => onUpdate({...settings, spacingY: v})} icon="fa-arrows-v" />
                 </div>
                 <MiauSlider label="Rotação da Forma" min={0} max={360} value={settings.individualRotation} onChange={(v) => onUpdate({...settings, individualRotation: v})} unit="°" icon="fa-sync-alt" />
                 <MiauSlider label="Giro Global" min={0} max={360} value={settings.globalRotation} onChange={(v) => onUpdate({...settings, globalRotation: v})} unit="°" icon="fa-redo" />
                 <div className="grid grid-cols-2 gap-4">
                   <MiauSlider label="Offset X" min={-500} max={500} value={settings.offsetX} onChange={(v) => onUpdate({...settings, offsetX: v})} icon="fa-arrows-alt-h" />
                   <MiauSlider label="Offset Y" min={-500} max={500} value={settings.offsetY} onChange={(v) => onUpdate({...settings, offsetY: v})} icon="fa-arrows-alt-v" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {isNamingOpen && (
          <div className="absolute inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-theme-side border border-theme-accent w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(79,70,229,0.3)] flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-theme-accent flex items-center justify-center text-white text-2xl shadow-xl animate-bounce"><i className="fas fa-bookmark"></i></div>
              <div className="text-center"><h3 className="text-xl font-black uppercase tracking-tighter text-theme-main">Nomear Padrão</h3><p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Sua biblioteca pessoal Miau</p></div>
              <input type="text" autoFocus value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFinalSave(false)} className="w-full bg-theme-panel border border-theme px-6 py-4 rounded-2xl outline-none focus:border-theme-accent text-sm font-bold transition-all text-center" placeholder="Ex: Minha Borda Estrelada" />
              <div className="w-full flex flex-col gap-3">{selectedPresetId ? (<div className="grid grid-cols-2 gap-3 w-full"><button onClick={() => handleFinalSave(true)} className="py-4 rounded-2xl bg-theme-accent text-white font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Atualizar Atual</button><button onClick={() => handleFinalSave(false)} className="py-4 rounded-2xl bg-theme-panel border border-theme text-theme-main font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Novo Registro</button></div>) : (<button onClick={() => handleFinalSave(false)} className="w-full py-4 rounded-2xl bg-theme-accent text-white font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Salvar na Biblioteca</button>)}<button onClick={() => setIsNamingOpen(false)} className="w-full py-3 rounded-2xl text-[9px] font-black uppercase opacity-30 hover:opacity-100 transition-all">Cancelar</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedBorderModal;
