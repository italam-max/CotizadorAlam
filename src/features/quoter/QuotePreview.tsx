// ARCHIVO: src/features/quoter/QuotePreview.tsx
import { useState } from 'react';
import { 
  Printer, ArrowLeft, Send, Shield, Clock, 
  CreditCard, Calendar, Edit3, FileText, Download 
} from 'lucide-react';
import type { QuoteData, CommercialTerms } from '../../types';
import QuoteCommercialEditor from './QuoteCommercialEditor';

interface QuotePreviewProps {
  data: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: number | string, status: QuoteData['status']) => void;
  onGoToTicket?: () => void;
  // Añadir una prop para actualizar la data global si es necesario
  onUpdateData?: (updatedQuote: QuoteData) => void; 
}

export default function QuotePreview({ data, onBack, onUpdateStatus, onUpdateData }: QuotePreviewProps) {
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  
  // Usar datos locales para la vista previa inmediata al editar
  const [previewData, setPreviewData] = useState<QuoteData>(data);

  const handleSaveTerms = (newTerms: CommercialTerms) => {
    const updated = { ...previewData, commercialTerms: newTerms };
    setPreviewData(updated);
    setIsEditingTerms(false);
    
    // Si tenemos una función para actualizar el estado padre, la llamamos
    if (onUpdateData) onUpdateData(updated); 
  };

  const terms = previewData.commercialTerms || {
    paymentMethod: "50% Anticipo - 50% Contra Entrega",
    deliveryTime: "12 Semanas",
    warranty: "12 Meses",
    validity: "30 Días",
    currency: "MXN",
    generalConditions: "Obra civil por cuenta del cliente."
  };

  // Si estamos en modo edición, mostramos el Editor
  if (isEditingTerms) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <QuoteCommercialEditor 
                data={previewData} 
                onSave={handleSaveTerms} 
                onCancel={() => setIsEditingTerms(false)} 
            />
        </div>
    );
  }

  // --- VISTA PREVIA (CONTRATO) ---
  return (
    <div className="h-full flex flex-col bg-[#525659] overflow-hidden relative">
      
      {/* HEADER DE ACCIONES (Estilo PDF Viewer) */}
      <div className="bg-[#323639] text-white px-6 py-4 flex justify-between items-center shadow-md z-20 shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={20}/>
            </button>
            <div>
                <h2 className="font-bold text-sm text-gray-200">{previewData.projectRef}.pdf</h2>
                <p className="text-[10px] text-gray-400">Vista Previa de Cotización</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsEditingTerms(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A2463] rounded-lg text-xs font-bold hover:bg-white transition-all shadow-lg"
            >
                <Edit3 size={14}/> Editar Condiciones
            </button>
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-300" title="Imprimir">
                <Printer size={20}/>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-300" title="Descargar">
                <Download size={20}/>
            </button>
            {previewData.status === 'Borrador' && (
                <button 
                    onClick={() => onUpdateStatus(previewData.id, 'Enviada')}
                    className="ml-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-all shadow-lg"
                >
                    <Send size={14}/> Aprobar y Enviar
                </button>
            )}
        </div>
      </div>

      {/* DOCUMENTO (Hoja de Papel) */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#525659]">
        <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-2xl relative flex flex-col animate-fadeIn">
            
            {/* Membrete / Encabezado del Documento */}
            <div className="p-12 pb-6 flex justify-between items-start border-b border-gray-100">
                <div>
                    <img src="/images/logo-alamex.png" alt="Alamex" className="h-16 object-contain mb-4"/>
                    <h1 className="text-2xl font-black text-[#0A2463] uppercase tracking-wide">Propuesta Económica</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">Ref: {previewData.projectRef}</p>
                </div>
                <div className="text-right">
                    <div className="bg-[#0A2463] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest inline-block mb-2">
                        {previewData.status}
                    </div>
                    <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Ciudad de México</p>
                </div>
            </div>

            {/* Cuerpo del Documento */}
            <div className="p-12 space-y-10 flex-1">
                
                {/* 1. Saludo */}
                <div>
                    <p className="text-sm text-gray-600 font-medium">Atención a:</p>
                    <h3 className="text-xl font-bold text-[#0A2463]">{previewData.clientName}</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        Por medio de la presente, ponemos a su consideración la propuesta técnica y económica para el suministro e instalación de equipos de elevación con las siguientes características:
                    </p>
                </div>

                {/* 2. Resumen Técnico (Simplificado para el ejemplo) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-black text-[#0A2463] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Especificaciones Técnicas</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Equipo:</span> <span className="font-bold text-gray-800">{previewData.model}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Niveles:</span> <span className="font-bold text-gray-800">{previewData.stops} Paradas</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Capacidad:</span> <span className="font-bold text-gray-800">{previewData.capacity} kg</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Velocidad:</span> <span className="font-bold text-gray-800">{previewData.speed} m/s</span></div>
                    </div>
                </div>

                {/* 3. CONDICIONES COMERCIALES (LO NUEVO E IMPORTANTE) */}
                <div>
                    <h4 className="text-sm font-black text-[#0A2463] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <FileText size={16} className="text-[#D4AF37]"/> Condiciones Comerciales
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <ConditionItem icon={CreditCard} label="Forma de Pago" value={terms.paymentMethod} />
                        <ConditionItem icon={Clock} label="Tiempo de Entrega" value={terms.deliveryTime} />
                        <ConditionItem icon={Shield} label="Garantía" value={terms.warranty} />
                        <ConditionItem icon={Calendar} label="Vigencia" value={terms.validity} />
                    </div>

                    <div className="p-4 border-l-4 border-[#D4AF37] bg-[#D4AF37]/5 rounded-r-lg">
                        <p className="text-[10px] font-bold text-[#0A2463] uppercase mb-1">Notas Generales / Obra Civil</p>
                        <p className="text-xs text-gray-600 leading-relaxed italic">
                            {terms.generalConditions}
                        </p>
                    </div>
                </div>

                {/* 4. Total */}
                <div className="flex justify-end mt-8 border-t-2 border-gray-100 pt-6">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inversión Total</p>
                        <p className="text-4xl font-black text-[#0A2463]">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format((previewData.price || 0) * (previewData.quantity || 1))}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-1">{terms.currency}</p>
                    </div>
                </div>
            </div>

            {/* Footer del Documento */}
            <div className="bg-[#0A2463] text-white p-12 text-center">
                <p className="text-sm font-bold mb-2">Elevadores Alamex S.A. de C.V.</p>
                <p className="text-[10px] text-white/60">Ascending Together</p>
            </div>
        </div>
      </div>
    </div>
  );
}

const ConditionItem = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 min-w-[20px] text-[#D4AF37]">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-gray-800 leading-snug">{value}</p>
        </div>
    </div>
);