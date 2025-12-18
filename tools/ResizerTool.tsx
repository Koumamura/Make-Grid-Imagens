
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SidebarResizer from '../components/SidebarResizer';
import ImageList from '../components/ImageList';
import Header from '../components/Header';
import { GridImage } from '../types';

export type ResizeMode = 'fit' | 'fill' | 'stretch';

const ResizerTool: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [settings, setSettings] = useState({
    width: 1080,
    height: 1080,
    mode: 'fit' as ResizeMode,
    lockAspectRatio: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Added explicit cast to File[] to resolve 'unknown' type error with URL.createObjectURL
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
  };

  const currentImg = images[selectedIdx];

  return (
    <div className="flex-1 flex overflow-hidden bg-theme-main">
      <aside className="w-80 border-r flex flex-col bg-theme-side border-theme">
        <SidebarResizer 
          settings={settings} 
          onSettingsChange={setSettings} 
          onAdd={() => fileInputRef.current?.click()}
          onDownloadAll={() => alert('Download em massa iniciado...')}
        />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        <Header itemCount={images.length} onClear={() => setImages([])} />
        <div className="flex-1 flex items-center justify-center p-12 relative">
          {currentImg ? (
            <div className="relative group transition-all duration-500 shadow-2xl border border-theme"
                 style={{ 
                   width: settings.width * 0.4, 
                   height: settings.height * 0.4,
                   backgroundColor: 'var(--bg-panel)'
                 }}>
              <img 
                src={currentImg.previewUrl} 
                className={`w-full h-full ${settings.mode === 'fit' ? 'object-contain' : settings.mode === 'fill' ? 'object-cover' : 'object-fill'}`}
                alt="Preview" 
              />
              <div className="absolute -top-10 left-0 text-[10px] font-black uppercase opacity-40">Visualização de Saída</div>
            </div>
          ) : (
            <div className="text-center opacity-20">
              <i className="fas fa-expand-arrows-alt text-8xl mb-4"></i>
              <p className="font-black uppercase tracking-[0.2em]">Aguardando Imagens</p>
            </div>
          )}
        </div>
      </section>

      <aside className="w-80 border-l bg-theme-side border-theme flex flex-col">
        <div className="p-3 border-b border-theme font-black text-[10px] uppercase tracking-widest text-theme-muted">
          Fila de Processamento
        </div>
        <ImageList 
          images={images} 
          onRemove={(id) => setImages(images.filter(img => img.id !== id))}
          onMove={() => {}} 
        />
      </aside>
      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
};

export default ResizerTool;
