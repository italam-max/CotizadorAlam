// ARCHIVO: src/components/layout/Sidebar.tsx
import { 
  LayoutDashboard, PlusCircle, Calculator, Calendar, 
  BarChart, Activity, FileText, FolderOpen, Sparkles
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

  const MenuLink = ({ id, icon: Icon, label }: any) => {
    const isActive = currentView === id;
    return (
      <button
        onClick={() => setView(id)}
        // Cambio drástico en los estilos de estado
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-500 group relative overflow-hidden ${
          isActive
            ? 'bg-gradient-to-r from-[#D4AF37] via-[#FBBF24] to-[#D4AF37] text-[#0A2463] shadow-[0_0_20px_rgba(212,175,55,0.4)] translate-x-1' // Estado Activo: Lingote de oro brillante
            : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-inner hover:translate-x-1' // Estado Inactivo: Texto claro sobre cristal oscuro
        }`}
      >
        {/* Decoración Árabe para el estado activo en lugar de una línea simple */}
        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-[#0A2463] rounded-r-full"></div>
        )}
        
        <Icon 
            size={18} 
            strokeWidth={isActive ? 2.5 : 2}
            className={`transition-colors duration-300 relative z-10 ${
                isActive ? 'text-[#0A2463]' : 'text-[#D4AF37]/70 group-hover:text-[#D4AF37]'
            }`} 
        />
        <span className="tracking-wide relative z-10">{label}</span>

        {/* Destello sutil al pasar el mouse en inactivo */}
        {!isActive && (
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        )}
      </button>
    );
  };

  return (
    // CONTENEDOR PRINCIPAL: CRISTAL ZAFIRO GRABADO
    <aside className="hidden md:flex flex-col w-64 h-full relative overflow-hidden z-20 print:hidden border-r-2 border-[#D4AF37] shadow-[5px_0_30px_-5px_rgba(0,0,0,0.5)]">
      
      {/* CAPA 1: FONDO DE CRISTAL AZUL PROFUNDO CON BLUR */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A2463]/95 via-[#0A2463]/90 to-[#051338]/95 backdrop-blur-2xl z-0"></div>
      
      {/* CAPA 2: PATRÓN ÁRABE "GRABADO" EN EL CRISTAL (Textura) */}
      {/* Usamos la misma clase del fondo pero con una mezcla para que parezca grabado en el vidrio oscuro */}
      <div className="absolute inset-0 arabesque-pattern opacity-10 mix-blend-overlay z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#D4AF37]/10 to-transparent z-0 pointer-events-none"></div>


      {/* CONTENIDO DEL SIDEBAR (Con z-index superior para estar sobre el fondo) */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Botón CTA: Oro sólido para máximo contraste */}
        <div className="p-4 pt-6 pb-2">
            <button
            onClick={onNewQuote}
            className="w-full py-3.5 px-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(212,175,55,0.4)]
            bg-gradient-to-r from-[#D4AF37] to-[#B5942E] text-[#0A2463] relative overflow-hidden group border border-[#D4AF37]/50"
            >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            <PlusCircle size={18} strokeWidth={3} className="text-[#0A2463]" />
            <span className="tracking-[0.2em] uppercase">NUEVA</span>
            </button>
        </div>

        {/* Separador decorativo */}
        <div className="mx-4 mt-2 mb-4 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-8 scrollbar-thin scrollbar-thumb-[#D4AF37]/30 scrollbar-track-transparent">
            
            {/* GRUPO 1 */}
            <div className="space-y-1">
            <div className="px-4 flex items-center gap-2 mb-2 opacity-90">
                <Sparkles size={10} className="text-[#D4AF37]"/>
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Principal</p>
            </div>
            <MenuLink id="dashboard" icon={LayoutDashboard} label="Panel de Control" />
            <MenuLink id="quotes-list" icon={FolderOpen} label="Historial Global" />
            </div>

            {/* GRUPO 2 */}
            <div className="space-y-1">
            <div className="px-4 flex items-center gap-2 mb-2 opacity-90">
                <Sparkles size={10} className="text-[#D4AF37]"/>
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Ingeniería</p>
            </div>
            <MenuLink id="traffic-tool" icon={BarChart} label="Estudio de Tráfico" />
            <MenuLink id="planner" icon={Calendar} label="Planificación Gantt" />
            <MenuLink id="tracker" icon={Activity} label="Rastreo de Pedidos" />
            <MenuLink id="ops-calculator" icon={Calculator} label="Costos Operativos" />
            </div>

            {/* GRUPO 3: Recientes (Adaptado al fondo oscuro) */}
            <div className="space-y-1">
            <div className="px-4 flex items-center gap-2 mb-2 opacity-60">
                <div className="w-1 h-1 rounded-full bg-[#D4AF37]"></div>
                <p className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em]">Recientes</p>
            </div>
            {recentQuotes.length === 0 ? (
                <p className="px-4 text-[10px] text-white/30 italic">Sin actividad</p>
            ) : (
                recentQuotes.map((quote) => (
                <button
                    key={quote.id}
                    onClick={() => onSelectQuote(quote)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-all group text-left border-l-2 border-transparent hover:border-[#D4AF37]"
                >
                    <FileText size={12} className="text-[#D4AF37]/50 group-hover:text-[#D4AF37]" />
                    <span className="truncate font-medium tracking-wide">{quote.projectRef}</span>
                </button>
                ))
            )}
            </div>

        </nav>

        {/* Footer del Sidebar Oscuro */}
        <div className="p-4 bg-gradient-to-t from-[#051338] to-transparent border-t border-[#D4AF37]/20 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
            <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest opacity-80">Sistema v2.2 <span className="text-white/40">|</span> Premium</p>
        </div>
      </div>
    </aside>
  );
}