
import React from 'react';
import { GridSettings, GridImage } from '../types';

interface SidebarProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  images: GridImage[];
}

const Sidebar: React.FC<SidebarProps> = ({ settings, onSettingsChange, onAddFile, onAddFolder, images }) => {
  const handleChange = (key: keyof GridSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleDownload = () => {
    const canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `grid-collage-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Upload Actions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Arquivos</h3>
        <button 
          onClick={onAddFile}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          <i className="fas fa-file-upload"></i>
          Adicionar Arquivos
        </button>
        <button 
          onClick={onAddFolder}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg font-medium transition-all shadow-sm active:scale-95"
        >
          <i className="fas fa-folder-open"></i>
          Importar Pasta
        </button>
      </div>

      {/* Grid Configuration */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Configuração da Grid</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Largura (px)</label>
            <input 
              type="number" 
              value={settings.canvasWidth} 
              onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)}
              className="w-full border border-slate-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Altura (px)</label>
            <input 
              type="number" 
              value={settings.canvasHeight} 
              onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)}
              className="w-full border border-slate-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">Colunas ({settings.columns})</label>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={settings.columns} 
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">Espaçamento Interno ({settings.innerSpacing}px)</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={settings.innerSpacing} 
            onChange={(e) => handleChange('innerSpacing', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">Bordas Externas ({settings.outerMargin}px)</label>
          <input 
            type="range" 
            min="0" 
            max="200" 
            value={settings.outerMargin} 
            onChange={(e) => handleChange('outerMargin', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">Cor de Fundo</label>
          <div className="flex gap-2 items-center">
            <input 
              type="color" 
              value={settings.backgroundColor} 
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-10 h-10 border-none rounded-md cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-500 uppercase">{settings.backgroundColor}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="pt-4">
        <button 
          disabled={images.length === 0}
          onClick={handleDownload}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all shadow-md active:scale-95 ${
            images.length === 0 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <i className="fas fa-download"></i>
          Salvar Imagem (Alta Qualidade)
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Exporta no formato PNG mantendo a resolução total.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
