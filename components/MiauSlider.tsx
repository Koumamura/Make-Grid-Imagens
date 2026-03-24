
import React, { useRef, useState } from 'react';

interface MiauSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
  icon?: string;
}

const MiauSlider: React.FC<MiauSliderProps> = ({ label, value, min, max, onChange, unit = '', step = 1, icon }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ lastX: 0, startValue: 0, accumulatedDelta: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    
    dragRef.current = { 
      lastX: e.clientX, 
      startValue: value,
      accumulatedDelta: 0
    };
    
    const style = document.createElement('style');
    style.id = 'miau-dragging-cursor';
    style.innerHTML = '*{ cursor: none !important; user-select: none !important; }';
    document.head.appendChild(style);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.movementX;
    const range = max - min;
    const sensitivity = range > 100 ? 0.4 : 0.05;
    
    dragRef.current.accumulatedDelta += deltaX * sensitivity;
    
    const change = Math.trunc(dragRef.current.accumulatedDelta);
    if (change !== 0) {
      let newValue = value + change;
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));
      
      if (newValue !== value) {
        onChange(newValue);
        dragRef.current.accumulatedDelta -= change;
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.getElementById('miau-dragging-cursor')?.remove();
  };

  const percentage = ((value - min) / (max - min)) * 100;

  // Formatação para evitar o bug de decimais infinitos
  const displayValue = step < 1 ? value.toFixed(1) : Math.round(value).toString();

  return (
    <div className="group space-y-1.5 w-full">
      <div className="flex justify-between items-center px-1">
        <label className={`text-[8px] font-black uppercase tracking-wider transition-all ${isDragging ? 'text-theme-accent opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
          {label}
        </label>
        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border transition-all ${isDragging ? 'bg-theme-accent text-white border-theme-accent shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'text-theme-accent bg-theme-accent/5 border-theme-accent/10'}`}>
          {displayValue}{unit}
        </span>
      </div>
      
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative h-9 bg-theme-panel/30 border rounded-xl cursor-ew-resize transition-all flex items-center px-3 gap-3 overflow-hidden 
          ${isDragging ? 'border-theme-accent ring-2 ring-theme-accent/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] bg-theme-accent/10' : 'border-theme hover:border-theme-accent/40'}`}
      >
        {icon && <i className={`fas ${icon} text-[10px] transition-all ${isDragging ? 'text-theme-accent scale-110' : 'opacity-20'}`}></i>}
        
        <div className="flex-1 h-1 bg-theme/10 rounded-full relative overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-theme-accent transition-all duration-75 ${isDragging ? 'opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'opacity-60'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-0.5 flex justify-between px-1 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-[1px] h-full bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiauSlider;
