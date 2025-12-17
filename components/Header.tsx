
import React from 'react';

interface HeaderProps {
  itemCount: number;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ itemCount, onClear }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <i className="fas fa-th-large text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Grid Collage Maker</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pro Editor</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-700">Imagens Adicionadas</span>
          <span className="text-xs text-slate-500">{itemCount} arquivos carregados</span>
        </div>
        {itemCount > 0 && (
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
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
