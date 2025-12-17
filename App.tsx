
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import GridPreview from './components/GridPreview';
import ImageList from './components/ImageList';
import Header from './components/Header';
import { GridImage, GridSettings } from './types';

const App: React.FC = () => {
  const [images, setImages] = useState<GridImage[]>([]);
  const [settings, setSettings] = useState<GridSettings>({
    canvasWidth: 2048,
    canvasHeight: 2048,
    columns: 3,
    innerSpacing: 5,
    outerMargin: 5,
    backgroundColor: '#ffffff'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const newImagesPromises = Array.from(files)
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
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja remover todos os itens?')) {
      setImages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header itemCount={images.length} onClear={clearAll} />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar Left: Settings */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto">
          <Sidebar 
            settings={settings} 
            onSettingsChange={setSettings} 
            onAddFile={() => fileInputRef.current?.click()}
            onAddFolder={() => folderInputRef.current?.click()}
            images={images}
          />
        </div>

        {/* Center: Preview */}
        <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-8 bg-slate-100">
           <GridPreview images={images} settings={settings} />
        </div>

        {/* Sidebar Right: Image List */}
        <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
            <span>Ordem das Imagens</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{images.length} itens</span>
          </div>
          <ImageList 
            images={images} 
            onRemove={removeImage} 
            onMove={moveImage}
          />
        </div>
      </main>

      {/* Hidden inputs */}
      <input 
        type="file" 
        multiple 
        accept=".jpg,.jpeg,.png,.webp" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        webkitdirectory="" 
        // @ts-ignore
        directory="" 
        className="hidden" 
        ref={folderInputRef} 
        onChange={handleFileChange} 
      />
    </div>
  );
};

export default App;
