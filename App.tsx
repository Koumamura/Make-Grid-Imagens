
import React, { useState } from 'react';
import TopNav from './components/TopNav';
import GridTool from './tools/GridTool';

// Tipagem para as ferramentas disponíveis atualizada conforme pedido
export type ToolType = 'grid' | 'framing' | 'resizer' | 'trim' | 'max-resize';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('grid');

  const renderTool = () => {
    switch (activeTool) {
      case 'grid':
        return <GridTool />;
      case 'framing':
        return <PlaceholderTool title="Bulk Framing" icon="fa-expand-arrows-alt" description="Enquadramento inteligente de múltiplas imagens simultaneamente." />;
      case 'resizer':
        return <PlaceholderTool title="Bulk Resizer" icon="fa-compress-arrows-alt" description="Redimensionamento em lote com preservação de qualidade." />;
      case 'trim':
        return <PlaceholderTool title="Trim Crop" icon="fa-crop-alt" description="Corte e ajuste de margens automatizado." />;
      case 'max-resize':
        return <PlaceholderTool title="Max-Bound Resize" icon="fa-vector-square" description="Redimensionamento limitado por dimensões máximas de borda." />;
      default:
        return <GridTool />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200">
      <TopNav activeTool={activeTool} onToolChange={setActiveTool} />
      
      <main className="flex-1 flex overflow-hidden">
        {renderTool()}
      </main>
    </div>
  );
};

// Componente simples de placeholder para ferramentas em desenvolvimento
const PlaceholderTool: React.FC<{ title: string; icon: string; description: string }> = ({ title, icon, description }) => (
  <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-950">
    <div className="text-center p-8 border border-dashed border-slate-800 rounded-3xl max-w-md">
      <i className={`fas ${icon} text-6xl mb-6 text-indigo-500/30`}></i>
      <h2 className="text-2xl font-bold text-slate-300 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      <div className="mt-8 px-4 py-2 bg-slate-900 rounded-full inline-block text-[10px] uppercase tracking-widest font-bold text-indigo-400 border border-indigo-500/20">
        Desenvolvimento em Progresso
      </div>
    </div>
  </div>
);

export default App;
