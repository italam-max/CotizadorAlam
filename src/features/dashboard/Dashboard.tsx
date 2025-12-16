// ARCHIVO: src/features/dashboard/Dashboard.tsx
import { 
  Edit2, Trash2, Calendar, FileText, 
  TrendingUp, Clock, CheckCircle2, DollarSign} from 'lucide-react';
import type { QuoteData } from '../../types';

interface DashboardProps {
  quotes: QuoteData[];
  onEdit: (quote: QuoteData) => void;
  onDelete: (id: number | string) => void;
  onCreate: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
  onTrack: (quote: QuoteData) => void; 
}

export default function Dashboard({ quotes, onEdit, onDelete, onCreate }: DashboardProps) {
  
  // Cálculo de Métricas (Igual que antes)
  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);
  const pendingQuotes = quotes.filter(q => q.status === 'Borrador' || q.status === 'Enviada').length;
  const approvedQuotes = quotes.filter(q => q.status === 'Aprobada' || q.status === 'Sincronizado').length;

  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50/50">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
          <p className="text-slate-500 mt-2 text-lg">Resumen de actividad comercial y proyectos.</p>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS (KPIs) - Estilo Glassmorphism light */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard 
            title="Total Cotizado" 
            value={formatter.format(totalValue)} 
            icon={<DollarSign className="text-white" size={24} />} 
            bg="bg-gradient-to-br from-blue-900 to-blue-800"
            text="text-white"
        />
        <MetricCard 
            title="Proyectos Activos" 
            value={totalQuotes.toString()} 
            icon={<FileText className="text-blue-600" size={24} />} 
            bg="bg-white border border-blue-100"
        />
        <MetricCard 
            title="Pendientes" 
            value={pendingQuotes.toString()} 
            icon={<Clock className="text-yellow-600" size={24} />} 
            bg="bg-white border border-yellow-100"
        />
        <MetricCard 
            title="Ganados" 
            value={approvedQuotes.toString()} 
            icon={<CheckCircle2 className="text-green-600" size={24} />} 
            bg="bg-white border border-green-100"
        />
      </div>

      {/* LISTADO DE PROYECTOS RECIENTES */}
      <div className="mb-6 flex items-center justify-between">
          <h3 className="font-bold text-xl text-slate-700 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-900"/> Proyectos Recientes
          </h3>
          <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Ver todo el historial →</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {quotes.slice(0, 6).map((quote) => (
          <QuoteCard 
            key={quote.id} 
            quote={quote} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            formatter={formatter}
          />
        ))}
        
        {/* TARJETA DE "CREAR NUEVO" (Visual) */}
        <button 
            onClick={onCreate}
            className="group flex flex-col items-center justify-center h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300"
        >
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-white group-hover:shadow-md flex items-center justify-center mb-4 transition-all">
                <Edit2 className="text-slate-400 group-hover:text-blue-600" size={28}/>
            </div>
            <span className="font-bold text-slate-500 group-hover:text-blue-900">Crear Nueva Cotización</span>
        </button>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ESTILIZADOS ---

function MetricCard({ title, value, icon, bg, text = 'text-slate-800' }: any) {
    return (
        <div className={`p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${bg}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${text}`}>{title}</p>
                    <h3 className={`text-3xl font-black mt-1 ${text}`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function QuoteCard({ quote, onEdit, onDelete, formatter }: any) {
    // Definir colores según estatus (Tipo Folder)
    const statusColors: any = {
        'Borrador': 'border-t-slate-300 hover:border-t-slate-400',
        'Enviada': 'border-t-blue-500 hover:border-t-blue-600',
        'Aprobada': 'border-t-green-500 hover:border-t-green-600',
        'Rechazada': 'border-t-red-500 hover:border-t-red-600',
        'Sincronizado': 'border-t-purple-500 hover:border-t-purple-600'
    };

    const badgeColors: any = {
        'Borrador': 'bg-slate-100 text-slate-600',
        'Enviada': 'bg-blue-100 text-blue-700',
        'Aprobada': 'bg-green-100 text-green-700',
        'Rechazada': 'bg-red-100 text-red-700',
        'Sincronizado': 'bg-purple-100 text-purple-700'
    };

    const borderClass = statusColors[quote.status] || 'border-t-slate-200';
    const badgeClass = badgeColors[quote.status] || 'bg-slate-100';

    return (
        <div 
            onClick={() => onEdit(quote)}
            className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden border border-slate-100 border-t-4 ${borderClass} hover:-translate-y-1`}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${badgeClass}`}>
                            {quote.status}
                        </span>
                        <h4 className="font-black text-lg text-slate-800 mt-3 group-hover:text-blue-900 transition-colors">
                            {quote.projectRef}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">
                            {quote.clientName}
                        </p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <FileText size={20} className="text-slate-400 group-hover:text-blue-600"/>
                    </div>
                </div>
                
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Modelo</span>
                        <span className="font-bold text-slate-700">{quote.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total</span>
                        <span className="font-bold text-slate-700">
                            {formatter.format((quote.price || 0) * (quote.quantity || 1))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer de la tarjeta con fecha */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12}/> {quote.projectDate}
                </span>
                
                {/* Botón borrar (Solo aparece al hover) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(quote.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded transition-all"
                    title="Eliminar"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        </div>
    );
}