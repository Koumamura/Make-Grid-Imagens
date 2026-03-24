
import React from 'react';

interface HeaderProps {
  itemCount: number;
  onClear: () => void;
  onExport?: () => void;
  isProcessing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ itemCount, onClear, onExport, isProcessing }) => {
  return (
    <div className="h-10 border-b px-6 flex items-center justify-between z-10"
         style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-4">
        {itemCount > 0 && onExport && (
          <button 
            disabled={isProcessing}
            onClick={onExport}
            className="flex items-center gap-2 text-[9px] font-black text-theme-accent hover:opacity-80 transition-all uppercase tracking-widest disabled:opacity-30"
          >
            <i className={`fas ${isProcessing ? 'fa-spinner animate-spin' : 'fa-download'}`}></i> 
            {isProcessing ? 'Processando...' : 'Baixar Projeto'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {itemCount > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-[9px] font-black hover:text-red-500 transition-all uppercase tracking-widest opacity-40 hover:opacity-100"
          >
            <i className="fas fa-eraser"></i> Limpar Projeto
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
