
import React, { useState, useRef } from 'react';
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
  const [settings, setSettings] = useState<GridSettings>({
    canvasWidth: 2048,
    canvasHeight: 2048,
    columns: 3,
    innerSpacing: 5,
    outerMargin: 5,
    backgroundColor: '#0f172a',
    isTransparent: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const newImagesPromises = files
      .filter(file => validTypes.includes(file.type))
      .map(file => {
        return new Promise<GridImage>((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            resolve({
              id: uuidv4(),
              file,
              previewUrl: url,
              width: img.width,
              height: img.height,
              aspectRatio: img.width / img.height
            });
          };
          img.src = url;
        });
      });

    const newImages = await Promise.all(newImagesPromises);
    setImages(prev => [...prev, ...newImages]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let filesArray = Array.from(e.target.files) as File[];
      
      if (e.target === folderInputRef.current) {
        filesArray = filesArray.filter(file => {
          const path = ((file as any).webkitRelativePath || '').replace(/\\/g, '/');
          const segments = path.split('/').filter((s: string) => s.length > 0);
          return segments.length === 2;
        });
      }
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
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    }

    if (downloadZip) {
      const zip = new JSZip();
      const base64Data = dataUrl.split(',')[1];
      zip.file(fileName, base64Data, { base64: true });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `grid_pack_${Date.now()}.zip`;
      link.click();
    }
  };

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja remover todos os itens?')) {
      images.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      setImages([]);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <aside className="w-80 flex-shrink-0 border-r overflow-y-auto bg-theme-side border-theme">
        <Sidebar 
          settings={settings} 
          onSettingsChange={setSettings} 
          onAddFile={() => fileInputRef.current?.click()}
          onAddFolder={() => folderInputRef.current?.click()}
          images={images}
          exportOptions={{
            downloadIndividual,
            setDownloadIndividual,
            downloadZip,
            setDownloadZip
          }}
          onExport={handleExport}
        />
      </aside>

      <section className="flex-1 overflow-hidden relative flex flex-col bg-theme-main">
        <Header itemCount={images.length} onClear={clearAll} />
        <div className="flex-1 relative flex items-center justify-center p-8 bg-black/5">
          <GridPreview images={images} settings={settings} />
        </div>
      </section>

      <aside className="w-80 flex-shrink-0 border-l overflow-hidden flex flex-col bg-theme-side border-theme">
        <div className="p-4 border-b font-black text-[10px] uppercase tracking-widest flex justify-between items-center text-theme-muted bg-black/5">
          <span>Galeria da Grid</span>
          <span className="text-[9px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded">
            {images.length}
          </span>
        </div>
        <ImageList 
          images={images} 
          onRemove={removeImage} 
          onMove={moveImage}
        />
      </aside>

      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <input 
        type="file" 
        {...({ webkitdirectory: "" } as any)} 
        className="hidden" 
        ref={folderInputRef} 
        onChange={handleFileChange} 
      />
    </div>
  );
};

export default GridTool;
