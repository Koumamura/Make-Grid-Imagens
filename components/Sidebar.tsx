
import React, { useRef } from 'react';
import { GridSettings, GridImage } from '../types';

interface SidebarProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  images: GridImage[];
}

const Sidebar: React.FC<SidebarProps> = ({ settings, onSettingsChange, onAddFile, onAddFolder, images }) => {
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof GridSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Revoga URL anterior se existir para evitar vazamento de memória
      if (settings.backgroundImageUrl) URL.revokeObjectURL(settings.backgroundImageUrl);
      
      const url = URL.createObjectURL(e.target.files[0]);
      onSettingsChange({
        ...settings,
        backgroundImageUrl: url,
        isTransparent: false // Desativa transparência ao colocar imagem
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleDownload = () => {
    const canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `grid-collage-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const removeBgImage = () => {
    if (settings.backgroundImageUrl) {
      URL.revokeObjectURL(settings.backgroundImageUrl);
      handleChange('backgroundImageUrl', undefined);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Upload Actions */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Adicionar Conteúdo</h3>
        <button 
          onClick={onAddFile}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
        >
          <i className="fas fa-plus-circle"></i>
          Arquivos Individuais
        </button>
        <div className="space-y-2">
          <button 
            onClick={onAddFolder}
            title="O navegador irá escanear toda a pasta. O programa filtrará automaticamente para exibir apenas os arquivos da raiz, mas o tempo de carregamento inicial depende do tamanho total da pasta selecionada."
            className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 py-2.5 px-4 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <i className="fas fa-folder"></i>
            Importar Pasta
          </button>
          <p className="text-[9px] text-slate-500 px-1 leading-tight">
            <i className="fas fa-info-circle mr-1"></i>
            Arquivos em subpastas serão ignorados após o carregamento.
          </p>
        </div>
      </div>

      {/* Grid Configuration */}
      <div className="space-y-5">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Dimensões e Grid</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Largura</label>
            <input 
              type="number" 
              value={settings.canvasWidth} 
              onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Altura</label>
            <input 
              type="number" 
              value={settings.canvasHeight} 
              onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Colunas</label>
            <span className="text-xs font-mono text-indigo-400 font-bold">{settings.columns}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={settings.columns} 
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Espaçamento</label>
            <span className="text-xs font-mono text-indigo-400 font-bold">{settings.innerSpacing}px</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={settings.innerSpacing} 
            onChange={(e) => handleChange('innerSpacing', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Margem Borda</label>
            <span className="text-xs font-mono text-indigo-400 font-bold">{settings.outerMargin}px</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="200" 
            value={settings.outerMargin} 
            onChange={(e) => handleChange('outerMargin', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estilo do Fundo</h3>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleChange('isTransparent', !settings.isTransparent)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-xs font-semibold transition-all ${
                  settings.isTransparent 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
             >
                <i className={`fas ${settings.isTransparent ? 'fa-check-square' : 'fa-square'}`}></i>
                Transparência
             </button>

             <div className="relative group shrink-0">
               <input 
                  type="color" 
                  value={settings.backgroundColor} 
                  onChange={(e) => {
                    handleChange('backgroundColor', e.target.value);
                    handleChange('isTransparent', false);
                  }}
                  className="w-10 h-10 bg-transparent border-2 border-slate-700 rounded-md cursor-pointer outline-none hover:border-indigo-500 transition-colors"
                  title="Escolher cor sólida"
                />
             </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => bgInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 border text-xs py-2.5 rounded-md transition-all ${
                settings.backgroundImageUrl 
                ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
              }`}
            >
              <i className="fas fa-image"></i>
              {settings.backgroundImageUrl ? 'Alterar Imagem de Fundo' : 'Usar Imagem como Fundo'}
            </button>
            
            {settings.backgroundImageUrl && (
              <button 
                onClick={removeBgImage}
                className="w-full text-[10px] text-red-500 hover:text-red-400 text-center uppercase tracking-widest font-bold pt-1"
              >
                <i className="fas fa-times-circle mr-1"></i>
                Remover Imagem de Fundo
              </button>
            )}
            
            <input 
              type="file" 
              ref={bgInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBgImageChange} 
            />
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="pt-6">
        <button 
          disabled={images.length === 0}
          onClick={handleDownload}
          className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold transition-all shadow-2xl active:scale-95 ${
            images.length === 0 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
          }`}
        >
          <i className="fas fa-download"></i>
          SALVAR RESULTADO
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
