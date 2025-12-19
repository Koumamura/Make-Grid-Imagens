
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import SidebarResizer from '../components/SidebarResizer';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import { GridImage } from '../types';

export type ResizeMode = 'fit' | 'fill' | 'stretch';
export type ResizeMethod = 'fixed' | 'proportional';

const ResizerTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [downloadIndividual, setDownloadIndividual] = useState(true);
  const [downloadZip, setDownloadZip] = useState(false);

  const [settings, setSettings] = useState({
    width: 1080,
    height: 1080,
    mode: 'fit' as ResizeMode,
    lockAspectRatio: true,
    boundSize: 1080,
    boundType: 'max' as 'max' | 'min',
    activeMethod: 'fixed' as ResizeMethod
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          setImages(prev => [...prev, {
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
    if (e.target) e.target.value = '';
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleSave = async () => {
    if (images.length === 0) return;
    
    const isProportional = settings.activeMethod === 'proportional';
    if (isProportional && (!settings.boundSize || settings.boundSize <= 0)) {
      alert("Por favor, defina um Tamanho Alvo maior que 0 para a ação proporcional.");
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const zip = downloadZip ? new JSZip() : null;

    try {
      for (let i = 0; i < images.length; i++) {
        setProcessProgress(i + 1);
        const item = images[i];
        
        // Sempre carrega do previewUrl original para garantir qualidade não-destrutiva
        const imgObj = await loadImage(item.previewUrl);
        
        let finalWidth = settings.width;
        let finalHeight = settings.height;
        let drawW = finalWidth;
        let drawH = finalHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (isProportional) {
          const isWidthLarger = item.width >= item.height;
          const size = settings.boundSize;

          if (settings.boundType === 'max') {
            if (isWidthLarger) {
              finalWidth = size;
              finalHeight = size / item.aspectRatio;
            } else {
              finalHeight = size;
              finalWidth = size * item.aspectRatio;
            }
          } else {
            // Modo Mínimo
            if (isWidthLarger) {
              finalHeight = size;
              finalWidth = size * item.aspectRatio;
            } else {
              finalWidth = size;
              finalHeight = size / item.aspectRatio;
            }
          }
          drawW = finalWidth;
          drawH = finalHeight;
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!isProportional) {
          if (settings.mode === 'fit') {
            const ratio = Math.min(canvas.width / item.width, canvas.height / item.height);
            drawW = item.width * ratio;
            drawH = item.height * ratio;
            offsetX = (canvas.width - drawW) / 2;
            offsetY = (canvas.height - drawH) / 2;
          } else if (settings.mode === 'fill') {
            const ratio = Math.max(canvas.width / item.width, canvas.height / item.height);
            drawW = item.width * ratio;
            drawH = item.height * ratio;
            offsetX = (canvas.width - drawW) / 2;
            offsetY = (canvas.height - drawH) / 2;
          }
        }

        ctx.drawImage(imgObj, offsetX, offsetY, drawW, drawH);

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const prefix = isProportional ? `prop_${settings.boundType}_` : `fixed_`;
        const fileName = `${prefix}${item.file.name.split('.')[0]}.png`;

        if (downloadIndividual) {
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          await new Promise(r => setTimeout(r, 400));
        }

        if (zip) {
          const base64Data = dataUrl.split(',')[1];
          zip.file(fileName, base64Data, { base64: true });
        }
      }

      if (zip) {
        const content = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `miau_bulk_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao processar lote.");
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
    }
  };

  const currentImg = images[selectedIdx];

  const clearAll = () => {
    if (window.confirm('Limpar fila?')) {
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      setSelectedIdx(0);
    }
  };

  // Cálculo de preview dinâmico para o componente de visualização
  const getPreviewSize = () => {
    if (!currentImg) return { w: 1080, h: 1080 };
    if (settings.activeMethod === 'fixed') return { w: settings.width, h: settings.height };
    
    // Preview proporcional
    const size = settings.boundSize || 1080;
    const isWidthLarger = currentImg.width >= currentImg.height;
    if (settings.boundType === 'max') {
       return isWidthLarger ? { w: size, h: size / currentImg.aspectRatio } : { w: size * currentImg.aspectRatio, h: size };
    } else {
       return isWidthLarger ? { w: size * currentImg.aspectRatio, h: size } : { w: size, h: size / currentImg.aspectRatio };
    }
  };

  const preview = getPreviewSize();

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme overflow-y-auto">
        <SidebarResizer 
          settings={settings} 
          onSettingsChange={setSettings} 
          onAdd={() => fileInputRef.current?.click()}
          onSave={handleSave}
          isProcessing={isProcessing}
          progress={processProgress}
          total={images.length}
          exportOptions={{
            downloadIndividual,
            setDownloadIndividual,
            downloadZip,
            setDownloadZip
          }}
        />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden relative">
        <Header itemCount={images.length} onClear={clearAll} />
        
        <div className="flex-1 flex items-center justify-center p-12 overflow-hidden bg-black/5 relative">
          {currentImg ? (
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
               <div 
                className="relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-theme bg-theme-panel group overflow-hidden transition-all duration-300"
                style={{ 
                   width: Math.min(preview.w * 0.4, 600), 
                   height: Math.min(preview.h * 0.4, 600),
                   maxWidth: '80vw',
                   maxHeight: '70vh',
                   backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)',
                   backgroundSize: '20px 20px'
                 }}>
                <img 
                  src={currentImg.previewUrl} 
                  className={`w-full h-full transition-all duration-300 ${settings.activeMethod === 'proportional' ? 'object-contain' : settings.mode === 'fit' ? 'object-contain' : settings.mode === 'fill' ? 'object-cover' : 'object-fill'}`}
                  alt="Preview" 
                />
                <div className="absolute inset-0 border-2 border-theme-accent/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest bg-theme-panel px-4 py-1.5 rounded-full border border-theme shadow-sm">
                   Preview do Resultado • {Math.round(preview.w)}x{Math.round(preview.h)} px
                </p>
                <p className="text-[8px] font-bold opacity-20 uppercase tracking-tight">Fonte Original: {currentImg.width}x{currentImg.height} px</p>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-10 flex flex-col items-center gap-4">
              <i className="fas fa-compress-arrows-alt text-9xl"></i>
              <p className="font-black text-2xl uppercase tracking-[0.3em]">Resizer Engine</p>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-theme-side/90 border border-theme px-6 py-2 rounded-full shadow-2xl backdrop-blur-md">
            <button 
              disabled={selectedIdx === 0}
              onClick={() => setSelectedIdx(prev => prev - 1)}
              className="w-8 h-8 rounded-full hover:bg-theme-accent/10 disabled:opacity-10 transition-all flex items-center justify-center"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <span className="text-[10px] font-mono font-black text-theme-accent min-w-[60px] text-center">
              {selectedIdx + 1} / {images.length}
            </span>
            <button 
              disabled={selectedIdx >= images.length - 1}
              onClick={() => setSelectedIdx(prev => prev + 1)}
              className="w-8 h-8 rounded-full hover:bg-theme-accent/10 disabled:opacity-10 transition-all flex items-center justify-center"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        )}
      </section>

      <aside className="w-80 border-l bg-theme-side border-theme flex flex-col overflow-hidden">
        <div className="p-4 border-b border-theme font-black text-[10px] uppercase tracking-widest text-theme-muted bg-black/5 flex justify-between items-center">
          <span>Lote de Imagens</span>
          <span className="text-[9px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">{images.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ImageList 
            images={images} 
            onRemove={(id) => {
               const idx = images.findIndex(img => img.id === id);
               if (idx <= selectedIdx && selectedIdx > 0) setSelectedIdx(selectedIdx - 1);
               setImages(images.filter(img => img.id !== id));
            }}
            onMove={() => {}} 
          />
        </div>
      </aside>
      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
};

export default ResizerTool;
