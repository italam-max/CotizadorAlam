// ARCHIVO: src/features/dashboard/QuoteTicket.tsx
import { useState } from 'react';
import { 
  ArrowLeft, FileText, CheckCircle, XCircle, 
  RefreshCw, Layers, Calendar, User, Check
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { supabase } from '../../supabaseClient';

interface QuoteTicketProps {
  quote: QuoteData;
  onBack: () => void;
  onViewDocument: () => void; // Para ir al Preview
  onUpdateQuote: (quote: QuoteData) => void; // Para actualizar el estado global
}

const PHASES = ['Ingeniería', 'Manufactura', 'Tránsito / Aduana', 'Entrega en Obra', 'Instalación'];

export default function QuoteTicket({ quote, onBack, onViewDocument, onUpdateQuote }: QuoteTicketProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Formateador
  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  const total = (quote.price || 0) * (quote.quantity || 1);

  // --- ACCIONES ---

  const handleUpdateStatus = async (newStatus: QuoteData['status']) => {
    if (!confirm(`¿Estás seguro de marcar este proyecto como ${newStatus}?`)) return;
    setLoading(true);
    
    const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quote.id);

    if (!error) {
        onUpdateQuote({ ...quote, status: newStatus });
    }
    setLoading(false);
  };

  const handleStageChange = async (stage: string) => {
      // Solo permitimos cambiar fase si está aprobada/enviada
      if (quote.status === 'Borrador') {
          alert("Primero debes aprobar o enviar la cotización.");
          return;
      }

      setLoading(true);
      const { error } = await supabase
        .from('quotes')
        .update({ currentStage: stage })
        .eq('id', quote.id);

      if (!error) {
          onUpdateQuote({ ...quote, currentStage: stage });
      }
      setLoading(false);
  };

  const handleSyncOdoo = async () => {
      setSyncing(true);
      // Simulación de conexión
      setTimeout(() => {
          alert("✅ Sincronización con Odoo ERP exitosa.\nID de Pedido: SO-2025-884");
          setSyncing(false);
          // Opcional: cambiar estatus a 'Sincronizado' si deseas
          // handleUpdateStatus('Sincronizado');
      }, 2000);
  };

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn bg-slate-50 overflow-auto">
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-blue-900 flex items-center gap-2 font-bold transition-colors">
            <ArrowLeft size={20}/> Volver al Listado
        </button>
      </div>

      {/* TARJETA PRINCIPAL (TICKET) */}
      <div className="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* ENCABEZADO DEL TICKET */}
        <div className="bg-white p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        quote.status === 'Aprobada' || quote.status === 'Sincronizado' ? 'bg-green-100 text-green-700' :
                        quote.status === 'Rechazada' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {quote.status}
                    </span>
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                        <Calendar size={14}/> {quote.projectDate}
                    </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900">{quote.projectRef}</h1>
                <p className="text-slate-500 font-medium text-lg flex items-center gap-2 mt-1">
                    <User size={18}/> {quote.clientName}
                </p>
            </div>

            <div className="flex flex-col items-end">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Valor del Proyecto</p>
                <h2 className="text-4xl font-black text-slate-800">{formatter.format(total)}</h2>
                <p className="text-xs text-slate-400">+ IVA</p>
            </div>
        </div>

        {/* BARRA DE ACCIONES (TOOLBAR) */}
        <div className="bg-slate-50 p-4 flex flex-wrap gap-3 border-b border-slate-200">
            <button 
                onClick={onViewDocument}
                className="btn-secondary bg-white hover:bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-2"
            >
                <FileText size={18}/> Ver Documento
            </button>

            <div className="w-px h-8 bg-slate-300 mx-2 hidden md:block"></div>

            {/* Acciones de Negocio */}
            <button 
                onClick={() => handleUpdateStatus('Aprobada')}
                disabled={quote.status === 'Aprobada' || quote.status === 'Sincronizado'}
                className="px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
                <CheckCircle size={18}/> Marcar Ganada
            </button>

            <button 
                onClick={() => handleUpdateStatus('Rechazada')}
                className="px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm transition-colors"
            >
                <XCircle size={18}/> Marcar Perdida
            </button>

            <button 
                onClick={handleSyncOdoo}
                disabled={syncing || quote.status !== 'Aprobada'}
                className={`ml-auto px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border shadow-sm transition-all ${
                    quote.status === 'Sincronizado' 
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-slate-800 text-white hover:bg-slate-900 border-transparent disabled:opacity-50'
                }`}
            >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''}/> 
                {syncing ? 'Sincronizando...' : quote.status === 'Sincronizado' ? 'Sincronizado en Odoo' : 'Enviar a Odoo'}
            </button>
        </div>

        {/* CONTENIDO PRINCIPAL: FASES Y DETALLES */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna Izquierda: Seguimiento (Fases) */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Layers className="text-blue-600"/> Seguimiento de Producción
                    </h3>
                    
                    {/* Visual Stepper */}
                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-8">
                        {PHASES.map((phase, index) => {
                            const isCurrent = quote.currentStage === phase;
                            const isPast = PHASES.indexOf(quote.currentStage || 'Ingeniería') > index;
                            
                            return (
                                <div key={phase} className="relative group">
                                    {/* Bolita del timeline */}
                                    <div 
                                        onClick={() => handleStageChange(phase)}
                                        className={`absolute -left-[25px] top-0 w-6 h-6 rounded-full border-4 cursor-pointer transition-all ${
                                            isCurrent ? 'bg-white border-blue-600 scale-125' : 
                                            isPast ? 'bg-blue-600 border-blue-600' : 
                                            'bg-white border-slate-300 hover:border-blue-400'
                                        }`}
                                    >
                                        {isPast && <Check size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
                                    </div>

                                    <div className={`pl-4 transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                        <p 
                                            onClick={() => handleStageChange(phase)}
                                            className={`font-bold cursor-pointer ${isCurrent ? 'text-blue-800 text-lg' : 'text-slate-600'}`}
                                        >
                                            {phase}
                                        </p>
                                        {isCurrent && (
                                            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100 animate-fadeIn">
                                                <p>El proyecto se encuentra actualmente en esta fase.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Resumen Técnico */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Resumen Técnico</h3>
                <ul className="space-y-4 text-sm">
                    <li className="flex justify-between">
                        <span className="text-slate-500">Modelo</span>
                        <span className="font-bold text-slate-800">{quote.model}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-slate-500">Equipos</span>
                        <span className="font-bold text-slate-800">{quote.quantity} u.</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-slate-500">Paradas</span>
                        <span className="font-bold text-slate-800">{quote.stops} Niveles</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-slate-500">Velocidad</span>
                        <span className="font-bold text-slate-800">{quote.speed} m/s</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-slate-500">Carga</span>
                        <span className="font-bold text-slate-800">{quote.capacity} kg</span>
                    </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-400 text-center">ID Interno: {quote.id}</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}