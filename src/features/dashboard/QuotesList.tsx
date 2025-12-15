// ARCHIVO: src/features/dashboard/QuotesList.tsx
import { useState, useEffect } from 'react';
import { Search, FileText, Filter, ArrowRight, Loader2 } from 'lucide-react';
import type { QuoteData } from '../../types';
import { supabase } from '../../supabaseClient';

interface QuotesListProps {
  onSelect: (quote: QuoteData) => void;
}

export default function QuotesList({ onSelect }: QuotesListProps) {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Cargar TODAS las cotizaciones de la BD al abrir la pantalla
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    // Traemos todo, ordenado por fecha (las más nuevas arriba)
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('projectDate', { ascending: false });
    
    if (!error && data) {
      setQuotes(data as any);
    }
    setLoading(false);
  };

  // Lógica de filtrado en tiempo real
  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      q.projectRef.toLowerCase().includes(term) || 
      q.clientName.toLowerCase().includes(term);
    
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Formateador de moneda
  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

  return (
    <div className="p-8 h-full flex flex-col animate-fadeIn bg-slate-50">
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-3xl font-black text-slate-800">Historial de Cotizaciones</h2>
            <p className="text-slate-500 mt-1">Archivo general de proyectos generados.</p>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS (Buscador + Filtros) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        {/* Buscador */}
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
                type="text" 
                placeholder="Buscar por Folio (ALX-...) o Nombre del Cliente..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none transition-shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        
        {/* Filtro de Estatus */}
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className="text-slate-400"/>
            <select 
                className="p-2 border border-slate-300 rounded-lg outline-none bg-white text-sm font-medium text-slate-700 cursor-pointer hover:border-blue-400"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
            >
                <option value="all">Todos los estatus</option>
                <option value="Borrador">Borradores</option>
                <option value="Enviada">Enviadas</option>
                <option value="Aprobada">Aprobadas</option>
                <option value="Rechazada">Rechazadas</option>
            </select>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
         <div className="overflow-auto flex-1">
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin text-blue-900" size={32}/>
                </div>
            ) : filteredQuotes.length === 0 ? (
                <div className="p-10 text-center text-slate-400 italic">
                    No se encontraron cotizaciones con esos criterios.
                </div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                            <th className="p-4">Folio</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Total</th>
                            <th className="p-4 text-center">Estatus</th>
                            <th className="p-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredQuotes.map(quote => (
                            <tr key={quote.id} className="hover:bg-blue-50 transition-colors group">
                                <td className="p-4 font-bold text-blue-900 flex items-center gap-2">
                                    <FileText size={16} className="text-slate-400 group-hover:text-blue-500"/>
                                    {quote.projectRef}
                                </td>
                                <td className="p-4 font-medium text-slate-700">{quote.clientName}</td>
                                <td className="p-4 text-slate-500">{quote.projectDate}</td>
                                <td className="p-4 font-mono font-bold text-slate-700">
                                    {formatter.format((quote.price || 0) * (quote.quantity || 1))}
                                </td>
                                <td className="p-4 text-center">
                                    <StatusBadge status={quote.status} />
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => onSelect(quote)}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                                    >
                                        {/* Texto dinámico según estatus */}
                                        {quote.status === 'Borrador' ? 'Editar' : 'Ver'} <ArrowRight size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
         </div>
      </div>
    </div>
  );
}

// Componente auxiliar para las etiquetas de colores
const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
        'Borrador': 'bg-gray-100 text-gray-600 border-gray-200',
        'Enviada': 'bg-blue-100 text-blue-700 border-blue-200',
        'Aprobada': 'bg-green-100 text-green-700 border-green-200',
        'Rechazada': 'bg-red-100 text-red-700 border-red-200',
        'Sincronizado': 'bg-purple-100 text-purple-700 border-purple-200',
        'Por Seguimiento': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {status}
        </span>
    );
};