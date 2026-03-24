
import React, { useState } from 'react';
import { AISettings } from '../types';
import MiauSlider from './MiauSlider';

interface SidebarAILabProps {
  settings: AISettings;
  onSettingsChange: (s: AISettings) => void;
  onAdd: () => void;
  onProcess: (mode: AISettings['mode']) => void;
  onSave: () => void;
  onBakeManual: () => void;
  isProcessing: boolean;
  hasManualChanges: boolean;
}

const SidebarAILab: React.FC<SidebarAILabProps> = ({ 
  settings, onSettingsChange, onAdd, onProcess, onSave, onBakeManual, isProcessing, hasManualChanges 
}) => {
  const handleChange = (key: keyof AISettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-5 space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2 text-theme-accent">Upload</h3>
        <button onClick={onAdd} className="w-full py-4 rounded-xl font-black text-[10px] bg-theme-accent text-theme-inv shadow-lg flex items-center justify-center gap-2 uppercase active:scale-95 transition-all">
          <i className="fas fa-cloud-upload-alt"></i> Escolher Foto
        </button>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-panel/10 space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-theme pb-2">Melhorias Manuais</h3>
        <div className="space-y-4">
          <MiauSlider label="Nitidez" min={0} max={100} value={settings.sharpness} onChange={(v) => handleChange('sharpness', v)} icon="fa-magic" />
          <MiauSlider label="Denoise" min={0} max={100} value={settings.noiseReduction} onChange={(v) => handleChange('noiseReduction', v)} icon="fa-broom" />
          <MiauSlider label="Contraste" min={50} max={200} value={settings.contrast} onChange={(v) => handleChange('contrast', v)} unit="%" icon="fa-adjust" />
          <MiauSlider label="Brilho" min={50} max={150} value={settings.brightness} onChange={(v) => handleChange('brightness', v)} unit="%" icon="fa-sun" />
        </div>
        <button onClick={onBakeManual} disabled={!hasManualChanges || isProcessing} className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border ${hasManualChanges ? 'bg-white text-black border-white' : 'opacity-20 pointer-events-none grayscale'}`}><i className="fas fa-check"></i> Aplicar Ajustes</button>
      </div>

      <div className="p-4 rounded-2xl border border-theme bg-theme-accent/5 space-y-4 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-theme-accent border-b border-theme pb-2">Restauração Inteligente</h3>
        
        <div className="pb-2 space-y-4">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onProcess('enhance')} 
              disabled={isProcessing} 
              className="w-full flex items-center justify-between p-4 rounded-xl border border-theme bg-theme-accent text-white hover:brightness-110 transition-all group active:scale-95"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-sparkles"></i>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest">Neural Upscale</p>
                  <p className="text-[7px] opacity-70 uppercase">Restauração Extrema</p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-[10px] opacity-40"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button onClick={onSave} className="w-full py-5 rounded-xl font-black text-[11px] bg-theme-accent text-theme-inv shadow-2xl flex items-center justify-center gap-2 uppercase active:scale-95 transition-all"><i className="fas fa-download"></i> Baixar Resultado</button>
      </div>
    </div>
  );
};

export default SidebarAILab;
