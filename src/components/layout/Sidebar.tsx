// ARCHIVO: src/components/layout/Sidebar.tsx
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calculator, 
  Calendar, 
  BarChart, 
  Activity, 
  FileText,
  FolderOpen // <--- Icono nuevo para el historial
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
  
  // Filtramos las últimas 5 cotizaciones para la lista rápida
  const recentQuotes = quotes.slice(0, 5);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-100px)] sticky top-24 rounded-xl shadow-sm overflow-hidden print:hidden">
      
      {/* Botón Principal de Acción (Nueva Cotización) */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onNewQuote}
          className="w-full bg-blue-900 text-white hover:bg-yellow-400 hover:text-blue-900 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95 border border-transparent hover:border-yellow-500"
        >
          <PlusCircle size={20} />
          Nueva Cotización
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* SECCIÓN PRINCIPAL */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Principal
          </p>
          
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <LayoutDashboard size={20} />
            Panel de Control
          </button>

          {/* --- NUEVO BOTÓN: HISTORIAL --- */}
          <button
            onClick={() => setView('quotes-list')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'quotes-list'
                ? 'bg-blue-50 text-blue-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
            }`}
          >
            <FolderOpen size={20} />
            Historial Cotizaciones
          </button>
        </div>

        {/* SECCIÓN HERRAMIENTAS */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Herramientas Alamex
          </p>
          
          <button
            onClick={() => setView('traffic-tool')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'traffic-tool'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
            }`}
          >
            <BarChart size={20} />
            Análisis de Tráfico
          </button>

          <button
            onClick={() => setView('planner')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'planner'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
            }`}
          >
            <Calendar size={20} />
            Planeador Gantt
          </button>

          <button
            onClick={() => setView('tracker')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'tracker'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
            }`}
          >
            <Activity size={20} />
            Rastreador Pedidos
          </button>

          <button
            onClick={() => setView('ops-calculator')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'ops-calculator'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
            }`}
          >
            <Calculator size={20} />
            Costos Operativos
          </button>
        </div>

        {/* SECCIÓN RECIENTES */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Recientes
          </p>
          {recentQuotes.length === 0 ? (
            <p className="px-3 text-sm text-gray-400 italic">Sin actividad reciente</p>
          ) : (
            recentQuotes.map((quote) => (
              <button
                key={quote.id}
                onClick={() => onSelectQuote(quote)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-colors group text-left"
              >
                <FileText size={16} className="text-slate-400 group-hover:text-blue-500" />
                <span className="truncate">{quote.projectRef}</span>
              </button>
            ))
          )}
        </div>

      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-medium text-gray-500">Sistema Operativo</p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-5">v1.6.1 Stable</p>
      </div>
    </aside>
  );
}