// ARCHIVO: src/features/dashboard/Dashboard.tsx
import { useState } from 'react';
import {
  Search, ArrowUpRight, Clock, CheckCircle2, XCircle,
  FileText, Sparkles, DollarSign, Activity, Calendar, User, ChevronRight, TrendingUp
} from 'lucide-react';
import type { QuoteData } from '../../types';

interface DashboardProps {
  quotes: QuoteData[];
  onEdit: (quote: QuoteData) => void;
  onDelete: (id: number | string) => void;
  onCreate: () => void;
}

export default function Dashboard({ quotes, onEdit, onDelete }: DashboardProps) {
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filtrado
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.projectRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'Todos') return matchesSearch;
    if (filterStatus === 'Abiertas') return matchesSearch && (q.status === 'Borrador' || q.status === 'Enviada');
    if (filterStatus === 'Ganadas') return matchesSearch && (q.status === 'Aprobada' || q.status === 'Sincronizado');
    if (filterStatus === 'Perdidas') return matchesSearch && q.status === 'Rechazada';

    return matchesSearch;
  });

  // 2. Ordenar por fecha (Lista principal)
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.projectDate).getTime();
    const dateB = new Date(b.updated_at || b.projectDate).getTime();
    return dateB - dateA;
  });

  // 3. Recientes (Top 5 para el widget lateral)
  const recentQuotes = [...quotes].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.projectDate).getTime();
    const dateB = new Date(b.updated_at || b.projectDate).getTime();
    return dateB - dateA;
  }).slice(0, 5);

  // 4. Métricas Financieras
  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  const compactFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: "compact", maximumFractionDigits: 1 });

  const totalAbiertas = quotes.filter(q => q.status === 'Borrador' || q.status === 'Enviada');
  const totalGanadas = quotes.filter(q => q.status === 'Aprobada' || q.status === 'Sincronizado');
  
  const valuePipeline = totalAbiertas.reduce((acc, q) => acc + ((q.price || 0) * (q.quantity || 1)), 0);
  const valueWon = totalGanadas.reduce((acc, q) => acc + ((q.price || 0) * (q.quantity || 1)), 0);

  return (
    <div className="h-full flex flex-col bg-[#F9F7F2] animate-fadeIn overflow-hidden relative">
      
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 arabesque-pattern pointer-events-none z-0 opacity-40"></div>
      <div className="ambient-light-bg opacity-50"></div>

      {/* HEADER SIMPLE */}
      <div className="px-6 py-5 flex items-center bg-white/60 backdrop-blur-md sticky top-0 z-20 border-b border-[#D4AF37]/20 shadow-sm shrink-0">
        <h1 className="text-xl font-bold text-[#0A2463] tracking-tight flex items-center gap-2">
          <Sparkles className="text-[#D4AF37]" size={18} />
          Panel de Control
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 z-10 relative">
        <div className="max-w-[1800px] mx-auto space-y-6">

            {/* SECCIÓN 1: RESUMEN SUPERIOR (KPIs + RECIENTES) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMNA KPIs (8 de 12) */}
                <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard 
                        label="Abiertas" value={totalAbiertas.length.toString()} sub="Proyectos activos" 
                        icon={Clock} color="text-[#0A2463]" bgIcon="bg-[#0A2463]/10" 
                    />
                    <MetricCard 
                        label="Pipeline" value={compactFormatter.format(valuePipeline)} sub="Valor potencial" 
                        icon={Activity} color="text-blue-600" bgIcon="bg-blue-50" 
                    />
                    <MetricCard 
                        label="Cerradas" value={totalGanadas.length.toString()} sub="Éxitos totales" 
                        icon={CheckCircle2} color="text-green-600" bgIcon="bg-green-50" 
                    />
                    <MetricCard 
                        label="Ventas" value={compactFormatter.format(valueWon)} sub="Monto acumulado" 
                        icon={DollarSign} color="text-[#D4AF37]" bgIcon="bg-yellow-50" 
                    />
                </div>

                {/* COLUMNA RECIENTES (4 de 12) - ¡AQUÍ ESTÁ DE VUELTA! */}
                <div className="lg:col-span-4 luxury-glass rounded-xl p-4 flex flex-col h-full min-h-[120px] shadow-sm border border-[#D4AF37]/20">
                    <h3 className="font-bold text-[#0A2463] text-xs uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#0A2463]/10 pb-2">
                        <TrendingUp size={14} className="text-[#D4AF37]"/> Recientes
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[150px] lg:max-h-[105px]">
                        {recentQuotes.map(q => (
                            <div 
                                key={q.id} 
                                onClick={() => onEdit(q)}
                                className="flex items-center justify-between p-2 hover:bg-white/60 rounded-lg cursor-pointer group transition-all"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-1 h-8 bg-[#D4AF37]/50 rounded-full"></div>
                                    <div className="truncate">
                                        <p className="font-bold text-[#0A2463] text-xs truncate group-hover:text-[#D4AF37] transition-colors">{q.projectRef}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{q.clientName}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-[#0A2463]/70 shrink-0 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                                    {compactFormatter.format((q.price || 0) * (q.quantity || 1))}
                                </p>
                            </div>
                        ))}
                        {recentQuotes.length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-4">Sin actividad reciente</p>
                        )}
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: LISTA COMPLETA (Smart Rows) */}
            <div className="luxury-glass rounded-xl overflow-hidden flex flex-col shadow-sm border border-[#D4AF37]/20 min-h-[500px]">
                
                {/* Toolbar */}
                <div className="px-4 py-3 border-b border-[#D4AF37]/10 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/40">
                    <div className="flex bg-[#0A2463]/5 rounded-lg p-1 self-start sm:self-auto">
                        {['Todos', 'Abiertas', 'Ganadas', 'Perdidas'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilterStatus(tab)}
                                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wide ${
                                    filterStatus === tab 
                                    ? 'bg-white text-[#0A2463] shadow-sm text-[#D4AF37] ring-1 ring-black/5' 
                                    : 'text-[#0A2463]/60 hover:text-[#0A2463]'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A2463]/40 group-focus-within:text-[#D4AF37] transition-colors" size={14}/>
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, folio..." 
                            className="w-full pl-9 pr-3 py-2 bg-white/60 border border-[#0A2463]/10 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#D4AF37]/50 outline-none text-[#0A2463] transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lista de Filas Inteligentes */}
                <div className="overflow-y-auto bg-white/30 flex-1">
                    {sortedQuotes.length === 0 ? (
                        <div className="p-16 text-center text-[#0A2463]/40 text-sm flex flex-col items-center">
                            <FileText size={48} className="mb-4 opacity-20"/>
                            <p className="font-medium">No hay cotizaciones para mostrar</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#D4AF37]/5">
                            {sortedQuotes.map(quote => (
                                <div 
                                    key={quote.id} 
                                    onClick={() => onEdit(quote)}
                                    className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-white transition-all cursor-pointer border-l-[3px] border-transparent hover:border-[#D4AF37] hover:shadow-md"
                                >
                                    {/* COLUMNA IZQUIERDA: Identidad */}
                                    <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                                        {/* Icono de Modelo */}
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-xs border bg-white ${getModelColor(quote.model)}`}>
                                            {quote.model.substring(0,2)}
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <span className="text-sm font-black text-[#0A2463] group-hover:text-[#D4AF37] transition-colors truncate">
                                                    {quote.projectRef}
                                                </span>
                                                <StatusBadgeCompact status={quote.status} />
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 font-medium truncate">
                                                    <User size={10}/> {quote.clientName}
                                                </span>
                                                <span className="text-gray-300 hidden sm:inline">•</span>
                                                <span className="flex items-center gap-1 opacity-70">
                                                    <Calendar size={10}/> {quote.projectDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNA DERECHA: Métricas y Acciones */}
                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pl-14 sm:pl-0">
                                        
                                        {/* Info Técnica (Solo desktop) */}
                                        <div className="hidden md:flex flex-col items-end text-right mr-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Configuración</span>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {quote.stops} Paradas • {quote.capacity} kg
                                            </span>
                                        </div>

                                        {/* Precio */}
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">Total</p>
                                            <p className="text-sm font-black text-[#0A2463] font-mono">
                                                {formatter.format((quote.price || 0) * (quote.quantity || 1))}
                                            </p>
                                        </div>

                                        {/* Flecha de Acción (Solo visible en hover) */}
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#0A2463] group-hover:text-[#D4AF37] transition-all transform group-hover:translate-x-1">
                                            <ChevronRight size={18} />
                                        </div>

                                        {/* Botón Borrar Flotante (Solo hover) */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(quote.id); }}
                                            className="absolute right-2 top-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                            title="Eliminar"
                                        >
                                            <XCircle size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

const MetricCard = ({ label, value, sub, icon: Icon, color, bgIcon }: any) => (
    <div className="luxury-glass p-4 rounded-xl flex flex-col justify-between group gold-glow-hover relative overflow-hidden h-28 border border-white/60 hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${bgIcon} ${color} group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors`}>
                <Icon size={18}/>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <div>
            <p className={`text-2xl font-black ${color} group-hover:text-[#0A2463] transition-colors`}>{value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{sub}</p>
        </div>
    </div>
);

const getModelColor = (model: string) => {
    if (model.includes('MRL')) return "text-blue-600 border-blue-100 bg-blue-50";
    if (model.includes('HYD')) return "text-orange-600 border-orange-100 bg-orange-50";
    return "text-gray-600 border-gray-100 bg-gray-50";
};

const StatusBadgeCompact = ({ status }: { status: string }) => {
    let colorClass = "text-gray-500 bg-gray-100";
    if (status === 'Borrador') colorClass = "text-gray-600 bg-gray-100 border-gray-200";
    else if (status === 'Enviada') colorClass = "text-[#B5942E] bg-[#D4AF37]/5 border-[#D4AF37]/20";
    else if (status === 'Aprobada' || status === 'Sincronizado') colorClass = "text-green-700 bg-green-50 border-green-200";
    else if (status === 'Rechazada') colorClass = "text-red-700 bg-red-50 border-red-200";

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${colorClass}`}>
            {status}
        </span>
    );
};