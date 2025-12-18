
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

  const handleDownload = () => {
    const canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `grid-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-panel)',
    borderColor: 'var(--border)',
    color: 'var(--text-main)'
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Conteúdo</h3>
        <button 
          onClick={onAddFile}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-md hover:opacity-90 relative group overflow-hidden"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inv)' }}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-plus-circle z-10"></i> <span className="z-10">Arquivos</span>
        </button>
        <button 
          onClick={onAddFolder}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs border transition-all active:scale-95 shadow-sm hover:bg-black/5 relative group overflow-hidden"
          style={{ backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text-main)' }}
        >
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--ui-hover)' }}></div>
          <i className="fas fa-folder z-10"></i> <span className="z-10">Importar Pasta</span>
        </button>
      </div>

      <div className="space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Grid & Canvas</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Largura (px)</label>
            <input 
              type="number" 
              value={settings.canvasWidth} 
              onChange={(e) => handleChange('canvasWidth', parseInt(e.target.value) || 0)}
              className="w-full border rounded-md p-2 text-xs outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Altura (px)</label>
            <input 
              type="number" 
              value={settings.canvasHeight} 
              onChange={(e) => handleChange('canvasHeight', parseInt(e.target.value) || 0)}
              className="w-full border rounded-md p-2 text-xs outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
              style={inputStyle}
            />
          </div>
        </div>

        {[
          { label: 'Colunas', key: 'columns', min: 1, max: 12 },
          { label: 'Espaçamento', key: 'innerSpacing', min: 0, max: 100 },
          { label: 'Margem Externa', key: 'outerMargin', min: 0, max: 200 }
        ].map((item) => (
          <div key={item.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold opacity-60 uppercase tracking-wide">{item.label}</label>
              <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--ui-selected)', color: 'var(--accent)' }}>{(settings as any)[item.key]}</span>
            </div>
            <input 
              type="range" 
              min={item.min} max={item.max} 
              value={(settings as any)[item.key]} 
              onChange={(e) => handleChange(item.key as any, parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all bg-black/10"
              style={{ backgroundColor: 'var(--border)', accentColor: 'var(--accent)' }}
            />
          </div>
        ))}

        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Aparência do Fundo</h3>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => handleChange('isTransparent', !settings.isTransparent)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-[10px] font-black transition-all group relative overflow-hidden"
                style={{ 
                  backgroundColor: settings.isTransparent ? 'var(--accent)' : 'var(--bg-panel)',
                  color: settings.isTransparent ? 'var(--text-inv)' : 'var(--text-muted)',
                  borderColor: 'var(--border)'
                }}
             >
                {!settings.isTransparent && (
                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--ui-hover)' }}></div>
                )}
                <i className={`fas ${settings.isTransparent ? 'fa-check-circle' : 'fa-circle-notch'} z-10`}></i>
                <span className="z-10">Transparência</span>
             </button>
             <input 
                type="color" 
                value={settings.backgroundColor} 
                onChange={(e) => {
                  handleChange('backgroundColor', e.target.value);
                  handleChange('isTransparent', false);
                }}
                className="w-9 h-9 bg-transparent rounded-lg cursor-pointer border-2 p-0.5 transition-transform active:scale-90"
                style={{ borderColor: 'var(--border)' }}
              />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          disabled={images.length === 0}
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-black text-sm transition-all active:scale-95 shadow-xl disabled:opacity-30 disabled:grayscale relative group overflow-hidden"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inv)' }}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fas fa-download z-10"></i> <span className="z-10">EXPORTAR PROJETO</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
