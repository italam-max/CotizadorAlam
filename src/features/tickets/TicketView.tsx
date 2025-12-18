// ARCHIVO: src/features/tickets/TicketView.tsx
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, Clock, CheckCircle2, 
  User, Paperclip, FileText, LayoutGrid, MessageSquare, AlertCircle, Phone
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { supabase } from '../../supabaseClient';
import { WhatsappService } from '../../services/whatsappService';
import { normalizePhone } from '../../services/utils';

interface TicketViewProps {
  quote: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
}

interface Interaction {
  id: string;
  quote_id: number | string;
  type: 'whatsapp_sent' | 'whatsapp_received' | 'note' | 'system';
  content: string;
  created_at: string;
}

export default function TicketView({ quote: initialQuote, onBack, onUpdateStatus }: TicketViewProps) {
  const [viewingQuote, setViewingQuote] = useState<QuoteData>(initialQuote);
  const [clientPortfolio, setClientPortfolio] = useState<QuoteData[]>([]);
  const [allClientQuoteIds, setAllClientQuoteIds] = useState<(string|number)[]>([]);
  
  // Chat state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  const masterPhone = normalizePhone(initialQuote.clientPhone);

  // 1. CARGA ROBUSTA: Descarga todo y filtra en cliente para asegurar coincidencias
  useEffect(() => {
    const loadClientPortfolio = async () => {
      let portfolio: QuoteData[] = [];

      if (masterPhone) {
        // Obtenemos TODAS las cotizaciones de la base de datos
        // Hacemos esto para poder aplicar normalizePhone() a cada registro y encontrar al cliente
        // aunque el formato en BD sea diferente (ej: con guiones vs sin guiones).
        const { data } = await supabase
          .from('quotes')
          .select('*')
          .order('projectDate', { ascending: false });

        if (data) {
           const rawQuotes = data as any[];
           // Filtramos manualmente
           portfolio = rawQuotes
             .filter(q => normalizePhone(q.client_phone || q.clientPhone) === masterPhone)
             .map(d => ({
                id: d.id,
                status: d.status,
                clientName: d.client_name || d.clientName,
                clientPhone: d.client_phone || d.clientPhone,
                clientEmail: d.client_email || d.clientEmail,
                projectRef: d.project_ref || d.projectRef,
                projectDate: d.project_date || d.projectDate,
                quantity: d.quantity,
                model: d.model,
                capacity: d.capacity,
                stops: d.stops,
                speed: d.speed,
                price: d.price,
                // ... mapea otros campos si es necesario
             })) as QuoteData[];
        }
      }

      // Fallback si no se encontró nada o no hay teléfono
      if (portfolio.length === 0) {
        portfolio = [initialQuote];
      } else {
        // Si el portfolio existe, nos aseguramos de que el proyecto inicial esté seleccionado
        const currentMatch = portfolio.find(q => String(q.id) === String(initialQuote.id));
        if (currentMatch) {
            setViewingQuote(currentMatch);
        } else {
            // Si por alguna razón extraña no está en el filtro (ej. datos en memoria vs DB), lo agregamos
            portfolio.unshift(initialQuote);
        }
      }

      setClientPortfolio(portfolio);
      
      // Extraemos TODOS los IDs del cliente para el chat unificado
      const ids = portfolio.map(q => q.id);
      setAllClientQuoteIds(ids);
    };

    loadClientPortfolio();
  }, [initialQuote.id, masterPhone]);

  // 2. CHAT UNIFICADO: Carga mensajes de CUALQUIERA de los IDs encontrados
  useEffect(() => {
    if (allClientQuoteIds.length === 0) return;

    const fetchUnifiedMessages = async () => {
      const { data } = await supabase
        .from('interactions')
        .select('*')
        .in('quote_id', allClientQuoteIds) // <--- ESTO UNIFICA EL CHAT
        .order('created_at', { ascending: true });

      if (data) setInteractions(data as any);
    };

    fetchUnifiedMessages();

    // 3. REALTIME: Escucha todo y filtra si pertenece al cliente
    const channel = supabase
      .channel(`unified_room_${masterPhone}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'interactions' },
        (payload) => {
          const newMsg = payload.new as Interaction;
          // ¿Es de alguno de mis proyectos?
          const isRelated = allClientQuoteIds.some(id => String(id) === String(newMsg.quote_id));
          
          if (isRelated) {
            setInteractions(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };

  }, [allClientQuoteIds]); // Se recarga cuando ya tenemos los IDs del portafolio

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  // ENVIAR MENSAJE
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
        // Enviar a WhatsApp
        if (viewingQuote.clientPhone) {
            await WhatsappService.sendMessage(viewingQuote.clientPhone, newMessage);
        }
        
        // Guardar en BD (vinculado al proyecto que estás viendo)
        await supabase.from('interactions').insert({
            quote_id: viewingQuote.id,
            type: viewingQuote.clientPhone ? 'whatsapp_sent' : 'note',
            content: newMessage,
            created_at: new Date().toISOString()
        });

        setNewMessage('');
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden rounded-xl border border-slate-300 shadow-xl" style={{ height: 'calc(100vh - 100px)' }}>
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ArrowLeft size={20}/>
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="font-black text-slate-800 text-lg leading-none">{initialQuote.clientName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                            <Phone size={10} /> {initialQuote.clientPhone || 'Sin N°'}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {clientPortfolio.length} Proyectos Vinculados
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANEL IZQUIERDO: EXPEDIENTE (Lista de proyectos) */}
        <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto hidden md:flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid size={12}/> Cotizaciones del Cliente
                </h3>
            </div>
            
            <div className="p-2 space-y-2">
                {clientPortfolio.map(q => {
                    const isActive = String(q.id) === String(viewingQuote.id);
                    return (
                        <div 
                            key={q.id}
                            onClick={() => setViewingQuote(q)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                                isActive 
                                ? 'bg-blue-50 border-blue-300 shadow-md ring-1 ring-blue-100' 
                                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                            }`}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>}
                            
                            <div className="pl-2">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {q.projectRef}
                                    </span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                        q.status === 'Aprobada' ? 'bg-green-100 text-green-700' : 
                                        q.status === 'Rechazada' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                    }`}>{q.status}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mb-1 line-clamp-1">
                                    {q.model} • {q.stops} Paradas
                                </p>
                                <div className="flex justify-between items-end border-t border-slate-100 pt-2">
                                    <span className="font-black text-slate-800 text-xs">{formatter.format((q.price || 0) * (q.quantity || 1))}</span>
                                    <span className="text-[9px] text-slate-400">{q.projectDate}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* PANEL CENTRAL: CHAT UNIFICADO */}
        <div className="flex-1 flex flex-col bg-[#e5ddd5] relative min-w-[350px] shadow-inner">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            
            <div className="bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-2 flex justify-between items-center z-10 text-xs text-slate-600 shadow-sm">
                <span className="flex items-center gap-2 font-bold"><MessageSquare size={14} className="text-green-600"/> Chat Unificado</span>
                <span className="opacity-70">Contexto actual: <b>{viewingQuote.projectRef}</b></span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {interactions.map((msg) => {
                    const isMe = msg.type === 'whatsapp_sent' || msg.type === 'note';
                    const isSystem = msg.type === 'system';
                    
                    // Ver si el mensaje pertenece al proyecto que estamos viendo
                    const isFromCurrentView = String(msg.quote_id) === String(viewingQuote.id);
                    // Buscar el proyecto origen para mostrar la etiqueta
                    const originQuote = clientPortfolio.find(q => String(q.id) === String(msg.quote_id));

                    if (isSystem) return <div key={msg.id} className="text-center my-2"><span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">{msg.content}</span></div>;

                    return (
                        <div key={msg.id} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                            
                            {/* Etiqueta de Referencia (si es de otro proyecto del mismo cliente) */}
                            {!isFromCurrentView && originQuote && (
                                <span className={`text-[9px] mb-0.5 px-2 py-0.5 rounded-full font-bold shadow-sm ${isMe ? 'bg-blue-100 text-blue-700 mr-1' : 'bg-gray-200 text-gray-600 ml-1'}`}>
                                    Ref: {originQuote.projectRef}
                                </span>
                            )}

                            <div className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm relative text-sm border ${
                                isMe 
                                ? 'bg-[#d9fdd3] text-slate-900 border-[#c2eec0] rounded-tr-none' 
                                : 'bg-white text-slate-900 border-white rounded-tl-none'
                            }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                <div className="text-[9px] text-gray-400 mt-1 flex gap-1 items-center justify-end">
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {isMe && <CheckCircle2 size={12} className="text-blue-500"/>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="bg-slate-100 p-3 border-t border-slate-200 z-10">
                <div className="flex gap-2">
                    <div className="flex-1 bg-white rounded-full flex items-center border border-slate-300 focus-within:ring-2 focus-within:ring-green-500/50 transition-all shadow-sm pl-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Paperclip size={18}/></button>
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={`Escribir sobre ${viewingQuote.projectRef}...`}
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 px-2"
                        />
                    </div>
                    <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="bg-[#00a884] hover:bg-[#008f6f] text-white p-3 rounded-full transition-all shadow-md transform active:scale-95 disabled:opacity-50 disabled:transform-none">
                        {sending ? <Clock size={20} className="animate-spin"/> : <Send size={20} className="ml-0.5"/>}
                    </button>
                </div>
            </div>
        </div>

        {/* PANEL DERECHO: DETALLE DEL PROYECTO */}
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto hidden xl:flex flex-col p-6">
            <div className="mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Proyecto</span>
                <h3 className="font-black text-slate-800 text-xl">{viewingQuote.projectRef}</h3>
                <p className="text-xs text-slate-500">{viewingQuote.model}</p>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total con IVA</p>
                    <p className="text-2xl font-black text-blue-900">{formatter.format(((viewingQuote.price||0)*(viewingQuote.quantity||1))*1.16)}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button onClick={() => onUpdateStatus(viewingQuote.id, 'Aprobada')} className="py-2 bg-green-600 text-white font-bold text-xs rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                            Ganada
                        </button>
                        <button onClick={() => onUpdateStatus(viewingQuote.id, 'Rechazada')} className="py-2 bg-white border border-red-200 text-red-600 font-bold text-xs rounded-lg hover:bg-red-50 transition-colors">
                            Perdida
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm"><FileText size={16}/> Datos Técnicos</h4>
                    <ul className="space-y-2 text-sm text-slate-600 bg-white border border-slate-100 rounded-lg p-3">
                        <li className="flex justify-between border-b border-slate-50 pb-1"><span>Paradas:</span> <span className="font-bold">{viewingQuote.stops}</span></li>
                        <li className="flex justify-between border-b border-slate-50 pb-1"><span>Capacidad:</span> <span className="font-bold">{viewingQuote.capacity} kg</span></li>
                        <li className="flex justify-between border-b border-slate-50 pb-1"><span>Velocidad:</span> <span className="font-bold">{viewingQuote.speed} m/s</span></li>
                        <li className="flex justify-between pt-1"><span>Unidades:</span> <span className="font-bold">{viewingQuote.quantity}</span></li>
                    </ul>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                    <p className="font-bold flex items-center gap-2 mb-1"><AlertCircle size={14}/> Nota:</p>
                    <p>Los mensajes enviados se asociarán a <b>{viewingQuote.projectRef}</b> pero serán visibles en el historial unificado.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}