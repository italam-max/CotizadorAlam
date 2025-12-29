// ARCHIVO: src/features/quoter/QuoteCommercialEditor.tsx
import { useState, useEffect } from 'react';
import { 
  Shield, Clock, CreditCard, FileText, Calendar, DollarSign, 
  Save, X 
} from 'lucide-react';
import type { QuoteData, CommercialTerms } from '../../types';

interface QuoteCommercialEditorProps {
  data: QuoteData;
  onSave: (terms: CommercialTerms) => void;
  onCancel: () => void;
}

// Valores por defecto
const DEFAULT_TERMS: CommercialTerms = {
  paymentMethod: "50% Anticipo, 30% Al aviso de embarque, 20% Contra entrega",
  deliveryTime: "12 a 14 semanas a partir de la firma y anticipo",
  warranty: "18 meses en partes mecánicas, 12 meses en partes eléctricas",
  validity: "30 días naturales a partir de la fecha de emisión",
  currency: "Moneda Nacional (MXN) + IVA",
  generalConditions: "La preparación de la obra civil, cubo, acometida eléctrica y permisos corren por cuenta del cliente. No incluye trabajos de albañilería ni acabados externos al cubo."
};

export default function QuoteCommercialEditor({ data, onSave, onCancel }: QuoteCommercialEditorProps) {
  const [terms, setTerms] = useState<CommercialTerms>(DEFAULT_TERMS);

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (data.commercialTerms) {
      setTerms(data.commercialTerms);
    }
  }, [data]);

  const handleChange = (field: keyof CommercialTerms, value: string) => {
    setTerms(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-[#F9F7F2] rounded-2xl border border-[#D4AF37]/20 shadow-2xl overflow-hidden animate-fadeIn relative">
      
      {/* HEADER DE EDICIÓN */}
      <div className="bg-[#0A2463] p-6 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-overlay.png')] opacity-10"></div>
        <div className="relative z-10">
            <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-wide">
                <FileText className="text-[#D4AF37]" size={20}/> Condiciones Comerciales
            </h3>
            <p className="text-xs text-white/60 mt-1">Edita las cláusulas contractuales para {data.projectRef}</p>
        </div>
        <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
            <X size={24}/>
        </button>
      </div>

      {/* FORMULARIO PREMIUM */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute inset-0 arabesque-pattern opacity-20 pointer-events-none"></div>

        {/* Columna Izquierda */}
        <div className="space-y-6 relative z-10">
            <InputBlock 
                label="Condiciones de Pago" 
                icon={CreditCard} 
                value={terms.paymentMethod}
                onChange={(v: string) => handleChange('paymentMethod', v)}
                placeholder="Ej: 50% Anticipo..."
            />
            <InputBlock 
                label="Tiempo de Entrega" 
                icon={Clock} 
                value={terms.deliveryTime}
                onChange={(v: string) => handleChange('deliveryTime', v)}
                placeholder="Ej: 10-12 semanas..."
            />
            <InputBlock 
                label="Moneda y Divisa" 
                icon={DollarSign} 
                value={terms.currency}
                onChange={(v: string) => handleChange('currency', v)}
                placeholder="Ej: MXN + IVA"
            />
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6 relative z-10">
            <InputBlock 
                label="Garantía Extendida" 
                icon={Shield} 
                value={terms.warranty}
                onChange={(v: string) => handleChange('warranty', v)}
                placeholder="Ej: 12 meses..."
            />
             <InputBlock 
                label="Vigencia de Oferta" 
                icon={Calendar} 
                value={terms.validity}
                onChange={(v: string) => handleChange('validity', v)}
                placeholder="Ej: 15 días..."
            />
        </div>

        {/* Área Completa: Notas Generales */}
        <div className="col-span-1 md:col-span-2 relative z-10">
            <label className="text-[10px] font-bold text-[#0A2463] uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={14} className="text-[#D4AF37]"/> Condiciones Generales y Obra Civil
            </label>
            <textarea 
                rows={4}
                value={terms.generalConditions}
                onChange={(e) => handleChange('generalConditions', e.target.value)}
                className="w-full p-4 bg-white border border-[#0A2463]/10 rounded-xl text-sm font-medium text-[#0A2463] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none shadow-inner resize-none"
                placeholder="Especificaciones sobre obra civil, permisos, etc..."
            />
        </div>
      </div>

      {/* FOOTER DE ACCIÓN */}
      <div className="p-6 bg-white border-t border-[#0A2463]/5 flex justify-end gap-4">
        <button 
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors"
        >
            Cancelar
        </button>
        <button 
            onClick={() => onSave(terms)}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#0A2463] to-[#1e3a8a] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
            <Save size={18} className="text-[#D4AF37]"/> Guardar Condiciones
        </button>
      </div>
    </div>
  );
}

// Subcomponente de Input Estilizado
const InputBlock = ({ label, icon: Icon, value, onChange, placeholder }: any) => (
    <div className="group">
        <label className="text-[10px] font-bold text-[#0A2463]/60 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-[#0A2463] transition-colors">
            <Icon size={14} className="text-[#D4AF37]"/> {label}
        </label>
        <div className="relative">
            <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-white border border-[#0A2463]/10 rounded-xl text-sm font-bold text-[#0A2463] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none shadow-sm transition-all placeholder:text-gray-300 group-hover:border-[#0A2463]/30"
            />
        </div>
    </div>
);