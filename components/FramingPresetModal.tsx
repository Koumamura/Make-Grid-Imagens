
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FramingPreset, FrameSettings, GridImage } from '../types';

interface FramingPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FrameSettings;
  currentExtraLayers: GridImage[];
  onLoadPreset: (preset: FramingPreset) => void;
}

const FramingPresetModal: React.FC<FramingPresetModalProps> = ({ isOpen, onClose, currentSettings, currentExtraLayers, onLoadPreset }) => {
  const [presets, setPresets] = useState<FramingPreset[]>([]);
  const [isNaming, setIsNaming] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('miau_framing_presets');
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  const saveToLocalStorage = (newPresets: FramingPreset[]) => {
    setPresets(newPresets);
    localStorage.setItem('miau_framing_presets', JSON.stringify(newPresets));
  };

  const fileToDataUrl = (file: File | string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'string') {
        // Se já for uma URL (blob ou externa), tenta buscar e converter
        fetch(file)
          .then(r => r.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;

    try {
      const extraLayersData = await Promise.all(currentExtraLayers.map(async l => ({
        id: uuidv4(),
        dataUrl: await fileToDataUrl(l.file || l.previewUrl),
        width: l.width,
        height: l.height,
        aspectRatio: l.aspectRatio,
        x: l.x || 0,
        y: l.y || 0,
        scale: l.scale || 1,
        rotation: l.rotation || 0,
        name: l.file?.name || 'extra_layer',
        visible: l.visible !== false, // Salva o estado de visibilidade
        aboveFrame: l.aboveFrame !== false // Salva se está acima ou abaixo
      })));

      let frameImageDataUrl = undefined;
      if (currentSettings.frameImageUrl) {
        frameImageDataUrl = await fileToDataUrl(currentSettings.frameImageUrl);
      }

      const newPreset: FramingPreset = {
        id: uuidv4(),
        name: presetName,
        timestamp: Date.now(),
        settings: { ...currentSettings, frameImageUrl: undefined }, // Não salvamos o blob URL volátil
        extraLayers: extraLayersData,
        frameImageDataUrl
      };

      saveToLocalStorage([newPreset, ...presets]);
      setIsNaming(false);
      setPresetName('');
    } catch (err) {
      console.error('Erro ao salvar preset:', err);
      alert('Houve um erro ao processar as imagens do preset. Certifique-se de que os arquivos extras ainda estão disponíveis.');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    saveToLocalStorage(presets.filter(p => p.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-theme-side border border-theme rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden h-[80vh]">
        <div className="p-8 border-b border-theme flex items-center justify-between bg-black/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-theme-accent flex items-center justify-center text-white shadow-lg"><i className="fas fa-bookmark"></i></div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Biblioteca de Estilos</h3>
              <p className="text-[10px] opacity-40 uppercase tracking-widest">Salve resoluções, molduras e elementos extras</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsNaming(true)} 
              className="px-6 py-2.5 rounded-xl bg-theme-accent text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> Novo Preset
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-theme-panel text-theme-muted hover:text-red-500 transition-all"><i className="fas fa-times"></i></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-3 gap-6 custom-scrollbar">
          {presets.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center text-center opacity-20 py-20">
              <i className="fas fa-folder-open text-6xl mb-4"></i>
              <p className="text-sm font-black uppercase">Nenhum preset salvo ainda</p>
            </div>
          ) : (
            presets.map(p => (
              <div 
                key={p.id} 
                onClick={() => onLoadPreset(p)} 
                className="group relative cursor-pointer bg-theme-panel/30 border border-theme rounded-3xl p-5 hover:border-theme-accent transition-all flex flex-col gap-4 active:scale-95"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-theme-accent tracking-widest">Design</p>
                    <h4 className="text-sm font-black truncate max-w-[150px] uppercase tracking-tighter">{p.name}</h4>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, p.id)} 
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-center">
                    <p className="text-[7px] font-black uppercase opacity-30">Extras</p>
                    <p className="text-[11px] font-black font-mono">{p.extraLayers.length}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-center">
                    <p className="text-[7px] font-black uppercase opacity-30">Resolução</p>
                    <p className="text-[9px] font-black font-mono">{p.settings.canvasWidth}x{p.settings.canvasHeight}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-theme/30 opacity-40 group-hover:opacity-100 transition-all">
                  <i className={`fas ${p.frameImageDataUrl || p.settings.frameImageUrl ? 'fa-border-all' : 'fa-border-none'} text-[10px]`}></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">{p.frameImageDataUrl ? 'Moldura de Imagem' : 'Bordas Dinâmicas'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {isNaming && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-theme-side border border-theme-accent w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(79,70,229,0.3)] flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-theme-accent flex items-center justify-center text-white text-2xl shadow-xl animate-bounce"><i className="fas fa-bookmark"></i></div>
              <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-tighter text-theme-main">Salvar Preset</h3>
                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Defina um nome para este estilo</p>
              </div>
              <input 
                type="text" 
                autoFocus 
                value={presetName} 
                onChange={(e) => setPresetName(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()} 
                className="w-full bg-theme-panel border border-theme px-6 py-4 rounded-2xl outline-none focus:border-theme-accent text-sm font-bold transition-all text-center" 
                placeholder="Ex: Minimalista Red" 
              />
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={handleSavePreset} 
                  className="w-full py-4 rounded-2xl bg-theme-accent text-white font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Confirmar Registro
                </button>
                <button onClick={() => setIsNaming(false)} className="w-full py-3 rounded-2xl text-[9px] font-black uppercase opacity-30 hover:opacity-100 transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FramingPresetModal;
