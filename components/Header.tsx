
import React from 'react';

interface HeaderProps {
  itemCount: number;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ itemCount, onClear }) => {
  return (
    <div className="h-12 border-b border-slate-800 bg-slate-900/30 px-6 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Modo de Visualização</span>
        <div className="flex gap-1 ml-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 font-medium">{itemCount} arquivos carregados</span>
        {itemCount > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-all uppercase tracking-widest"
            title="Limpar tudo"
          >
            <i className="fas fa-trash-alt"></i>
            Limpar Canvas
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
