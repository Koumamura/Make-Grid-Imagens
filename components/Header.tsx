
import React from 'react';

interface HeaderProps {
  itemCount: number;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ itemCount, onClear }) => {
  return (
    <div className="h-10 border-b px-6 flex items-center justify-end z-10"
         style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'var(--border)' }}>
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
