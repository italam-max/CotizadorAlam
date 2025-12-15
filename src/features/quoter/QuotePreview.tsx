// ARCHIVO: src/features/quoter/QuotePreview.tsx
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Download, Loader2, 
  MessageCircle, Mail, Share2 
} from 'lucide-react';
import type { QuoteData, UserProfile } from '../../types';
import { supabase } from '../../supabaseClient';
import { UserService } from '../../services/userService';

// Importamos el PDF y el generador de links
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QuotePDFDocument } from './QuotePDF';

interface QuotePreviewProps {
  data: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
}

export default function QuotePreview({ data, onBack, onUpdateStatus }: QuotePreviewProps) {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  // Cargamos el perfil del usuario para ponerlo en el PDF
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) UserService.getProfile(user.id).then(setActiveProfile);
    });
  }, []);

  // Formateador de moneda
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  const total = (data.price || 0) * (data.quantity || 1);

  // --- FUNCIONES DE COMPARTIR ---
  
  const handleShareWhatsapp = () => {
    const text = `Hola, te comparto la cotización *${data.projectRef}* para el proyecto de elevadores Alamex.\n\nModelo: ${data.model}\nNiveles: ${data.stops}\nInversión: ${formatter.format(total)}\n\n(Adjunto encontrarás el PDF oficial con los detalles técnicos).`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = `Cotización Alamex: ${data.projectRef}`;
    const body = `Estimado cliente,\n\nAdjunto encontrará la propuesta técnica y económica para su proyecto de elevadores.\n\nResumen:\nModelo: ${data.model}\nNiveles: ${data.stops}\nTotal: ${formatter.format(total)}\n\nQuedo atento a sus comentarios.\n\nSaludos cordiales.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* --- BARRA DE HERRAMIENTAS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
        
        {/* Lado Izquierdo: Volver */}
        <button onClick={onBack} className="text-gray-500 hover:text-blue-900 flex items-center gap-2 font-bold self-start md:self-center">
          <ArrowLeft size={20} /> <span className="hidden md:inline">Volver a editar</span>
        </button>
        
        {/* Lado Derecho: Acciones */}
        <div className="flex flex-wrap gap-2 justify-end">
            
            {/* 1. DESCARGAR PDF (Botón Principal) */}
            <PDFDownloadLink
                document={<QuotePDFDocument data={data} userProfile={activeProfile} />}
                fileName={`Cotizacion-${data.projectRef}.pdf`}
                className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2 text-sm shadow-md"
            >
                {({ loading }) => (
                    loading 
                    ? <><Loader2 className="animate-spin" size={18}/> Generando...</> 
                    : <><Download size={18} /> Descargar PDF</>
                )}
            </PDFDownloadLink>

            {/* 2. WHATSAPP */}
            <button 
                onClick={handleShareWhatsapp}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm transition-colors shadow-sm"
                title="Compartir texto por WhatsApp"
            >
                <MessageCircle size={18} /> <span className="hidden lg:inline">WhatsApp</span>
            </button>

            {/* 3. EMAIL */}
            <button 
                onClick={handleShareEmail}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold flex items-center gap-2 text-sm transition-colors shadow-sm"
                title="Redactar Correo"
            >
                <Mail size={18} />
            </button>

            {/* 4. MARCAR ENVIADA */}
            {data.id && (
                <button 
                    onClick={() => onUpdateStatus(data.id!, 'Enviada')}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-2 text-sm transition-colors shadow-sm border border-blue-800"
                >
                    <CheckCircle size={18} /> <span className="hidden lg:inline">Marcar Enviada</span>
                </button>
            )}
        </div>
      </div>

      {/* --- VISTA PREVIA VISUAL (HTML) --- */}
      <div className="flex-1 overflow-auto bg-gray-500/10 p-4 md:p-8 rounded-xl border border-gray-300 shadow-inner flex justify-center">
        
        {/* Hoja de Papel Simulada */}
        <div className="bg-white w-full max-w-3xl min-h-[800px] shadow-2xl p-10 md:p-16 relative transform transition-transform hover:scale-[1.005] duration-500">
            {/* Decoración Superior */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-900 to-blue-700"></div>
            <div className="absolute top-3 right-10 w-20 h-24 bg-yellow-400 shadow-lg rounded-b-lg flex items-end justify-center pb-4">
                <span className="text-blue-900 font-black text-xs tracking-widest uppercase writing-mode-vertical">Original</span>
            </div>
            
            <div className="flex justify-between items-start mb-12 mt-4">
                <div>
                    <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Cotización</h1>
                    <p className="text-gray-400 font-bold tracking-widest text-sm mt-1">{data.projectRef}</p>
                </div>
                <div className="text-right pr-24"> {/* Padding right para no chocar con la etiqueta amarilla */}
                    <p className="font-bold text-gray-800 text-lg">Elevadores Alamex</p>
                    <p className="text-xs text-blue-600 font-bold tracking-wider uppercase">Ascending Together</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Cliente / Proyecto</h3>
                    <p className="text-xl font-bold text-blue-900">{data.clientName || 'Nombre del Cliente'}</p>
                    <p className="text-sm text-gray-600">{data.contactEmail || 'Sin correo de contacto'}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Asesor Comercial</h3>
                    <p className="font-bold text-gray-800">{activeProfile?.full_name || 'Alamex Ventas'}</p>
                    <p className="text-xs text-gray-500">{activeProfile?.job_title || ''}</p>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-4 text-lg">Especificaciones Técnicas</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">Cantidad de Equipos</span>
                            <span className="font-bold text-gray-900 text-lg">{data.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">Modelo</span>
                            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{data.model}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">Capacidad de Carga</span>
                            <span className="font-bold text-gray-900">{data.capacity} kg</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">Velocidad</span>
                            <span className="font-bold text-gray-900">{data.speed} m/s</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">Niveles / Paradas</span>
                            <span className="font-bold text-gray-900">{data.stops}</span>
                        </div>
                         <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">Recorrido</span>
                            <span className="font-bold text-gray-900">{data.travel} mm</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 bg-gray-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <p className="text-blue-200 text-sm font-medium mb-1">Inversión Total Estimada</p>
                        <p className="text-xs text-gray-400">Incluye suministro e instalación</p>
                    </div>
                    <div className="text-right">
                         <h2 className="text-4xl font-black tracking-tight">{formatter.format(total)}</h2>
                         <p className="text-xs text-yellow-400 font-bold mt-2">+ IVA aplicable</p>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                <p>Este documento es una vista previa digital.</p>
                <p className="mt-1">Para compartir, por favor <strong>descargue el PDF oficial</strong> usando el botón rojo superior y adjúntelo en su correo o WhatsApp.</p>
            </div>
        </div>
      </div>
    </div>
  );
}