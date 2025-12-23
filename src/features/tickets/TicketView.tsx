// ARCHIVO: src/features/tickets/TicketView.tsx
import { useState } from 'react';
import { 
  ArrowLeft, Edit3, FileText, CheckCircle2, XCircle, Handshake, 
  MapPin, Briefcase, History, ShieldAlert, Lock, 
  Crown, Star, Sparkles, Building, Mail, Phone, ExternalLink, Box,
  Activity, // <--- Faltaba este para el ROI
  Send      // <--- Faltaba este para el chat
} from 'lucide-react';
import type { QuoteData } from '../../types';
import FollowUpAssistant from './FollowUpAssistant';

interface TicketViewProps {
  quote: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
  allQuotes?: QuoteData[]; 
}

type Note = {
    id: string;
    text: string;
    date: string;
    author: string;
    type: 'manual' | 'system';
};

// Definición de Tags de Cliente
const CLIENT_TAGS = [
    { key: 'NEW', label: 'Cliente Nuevo', color: 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20', icon: Sparkles },
    { key: 'VIP', label: 'Socio VIP', color: 'text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/10', icon: Crown },
    { key: 'RECURRING', label: 'Recurrente', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20', icon: Star },
    { key: 'CORPORATE', label: 'Corporativo', color: 'text-indigo-400 border-indigo-500/50 bg-indigo-900/20', icon: Building },
];

export default function TicketView({ quote, onBack, onUpdateStatus, allQuotes = [] }: TicketViewProps) {
  
  // Guardas de seguridad
  if (!quote) return <div className="p-10 text-white">Cargando datos del proyecto...</div>;

  const [notes, setNotes] = useState<Note[]>([
    { id: '1', text: 'Cotización creada y enviada al cliente.', date: quote.projectDate || new Date().toISOString(), author: 'Sistema', type: 'system' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [tagIndex, setTagIndex] = useState(0); 

  // --- LÓGICA DE NORMALIZACIÓN DE CLIENTES ---
  const normalizeStr = (str: string) => str ? str.trim().toLowerCase() : '';

  // Filtramos buscando coincidencias sin importar mayúsculas/minúsculas
  const relatedQuotes = allQuotes && allQuotes.length > 0 
    ? allQuotes.filter(q => 
        q && 
        normalizeStr(q.clientName) === normalizeStr(quote.clientName) && 
        q.id !== quote.id
      ) 
    : []; 

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
        id: Date.now().toString(),
        text: newNote,
        date: new Date().toISOString(),
        author: 'Ejecutivo',
        type: 'manual'
    };
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const cycleClientTag = () => {
    setTagIndex((prev) => (prev + 1) % CLIENT_TAGS.length);
  };

  const currentTag = CLIENT_TAGS[tagIndex];
  const TagIcon = currentTag.icon;
  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  // Helpers visuales
  const clientInitial = quote.clientName ? quote.clientName.charAt(0).toUpperCase() : '?';
  const lastManualNote = notes.find(n => n.type === 'manual')?.date;

  return (
    <div className="h-full flex flex-col bg-[#051338] animate-fadeIn overflow-y-auto custom-scrollbar relative text-white">
      
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
          backgroundImage:  'radial-gradient(#D4AF37 0.5px, transparent 0.5px), radial-gradient(#D4AF37 0.5px, transparent 0.5px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
      }}></div>
      
      {/* HEADER DE COMANDO */}
      <div className="px-8 py-6 flex items-center justify-between bg-[#020A1A]/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#D4AF37]/20 shadow-2xl">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#051338] transition-all"
            >
                <ArrowLeft size={20}/>
            </button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{quote.projectRef}</h1>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeColor(quote.status)}`}>
                        {quote.status}
                    </span>
                </div>
                <p className="text-xs text-white/50 font-medium flex items-center gap-1 mt-1">
                    <Lock size={10}/> Sala de Cierre Segura • Folio: #{quote.id}
                </p>
            </div>
        </div>

        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/10 transition-all">
                <FileText size={16}/> Ver PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#051338] rounded-lg text-xs font-bold hover:bg-[#B5942E] transition-all shadow-lg shadow-[#D4AF37]/20">
                <Edit3 size={16}/> Editar Datos
            </button>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="p-6 md:p-8 z-10 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: GESTIÓN DE CIERRE (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. TARJETA DE VALOR (Premium Dark) */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0A2463] to-[#020A1A] shadow-2xl group">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                
                <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2">Valor Potencial</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                                {formatter.format((quote.price || 0) * (quote.quantity || 1))}
                            </h2>
                            <p className="text-sm text-gray-400 mt-2 font-medium flex items-center gap-2">
                                <Activity size={14} className="text-[#D4AF37]"/> ROI Estimado
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="inline-flex flex-col items-end">
                                <span className="text-xs text-gray-400 font-bold uppercase">Configuración</span>
                                <span className="text-lg font-bold text-white">{quote.quantity} x {quote.model}</span>
                                <span className="text-xs text-[#D4AF37]">{quote.stops} Paradas</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/10 my-8"></div>

                    {/* BOTONES DE DECISIÓN CRÍTICA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => onUpdateStatus(quote.id, 'Aprobada')}
                            className="py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all flex flex-col items-center justify-center gap-1 group/btn"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald-100"/> Marcar Ganada
                            </div>
                            <span className="text-[9px] text-emerald-100 opacity-60 font-normal group-hover/btn:opacity-100">Cerrar trato exitosamente</span>
                        </button>

                        <button 
                            onClick={() => onUpdateStatus(quote.id, 'Por Seguimiento')}
                            className="py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942E] hover:to-[#D4AF37] text-[#051338] font-bold text-sm shadow-lg hover:shadow-[#D4AF37]/20 transition-all flex flex-col items-center justify-center gap-1 group/btn border border-[#D4AF37]/50"
                        >
                            <div className="flex items-center gap-2">
                                <Handshake size={18}/> Iniciar Negociación
                            </div>
                            <span className="text-[9px] text-[#051338] opacity-60 font-normal group-hover/btn:opacity-100">Activar etapa de negociación</span>
                        </button>

                        <button 
                            onClick={() => onUpdateStatus(quote.id, 'Rechazada')}
                            className="py-4 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 group/btn"
                        >
                            <div className="flex items-center gap-2">
                                <XCircle size={18}/> Marcar Perdida
                            </div>
                            <span className="text-[9px] opacity-40 font-normal group-hover/btn:opacity-100">Archivar proyecto</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. BITÁCORA DE SEGUIMIENTO (INMUTABLE) */}
            <div className="bg-[#020A1A]/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <History size={14} className="text-[#D4AF37]"/> Bitácora de Actividad
                    </h3>
                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                        <ShieldAlert size={10}/> Registro Inmutable
                    </span>
                </div>
                
                <div className="p-6">
                    {/* Input de Nueva Nota */}
                    <div className="flex gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#051338] shrink-0 font-bold">Yo</div>
                        <div className="flex-1 relative">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Escribe una nota de seguimiento (llamada, correo, reunión)..."
                                className="w-full bg-[#051338] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none min-h-[80px] resize-none"
                            />
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <button 
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="p-2 bg-[#D4AF37] text-[#051338] rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={14}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Historial (Timeline) */}
                    <div className="space-y-6 pl-4 border-l border-white/10">
                        {notes.map((note) => (
                            <div key={note.id} className="relative pl-6 group">
                                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#051338] ${note.type === 'manual' ? 'bg-[#D4AF37]' : 'bg-blue-500'}`}></div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase ${note.type === 'manual' ? 'text-[#D4AF37]' : 'text-blue-400'}`}>
                                            {note.author}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(note.date).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                        {note.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: CLIENTE E INTELIGENCIA (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. TARJETA DE IDENTIDAD (CONTACTO) */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B5942E] rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#020A1A] rounded-2xl p-6 h-full flex flex-col items-center">
                    
                    <div className="w-24 h-24 rounded-full border-4 border-[#020A1A] bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center text-[#0A2463] text-4xl font-black mb-4 shadow-[0_10px_30px_rgba(255,255,255,0.1)] absolute -top-12 ring-2 ring-[#D4AF37]/50">
                        {clientInitial}
                    </div>
                    
                    <div className="mt-10 mb-4 w-full text-center">
                        <h2 className="text-xl font-bold text-white leading-tight mb-2">{quote.clientName || 'Cliente'}</h2>
                        
                        <div className="flex justify-center mb-6">
                            <button 
                                onClick={cycleClientTag}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${currentTag.color}`}
                                title="Clic para cambiar clasificación"
                            >
                                <TagIcon size={12}/> {currentTag.label}
                            </button>
                        </div>

                        <div className="space-y-3 w-full border-t border-white/10 pt-4 text-left">
                            <ContactRow icon={Mail} label="Correo" value="contacto@cliente.com" />
                            <ContactRow icon={Phone} label="Teléfono" value="+52 55 1234 5678" />
                            <ContactRow icon={MapPin} label="Ubicación" value="Ciudad de México, CDMX" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. VENTANA DE PROYECTOS RELACIONADOS (LÓGICA NORMALIZADA) */}
            <div className="bg-[#020A1A]/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <Box size={14} className="text-[#D4AF37]"/> Portafolio del Cliente
                    </h3>
                    <span className="bg-white/10 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {relatedQuotes.length}
                    </span>
                </div>
                
                <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {relatedQuotes.length > 0 ? (
                        relatedQuotes.map((rel: any) => (
                            <div key={rel.id} className="p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-[#D4AF37]/20 group transition-all cursor-pointer flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">{rel.projectRef}</p>
                                        <ExternalLink size={10} className="text-gray-600 group-hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{rel.projectDate} • {rel.model || 'N/A'}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadgeColor(rel.status)}`}>
                                    {rel.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-xs text-gray-500 py-4 italic">No hay otros proyectos.</p>
                    )}
                </div>
            </div>

            {/* 3. ASISTENTE DE SEGUIMIENTO (Importado) */}
            <FollowUpAssistant quote={quote} lastNoteDate={lastManualNote} />

            {/* 4. PROGRESO VISUAL */}
            <div className="bg-[#020A1A]/60 p-6 rounded-2xl border border-white/10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase size={14} className="text-[#D4AF37]"/> Fase Actual
                </h3>
                <div className="space-y-6 relative">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10"></div>
                    <StatusItem label="Borrador" isActive={true} isCompleted={true} />
                    <StatusItem label="Enviada" isActive={true} isCompleted={true} />
                    <StatusItem 
                        label="En Negociación" 
                        isActive={['Por Seguimiento', 'Aprobada'].includes(quote.status)} 
                        isCompleted={quote.status === 'Aprobada'} 
                        isCurrent={quote.status === 'Por Seguimiento'}
                    />
                    <StatusItem label="Cierre Ganado" isActive={quote.status === 'Aprobada'} isCompleted={quote.status === 'Aprobada'} isFinal />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

const ContactRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
        <div className="w-8 h-8 rounded-full bg-[#0A2463]/50 flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50">
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-xs font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">{value}</p>
        </div>
    </div>
);

const StatusItem = ({ label, isActive, isCompleted, isCurrent, isFinal }: any) => (
    <div className="flex items-center gap-3 relative z-10">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
            isCompleted 
            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#051338]' 
            : isActive 
                ? 'bg-[#051338] border-[#D4AF37] text-[#D4AF37]' 
                : 'bg-[#051338] border-gray-600 text-transparent'
        }`}>
            {isCompleted && <CheckCircle2 size={12}/>}
            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></div>}
        </div>
        <p className={`text-xs font-bold ${isActive ? (isFinal && isCompleted ? 'text-emerald-400' : 'text-white') : 'text-gray-600'}`}>
            {label}
        </p>
    </div>
);

const getStatusBadgeColor = (status: string) => {
    if (status === 'Aprobada') return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    if (status === 'Rechazada') return "bg-red-500/20 text-red-400 border-red-500/50";
    if (status === 'Por Seguimiento') return "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50";
    if (status === 'Enviada') return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    return "bg-white/10 text-gray-300 border-white/20";
};