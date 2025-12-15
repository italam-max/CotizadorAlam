// ARCHIVO: src/components/layout/Sidebar.tsx
import React, { useMemo } from 'react';
import { LayoutDashboard, Plus, FileText, BarChart2, DollarSign, Calendar } from 'lucide-react';
// CORRECCIÓN AQUÍ: Agregamos 'type'
import type { QuoteData } from '../../types';

// Componente interno NavButton
const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-3 text-sm rounded-lg flex items-center gap-3 font-bold transition-all ${active ? 'bg-blue-50 text-blue-900 border border-blue-100 shadow-sm translate-x-1' : 'text-gray-500 hover:text-blue-900 hover:bg-gray-50'}`}>
    <span className={active ? 'text-yellow-500' : 'text-gray-400'}>{icon}</span> {label}
  </button>
);

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  onNewQuote: () => void;
  quotes: QuoteData[];
  onSelectQuote: (q: QuoteData) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onNewQuote, quotes, onSelectQuote }) => {
  const recentQuotes = useMemo(() => {
    return quotes.slice(0, 5); 
  }, [quotes]);

  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 space-y-6 print:hidden h-full">
      <nav className="space-y-2 flex-1 overflow-y-auto pr-2">
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menú Principal</p>
        <NavButton active={currentView === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
        
        <div className="my-4 border-t border-gray-200"></div>
        
        <button onClick={onNewQuote} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold text-blue-900 bg-yellow-400 hover:bg-yellow-300 shadow-md mb-2 group transition-all">
          <Plus size={20} className="group-hover:rotate-90 transition-transform"/> Nueva Cotización
        </button>

        <div className="space-y-1 mb-6">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Activas / Recientes</p>
            {recentQuotes.map((q) => (
                <button 
                    key={q.id}
                    onClick={() => onSelectQuote(q)}
                    className="w-full text-left px-4 py-2 text-xs rounded-md flex items-center gap-2 text-gray-600 hover:bg-white hover:text-blue-800 hover:shadow-sm transition-all border border-transparent hover:border-gray-200 truncate"
                >
                    <FileText size={14} className="flex-shrink-0 text-blue-400" /> 
                    <span className="truncate">{q.projectRef || 'Sin Referencia'}</span>
                </button>
            ))}
        </div>

        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Herramientas</p>
        <NavButton active={currentView === 'traffic-tool'} onClick={() => setView('traffic-tool')} icon={<BarChart2 size={18} />} label="Analizador de Tráfico" />
        <NavButton active={currentView === 'ops-calculator'} onClick={() => setView('ops-calculator')} icon={<DollarSign size={18} />} label="Calculadora de Costos" />
        <NavButton active={currentView === 'planner'} onClick={() => setView('planner')} icon={<Calendar size={18} />} label="Planificación" />
      </nav>
    </aside>
  );
};