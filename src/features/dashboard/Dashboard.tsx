// ARCHIVO: src/features/dashboard/Dashboard.tsx
import { useState, useMemo } from 'react'; // Quitamos React
import { Search, FileText, CheckCircle, Clock, Edit3, Radar, CheckSquare, Trash2 } from 'lucide-react';
import type { QuoteData } from '../../types';
import { StatCard } from '../../components/ui/StatCard';

interface DashboardProps {
  quotes: QuoteData[];
  onEdit: (q: QuoteData) => void;
  onDelete: (id: number | string) => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
  onTrack: (q: QuoteData) => void;
  onCreate: () => void;
}

export default function Dashboard({ quotes, onEdit, onDelete, onUpdateStatus, onTrack }: DashboardProps) {
  // ... (El resto del código es igual, solo cambia la primera línea)
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => quotes.filter((q) => q.clientName.toLowerCase().includes(filter.toLowerCase()) || q.projectRef.toLowerCase().includes(filter.toLowerCase())), [quotes, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enviada': return 'bg-green-100 text-green-700';
      case 'Por Seguimiento': return 'bg-orange-100 text-orange-700';
      case 'Sincronizado': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-8 animate-fadeIn h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-blue-900">Panel de Control</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64" value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total" value={quotes.length} color="bg-blue-50 text-blue-800" icon={FileText} />
        <StatCard label="Enviadas" value={quotes.filter((q:any) => q.status === 'Enviada').length} color="bg-green-50 text-green-800" icon={CheckCircle} />
        <StatCard label="Seguimiento" value={quotes.filter((q:any) => q.status === 'Por Seguimiento').length} color="bg-orange-50 text-orange-800" icon={Clock} />
        <StatCard label="Borradores" value={quotes.filter((q:any) => q.status === 'Borrador').length} color="bg-gray-50 text-gray-800" icon={Edit3} />
      </div>
      <div className="flex-1 overflow-auto border rounded-xl border-gray-100 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">Cliente / Referencia</th>
              <th className="px-6 py-4">Modelo</th>
              <th className="px-6 py-4 text-center">Cant.</th>
              <th className="px-6 py-4">Estatus</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((quote) => (
                <tr key={quote.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{quote.clientName}</div>
                    <div className="text-xs text-gray-500">{quote.projectRef}</div>
                  </td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-200">{quote.model}</span></td>
                  <td className="px-6 py-4 text-center font-bold text-blue-900">{quote.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                    <div className="flex gap-1 mr-2">
                        {quote.status !== 'Borrador' && (
                            <button onClick={() => onTrack && onTrack(quote)} title="Rastrear Pedido" className="p-1.5 text-purple-600 hover:bg-purple-100 rounded animate-pulse">
                                <Radar size={16} />
                            </button>
                        )}
                        <button onClick={() => onUpdateStatus(quote.id, 'Enviada')} title="Marcar Enviada" className="p-1.5 text-green-600 hover:bg-green-100 rounded"><CheckSquare size={16} /></button>
                        <button onClick={() => onUpdateStatus(quote.id, 'Por Seguimiento')} title="Marcar Seguimiento" className="p-1.5 text-orange-500 hover:bg-orange-100 rounded"><Clock size={16} /></button>
                    </div>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => onEdit(quote)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit3 size={16} /></button>
                    <button onClick={() => onDelete(quote.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}