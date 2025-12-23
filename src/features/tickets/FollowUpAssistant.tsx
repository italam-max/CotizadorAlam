// ARCHIVO: src/features/tickets/FollowUpAssistant.tsx
import { MessageCircle, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { QuoteData } from '../../types';

interface FollowUpProps {
  quote: QuoteData;
  lastNoteDate?: string; // Fecha de la última nota manual
}

export default function FollowUpAssistant({ quote, lastNoteDate }: FollowUpProps) {
  
  // 1. Lógica de Tiempos
  const creationDate = new Date(quote.projectDate);
  const lastInteraction = lastNoteDate ? new Date(lastNoteDate) : creationDate;
  const today = new Date();
  
  const diffTime = Math.abs(today.getTime() - lastInteraction.getTime());
  const daysSinceInteraction = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Regla de Negocio: 3 Días para seguimiento automático
  const THRESHOLD_DAYS = 3;
  const isOverdue = daysSinceInteraction >= THRESHOLD_DAYS;

  // Generador de Mensaje WhatsApp
  const generateWhatsAppLink = () => {
    const text = `Hola ${quote.clientName}, espero que estés excelente. Te escribo para dar seguimiento a la propuesta del proyecto ${quote.projectRef}. ¿Tienes alguna duda técnica que podamos resolver? Saludos.`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  if (quote.status === 'Aprobada' || quote.status === 'Rechazada') return null;

  return (
    <div className={`rounded-xl border p-4 transition-all relative overflow-hidden ${
      isOverdue 
        ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
        : 'bg-emerald-900/20 border-emerald-500/30'
    }`}>
      
      {/* Indicador de Estado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            {isOverdue ? (
                <div className="p-2 bg-red-500/20 rounded-lg text-red-400 animate-pulse">
                    <AlertTriangle size={18} />
                </div>
            ) : (
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <CheckCircle2 size={18} />
                </div>
            )}
            <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOverdue ? 'Acción Requerida' : 'Seguimiento Activo'}
                </h4>
                <p className="text-[10px] text-white/50">
                    Última interacción: hace {daysSinceInteraction} días
                </p>
            </div>
        </div>
        
        {/* Contador de Caducidad */}
        <div className="text-right">
            <p className="text-[9px] font-bold text-[#D4AF37] uppercase">Próximo Hito</p>
            <p className="text-white font-mono text-xs">
                {isOverdue ? '¡VENCIDO!' : `En ${THRESHOLD_DAYS - daysSinceInteraction} días`}
            </p>
        </div>
      </div>

      {/* Acción Automática (WhatsApp) */}
      {isOverdue && (
        <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-gray-300 mb-2 italic">
                El sistema detectó inactividad. Se recomienda contactar al cliente.
            </p>
            <a 
                href={generateWhatsAppLink()} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg text-xs font-bold transition-all shadow-lg"
            >
                <MessageCircle size={16} /> Enviar Recordatorio WhatsApp
            </a>
        </div>
      )}
      
      {!isOverdue && (
        <p className="text-[10px] text-emerald-200/60 mt-2 flex items-center gap-1">
            <Clock size={10}/> El sistema monitoreará la actividad automáticamente.
        </p>
      )}
    </div>
  );
}