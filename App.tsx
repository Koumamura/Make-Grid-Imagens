
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
      
      // Lógica rigorosa para importação de pasta
      if (e.target === folderInputRef.current) {
        filesArray = filesArray.filter(file => {
          // Normaliza o caminho para usar barras frontais (compatibilidade cross-platform)
          const path = ((file as any).webkitRelativePath || '').replace(/\\/g, '/');
          
          // Remove strings vazias resultantes de barras duplas ou iniciais/finais
          const segments = path.split('/').filter((s: string) => s.length > 0);
          
          // Se o usuário seleciona uma pasta "Fotos", um arquivo na raiz dela será "Fotos/imagem.jpg"
          // Isso resulta em EXATAMENTE 2 segmentos. Qualquer coisa > 2 está em subpasta.
          return segments.length === 2;
        });

        if (filesArray.length === 0) {
          alert("Nenhuma imagem encontrada na raiz da pasta selecionada (subpastas foram ignoradas).");
        }
      }
      
      processFiles(filesArray);
    }
    // Reseta o valor para permitir selecionar a mesma pasta/arquivos novamente
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

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja remover todos os itens?')) {
      // Limpeza profunda de memória
      images.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      setImages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200">
      <Header itemCount={images.length} onClear={clearAll} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Left: Settings */}
        <aside className="w-80 flex-shrink-0 border-r border-slate-800 bg-slate-900 p-6 overflow-y-auto">
          <Sidebar 
            settings={settings} 
            onSettingsChange={setSettings} 
            onAddFile={() => fileInputRef.current?.click()}
            onAddFolder={() => folderInputRef.current?.click()}
            images={images}
          />
        </aside>

        {/* Center: Preview */}
        <section className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-8 bg-slate-950">
           <GridPreview images={images} settings={settings} />
        </section>

        {/* Sidebar Right: Image List */}
        <aside className="w-80 flex-shrink-0 border-l border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 font-semibold text-slate-200 flex justify-between items-center bg-slate-900/50">
            <span>Ordem das Imagens</span>
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">
              {images.length} itens
            </span>
          </div>
          <ImageList 
            images={images} 
            onRemove={removeImage} 
            onMove={moveImage}
          />
        </aside>
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
