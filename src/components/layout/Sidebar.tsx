// ARCHIVO: src/components/layout/Sidebar.tsx
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calculator, 
  Calendar, 
  BarChart, 
  Activity, 
  FileText,
  FolderOpen
} from 'lucide-react';
import type { QuoteData } from '../../types';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  onNewQuote: () => void;
  quotes: QuoteData[];
  onSelectQuote: (quote: QuoteData) => void;
}

export function Sidebar({ currentView, setView, onNewQuote, quotes, onSelectQuote }: SidebarProps) {
  
  const recentQuotes = quotes.slice(0, 5);

  // Función auxiliar para los botones del menú
  const MenuLink = ({ id, icon: Icon, label }: any) => {
    const isActive = currentView === id;
    return (
      <button
        onClick={() => setView(id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
          isActive
            ? 'bg-blue-50 text-blue-900 shadow-sm translate-x-1'
            : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900 hover:translate-x-1'
        }`}
      >
        {/* Indicador lateral amarillo cuando está activo */}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r"></div>}
        
        <Icon size={20} className={`transition-colors ${isActive ? 'text-blue-900' : 'text-slate-400 group-hover:text-blue-600'}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-100px)] sticky top-24 rounded-2xl shadow-sm overflow-hidden print:hidden ml-4 mb-4">
      
      {/* Botón Principal de Acción (CTA) */}
      <div className="p-6 pb-2">
        <button
          onClick={onNewQuote}
          className="w-full py-4 px-4 rounded-xl flex items-center justify-center gap-3 font-black text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
          bg-blue-900 text-white 
          hover:bg-yellow-400 hover:text-blue-900 border-2 border-transparent hover:border-yellow-500"
        >
          <PlusCircle size={22} strokeWidth={2.5} />
          NUEVA COTIZACIÓN
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* GRUPO 1: GESTIÓN */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Gestión
          </p>
          <MenuLink id="dashboard" icon={LayoutDashboard} label="Panel de Control" />
          <MenuLink id="quotes-list" icon={FolderOpen} label="Historial Completo" />
        </div>

        {/* GRUPO 2: HERRAMIENTAS */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Ingeniería & Costos
          </p>
          <MenuLink id="traffic-tool" icon={BarChart} label="Análisis de Tráfico" />
          <MenuLink id="planner" icon={Calendar} label="Planeador Gantt" />
          <MenuLink id="tracker" icon={Activity} label="Rastreador Pedidos" />
          <MenuLink id="ops-calculator" icon={Calculator} label="Costos Operativos" />
        </div>

        {/* GRUPO 3: RECIENTES */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Recientes
          </p>
          {recentQuotes.length === 0 ? (
            <p className="px-3 text-xs text-gray-400 italic">Sin actividad reciente</p>
          ) : (
            recentQuotes.map((quote) => (
              <button
                key={quote.id}
                onClick={() => onSelectQuote(quote)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-900 transition-all group text-left border-l-2 border-transparent hover:border-blue-200"
              >
                <FileText size={14} className="text-slate-300 group-hover:text-blue-500" />
                <span className="truncate font-medium">{quote.projectRef}</span>
              </button>
            ))
          )}
        </div>

      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-bold text-slate-600">Sistema Operativo</p>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 pl-5">v1.6.3 Stable</p>
      </div>
    </aside>
  );
}