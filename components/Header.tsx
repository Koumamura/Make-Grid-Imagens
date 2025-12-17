
import React from 'react';

interface HeaderProps {
  itemCount: number;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ itemCount, onClear }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shadow-lg z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-500/20 shadow-md">
          <i className="fas fa-th-large text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Grid Collage Maker</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pro Dark Editor</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-300">Galeria</span>
          <span className="text-xs text-slate-500">{itemCount} arquivos</span>
        </div>
        {itemCount > 0 && (
          <button 
            onClick={onClear}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Limpar tudo"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
