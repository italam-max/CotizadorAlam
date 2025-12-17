// ARCHIVO: src/features/tickets/TicketView.tsx
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, Clock, CheckCircle2, 
  User, Paperclip
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { supabase } from '../../supabaseClient';
import { WhatsappService } from '../../services/whatsappService';

interface TicketViewProps {
  quote: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
}

interface Interaction {
  id: string;
  quote_id: number;
  type: 'whatsapp_sent' | 'whatsapp_received' | 'note' | 'system';
  content: string;
  created_at: string;
}

export default function TicketView({ quote, onBack, onUpdateStatus }: TicketViewProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

  // 1. Cargar historial + Suscripción Realtime
  useEffect(() => {
    const fetchInteractions = async () => {
      // Limitamos a 50 para rendimiento, ordenados por fecha
      const { data } = await supabase
          .from('interactions')
          .select('*')
          .eq('quote_id', quote.id)
          .order('created_at', { ascending: true });
      
      if (data) setInteractions(data as any);
    };

    fetchInteractions();

    // Suscripción en vivo
    const channel = supabase
      .channel(`chat_room_${quote.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'interactions', 
          filter: `quote_id=eq.${quote.id}` 
        },
        (payload) => {
          setInteractions((prev) => [...prev, payload.new as Interaction]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [quote.id]);

  // Auto-scroll al fondo al recibir mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
        // 1. Enviar a Whapi
        if (quote.clientPhone) {
            await WhatsappService.sendMessage(quote.clientPhone, newMessage);
        }
        
        // 2. Guardar en Base de Datos (Esto disparará el Realtime)
        // Ojo: whapi-hook NO insertará este mensaje de nuevo gracias al filtro 'from_me' que pusimos en el Backend.
        await supabase.from('interactions').insert({
            quote_id: quote.id,
            type: quote.clientPhone ? 'whatsapp_sent' : 'note',
            content: newMessage,
            created_at: new Date().toISOString()
        });

        setNewMessage('');
    } catch (error: any) {
        alert(`Error enviando: ${error.message}`);
    } finally {
        setSending(false);
    }
  };

  const sendQuickReminder = () => {
      setNewMessage(`Hola ${quote.clientName}, ¿tuviste oportunidad de revisar la propuesta? Quedamos atentos.`);
  };

  return (
    // --- CORRECCIÓN CLAVE DE DISEÑO ---
    // Usamos 'style' con height calculado.
    // 100vh (toda la pantalla) - 100px (aprox header y márgenes)
    // Esto fuerza al contenedor a tener un tamaño fijo y evita que crezca infinitamente.
    <div 
        className="flex flex-col bg-slate-100 animate-fadeIn overflow-hidden rounded-xl border border-slate-300 shadow-xl"
        style={{ height: 'calc(100vh - 100px)' }} 
    >
      
      {/* HEADER DE LA VENTANA DE CHAT */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ArrowLeft size={20}/>
            </button>
            <div>
                <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    {quote.projectRef} 
                    <span className="hidden md:inline-block text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Chat Whapi</span>
                </h2>
                <div className="flex items-center gap-2 text-xs mt-1">
                    <span className={`w-2 h-2 rounded-full ${quote.status === 'Aprobada' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
                    <span className="font-bold text-slate-600 truncate max-w-[150px]">{quote.clientName}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onUpdateStatus(quote.id, 'Aprobada')} className="text-xs px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded font-bold transition-colors">Ganada</button>
            <button onClick={() => onUpdateStatus(quote.id, 'Rechazada')} className="text-xs px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded font-bold transition-colors">Perdida</button>
        </div>
      </div>

      {/* CONTENIDO DIVIDIDO (INFO + CHAT) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* COLUMNA IZQ: INFO (Oculta en móvil para ahorrar espacio) */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto hidden md:block p-5 shadow-[inset_-10px_0_15px_-10px_rgba(0,0,0,0.05)]">
             <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-3">
                    <User size={32} />
                </div>
                <h3 className="font-bold text-slate-800">{quote.clientName}</h3>
                <p className="text-xs text-slate-500">{quote.clientPhone || 'Sin teléfono'}</p>
                <p className="text-xs text-slate-400 mt-1">{quote.clientEmail}</p>
             </div>
             
             <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Cotizado</p>
                    <p className="text-lg font-black text-blue-900">{formatter.format((quote.price||0)*(quote.quantity||1))}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Equipo</p>
                    <p className="text-sm font-bold text-slate-700">{quote.model}</p>
                    <p className="text-xs text-slate-500">{quote.stops} Paradas • {quote.quantity} Unidad(es)</p>
                </div>
             </div>
        </div>

        {/* COLUMNA DER: CHAT (ÁREA CRÍTICA) */}
        {/* 'min-h-0' permite que el scroll funcione dentro de Flexbox */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#e5ddd5] relative">
            
            {/* FONDO DECORATIVO WHATSAPP */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

            {/* LISTA DE MENSAJES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                
                {interactions.map((msg) => {
                    // LÓGICA DE DISTINCIÓN VISUAL
                    const isMe = msg.type === 'whatsapp_sent' || msg.type === 'note';
                    const isSystem = msg.type === 'system';
                    
                    if (isSystem) return (
                        <div key={msg.id} className="text-center my-2">
                             <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{msg.content}</span>
                        </div>
                    );

                    return (
                        <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 shadow-sm relative text-sm group transition-all ${
                                isMe 
                                ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none mr-1' // Enviado (Verde)
                                : 'bg-white text-slate-900 rounded-tl-none ml-1'    // Recibido (Blanco)
                            }`}>
                                {/* Nombre del remitente */}
                                <p className={`text-[9px] font-bold mb-0.5 ${isMe ? 'text-green-700 text-right' : 'text-blue-600 text-left'}`}>
                                    {isMe ? 'Tú' : quote.clientName}
                                </p>

                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                
                                <div className="text-[9px] text-gray-400 mt-1 flex gap-1 items-center justify-end opacity-70">
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {isMe && <CheckCircle2 size={10} className="text-blue-500"/>}
                                </div>
                                
                                {/* Triangulito decorativo CSS */}
                                <div className={`absolute top-0 w-0 h-0 border-[6px] border-transparent ${
                                    isMe 
                                    ? 'right-[-6px] border-t-[#d9fdd3] border-l-[#d9fdd3]' 
                                    : 'left-[-6px] border-t-white border-r-white'
                                }`}></div>
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            {/* ÁREA DE INPUT (FIJA) */}
            <div className="bg-[#f0f2f5] px-4 py-3 shrink-0 z-10 border-t border-slate-300">
                
                <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                    <button onClick={sendQuickReminder} className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 transition-colors shadow-sm">
                        ⚡ Recordatorio de Cotización
                    </button>
                    {/* Más botones rápidos si deseas */}
                </div>

                <div className="flex items-end gap-2">
                    <div className="flex-1 bg-white rounded-2xl flex items-center border border-slate-300 focus-within:ring-2 focus-within:ring-green-500/50 transition-all shadow-sm">
                        <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors"><Paperclip size={20}/></button>
                        <textarea 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-transparent border-none outline-none text-sm py-3 max-h-32 resize-none"
                            rows={1}
                            style={{minHeight: '44px'}} // Altura mínima cómoda
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                    </div>
                    <button 
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className={`p-3 rounded-full shadow-md transition-all transform active:scale-95 flex items-center justify-center w-12 h-12 ${
                            sending || !newMessage.trim() 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-[#00a884] hover:bg-[#008f6f] text-white'
                        }`}
                    >
                         {sending ? <Clock size={20} className="animate-spin"/> : <Send size={20} className="ml-0.5"/>}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}