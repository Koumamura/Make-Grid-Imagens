
import React from 'react';
import { ToolType } from '../App';

interface TopNavProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const TopNav: React.FC<TopNavProps> = ({ activeTool, onToolChange }) => {
  const tools = [
    { id: 'grid', label: 'Grid Maker', icon: 'fa-th-large' },
    { id: 'framing', label: 'Bulk Framing', icon: 'fa-expand-arrows-alt' },
    { id: 'resizer', label: 'Bulk Resizer', icon: 'fa-compress-arrows-alt' },
    { id: 'trim', label: 'Trim Crop', icon: 'fa-crop-alt' },
    { id: 'max-resize', label: 'Max-Bound Resize', icon: 'fa-vector-square' },
  ];

  return (
    <nav className="h-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 flex items-center justify-between shadow-xl z-50">
      {/* Logo Area - Ultra Compact */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white shadow-lg">
          <i className="fas fa-bolt text-[8px]"></i>
        </div>
        <span className="font-black text-base tracking-tighter text-white select-none">
          STUDIO<span className="text-indigo-500">PRO</span>
        </span>
      </div>

      {/* Tools Menu - Right Aligned and Streamlined */}
      <div className="flex items-center gap-1 bg-slate-800/30 p-0.5 rounded-lg border border-slate-700/20">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id as ToolType)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold transition-all duration-200 whitespace-nowrap uppercase tracking-tight ${
              activeTool === tool.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <i className={`fas ${tool.icon} text-[9px] ${activeTool === tool.id ? 'opacity-100' : 'opacity-40'}`}></i>
            {tool.label}
          </button>
        ))}
        
        <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
        
        <button 
          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
          title="Configurações Globais"
        >
          <i className="fas fa-cog text-[11px]"></i>
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
