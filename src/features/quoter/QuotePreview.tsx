// ARCHIVO: src/features/quoter/QuotePreview.tsx
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Loader2, MessageCircle, Mail, Share2, 
  ChevronDown, FileText, CheckCircle, ArrowRightCircle
} from 'lucide-react';
import type { QuoteData, UserProfile } from '../../types';
import { supabase } from '../../supabaseClient';
import { UserService } from '../../services/userService';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QuotePDFDocument } from './QuotePDF';

interface QuotePreviewProps {
  data: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
  onGoToTicket: () => void; // <--- NUEVA PROP RECIBIDA
}

export default function QuotePreview({ data, onBack, onUpdateStatus, onGoToTicket }: QuotePreviewProps) {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [processing, setProcessing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cargamos el perfil
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) UserService.getProfile(user.id).then(setActiveProfile);
    });
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  const total = (data.price || 0) * (data.quantity || 1);

  // --- COMPARTIR ---
  const handleShareWhatsapp = () => {
    const text = `Hola, te comparto la cotización...`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=Cotización&body=...`;
    setShowShareMenu(false);
  };

  // --- LÓGICA DEL BOTÓN DE SEGUIMIENTO (TICKET) ---
  const handleConfirmSent = async () => {
      setProcessing(true);
      
      // 1. Si sigue en borrador, la pasamos a 'Enviada'
      if (data.status === 'Borrador') {
          try {
              const { error } = await supabase
                  .from('quotes')
                  .update({ status: 'Enviada' })
                  .eq('id', data.id);
              
              if (error) throw error;
              
              // Actualizamos el estado global en App.tsx
              onUpdateStatus(data.id!, 'Enviada');
          } catch (err) {
              console.error(err);
              alert("Error al actualizar estatus");
              setProcessing(false);
              return;
          }
      }
      
      // 2. Nos vamos al Ticket (CRM)
      onGoToTicket();
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* --- BARRA DE HERRAMIENTAS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 print:hidden relative z-50 gap-4">
        
        {/* Lado Izquierdo: Volver */}
        <button onClick={onBack} className="text-gray-500 hover:text-blue-900 flex items-center gap-2 font-bold transition-colors self-start md:self-auto">
          <ArrowLeft size={20} /> <span className="hidden md:inline">Volver</span>
        </button>
        
        {/* Lado Derecho: Acciones */}
        <div className="flex flex-wrap gap-3 justify-end items-center w-full md:w-auto">
            
            {/* BOTÓN 1: COMPARTIR (Lo mantuvimos igual) */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                    <Share2 size={18} />
                    <span>Compartir</span>
                    <ChevronDown size={16} />
                </button>
                {/* Menú Desplegable ... (Mismo código de antes) */}
                {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp origin-top-right ring-1 ring-black/5">
                        <div className="p-1.5">
                             <div className="hover:bg-slate-50 rounded-lg transition-colors">
                                <PDFDownloadLink document={<QuotePDFDocument data={data} userProfile={activeProfile} />} fileName={`Cotizacion-${data.projectRef}.pdf`} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700">
                                    {({ loading }) => (loading ? '...' : <><FileText className="text-red-500" size={18} /> Descargar PDF</>)}
                                </PDFDownloadLink>
                            </div>
                            <button onClick={handleShareEmail} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg text-left"><Mail className="text-blue-500" size={18} /> Correo</button>
                            <button onClick={handleShareWhatsapp} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg text-left"><MessageCircle className="text-green-500" size={18} /> WhatsApp</button>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTÓN 2: CONFIRMAR Y SEGUIR (EL NUEVO BRIDGE) */}
            <button 
                onClick={handleConfirmSent}
                disabled={processing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all ${
                    data.status === 'Borrador' 
                    ? 'bg-green-600 hover:bg-green-700 border-b-4 border-green-800' // Estilo llamativo si es borrador
                    : 'bg-blue-900 hover:bg-blue-800 border-b-4 border-blue-950'    // Estilo normal si ya fue enviada
                }`}
            >
                {processing ? <Loader2 className="animate-spin" size={20}/> : (
                    data.status === 'Borrador' ? <CheckCircle size={20}/> : <ArrowRightCircle size={20}/>
                )}
                <span>
                    {data.status === 'Borrador' ? 'Confirmar Envío e Ir al Ticket' : 'Ir al Ticket de Seguimiento'}
                </span>
            </button>

        </div>
      </div>

      {/* --- VISTA PREVIA DEL DOCUMENTO (IGUAL QUE ANTES) --- */}
      <div className="flex-1 overflow-auto bg-gray-500/10 p-4 md:p-8 rounded-xl border border-gray-300 shadow-inner flex justify-center z-0">
        <div className="bg-white w-full max-w-3xl min-h-[800px] shadow-2xl p-10 md:p-12 relative">
            
            {/* Decoración Superior */}
            <div className="absolute top-0 left-0 w-full h-3 flex">
                <div className="w-3/4 h-full bg-blue-900"></div>
                <div className="w-1/4 h-full bg-yellow-400"></div>
            </div>
            
            {/* ENCABEZADO */}
            <div className="flex justify-between items-start mt-6 mb-12">
                <div>
                    <img src="/images/logo-alamex.png" alt="Logo" className="h-12 object-contain mb-4" />
                    <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tight leading-none">Propuesta<br/>Comercial</h1>
                    <p className="text-yellow-600 font-bold tracking-widest text-xs mt-2 uppercase">Ascending Together</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 font-medium text-sm mb-1">Referencia</p>
                    <p className="font-black text-gray-800 text-xl tracking-tight">{data.projectRef}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* CLIENTE */}
            <div className="mb-10 p-8 bg-slate-50 rounded-xl border-l-4 border-yellow-400 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preparado para</h3>
                    <p className="text-xl font-bold text-slate-900">{data.clientName || 'Cliente Estimado'}</p>
                    <p className="text-sm text-slate-600 font-medium">{data.contactEmail || 'Sin correo registrado'}</p>
                </div>
                <div className="md:text-right">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Asesor Comercial</h3>
                    <p className="font-bold text-slate-800">{activeProfile?.full_name || 'Ventas Alamex'}</p>
                    <p className="text-xs text-blue-600 font-bold uppercase mt-1">{activeProfile?.job_title || 'Ejecutivo de Cuenta'}</p>
                </div>
            </div>

            {/* DATOS */}
            <div className="space-y-8">
                <div>
                    <h3 className="font-black text-blue-900 text-lg mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        Especificaciones Técnicas
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm border-t border-b border-gray-100 py-6">
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Cantidad</span><span className="font-bold text-slate-900 text-lg">{data.quantity} Eq.</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Modelo</span><span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">{data.model}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Capacidad</span><span className="font-bold text-slate-900">{data.capacity} kg</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Velocidad</span><span className="font-bold text-slate-900">{data.speed} m/s</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Paradas</span><span className="font-bold text-slate-900">{data.stops} Niveles</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Recorrido</span><span className="font-bold text-slate-900">{data.travel} mm</span></div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-16 bg-blue-900 text-white p-8 rounded-xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div><p className="text-blue-200 text-sm font-medium mb-1">Inversión Total Estimada</p><p className="text-[10px] text-blue-300 uppercase tracking-wider">Suministro + Instalación</p></div>
                    <div className="text-right"><h2 className="text-4xl font-black tracking-tight">{formatter.format(total)}</h2><p className="text-xs text-yellow-400 font-bold mt-2 flex justify-end items-center gap-1">+ IVA (16%)</p></div>
                </div>
            </div>
            <div className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest"><p>Elevadores Alamex S.A. de C.V.</p></div>
        </div>
      </div>
    </div>
  );
}