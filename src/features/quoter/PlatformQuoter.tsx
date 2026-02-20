// ARCHIVO: src/features/quoter/PlatformQuoter.tsx
import { useState, useEffect } from 'react';
import { 
  Truck, Calculator, Layout, Save, 
  CheckCircle2 
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { InputGroup } from '../../components/ui/InputGroup';
import { ClientAutocomplete } from '../../components/ui/ClientAutocomplete';
import { validateConfiguration } from '../../services/calculations';

interface PlatformQuoterProps {
  initialData: QuoteData;
  existingQuotes: QuoteData[];
  onUpdate: (data: QuoteData) => void;
  onSave: (data: QuoteData) => void;
  onViewPreview: () => void;
}

const STEPS = [
  { id: 1, label: 'Proyecto', icon: Truck },
  { id: 2, label: 'Carga y Obra', icon: Calculator },
  { id: 3, label: 'Especificaciones', icon: Layout },
];

export function PlatformQuoter({ 
  initialData, existingQuotes, onUpdate, onSave}: PlatformQuoterProps) {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>({
      ...initialData,
      model: initialData.model || 'PLAT', // Por defecto plataforma
      speed: initialData.speed || 0.15    // Velocidad típica de plataforma
  });
  const [validation, setValidation] = useState<{warnings: string[], fieldsWithError: string[]}>({warnings: [], fieldsWithError: []});

  useEffect(() => {
      const res = validateConfiguration(formData);
      setValidation(res);
  }, [formData]);

  const updateField = (field: keyof QuoteData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const getInputClass = (fieldName: string) => {
      const hasError = validation.fieldsWithError.includes(fieldName);
      return `form-input transition-all ${hasError ? 'border-red-500 bg-red-50' : 'border-slate-300'}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* HEADER SIMILAR AL MANUAL QUOTER PERO CON ESTILO INDUSTRIAL */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
            <h2 className="text-lg font-black text-[#0A2463]">Cotizador de Sistemas de Carga</h2>
            <p className="text-xs text-slate-500">Montacargas y Elevadores Vehiculares</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {STEPS.map(s => (
                <button key={s.id} onClick={() => setCurrentStep(s.id)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${currentStep === s.id ? 'bg-[#0A2463] text-white shadow-md' : 'text-slate-400'}`}>
                    <s.icon size={14} /> {s.label}
                </button>
            ))}
        </div>

        <div className="flex gap-2">
            <button onClick={() => onSave(formData)} className="btn-primary bg-[#D4AF37] text-[#0A2463] px-4 py-2 text-xs font-black flex gap-2 items-center rounded-lg hover:bg-[#b8962d]">
                <Save size={16}/> GUARDAR
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <div className="max-w-3xl mx-auto space-y-8 pb-10">
                
                {/* PASO 1: GENERAL */}
                {currentStep === 1 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">Información del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <ClientAutocomplete value={formData.clientName} onChange={v => updateField('clientName', v)} existingQuotes={existingQuotes}/>
                            </div>
                            <InputGroup label="Referencia de Obra">
                                <input className={getInputClass('projectRef')} value={formData.projectRef} onChange={e => updateField('projectRef', e.target.value)} placeholder="Ej: BODEGA-NORTE-01"/>
                            </InputGroup>
                            <InputGroup label="Uso Primario">
                                <select className="form-select" value={formData.model} onChange={e => updateField('model', e.target.value)}>
                                    <option value="PLAT">Montacargas Industrial</option>
                                    <option value="CAR">Elevador Vehicular</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>
                )}

                {/* PASO 2: TÉCNICO */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">Capacidad de Carga</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <InputGroup label="Capacidad (kg)">
                                    <select className="form-select font-bold" value={formData.capacity} onChange={e => updateField('capacity', Number(e.target.value))}>
                                        {[1000, 1500, 2000, 2500, 3000, 4000, 5000].map(c => (
                                            <option key={c} value={c}>{c} kg</option>
                                        ))}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Velocidad (m/s)">
                                    <select className="form-select" value={formData.speed} onChange={e => updateField('speed', e.target.value)}>
                                        <option value="0.10">0.10 m/s (Estándar)</option>
                                        <option value="0.15">0.15 m/s</option>
                                        <option value="0.20">0.20 m/s</option>
                                    </select>
                                </InputGroup>
                                <InputGroup label="Paradas">
                                    <input type="number" min="2" className="form-input" value={formData.stops} onChange={e => updateField('stops', Number(e.target.value))}/>
                                </InputGroup>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">Dimensiones de Plataforma</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="Ancho Plataforma (mm)">
                                    <input type="number" className="form-input" value={formData.shaftWidth} onChange={e => updateField('shaftWidth', Number(e.target.value))}/>
                                </InputGroup>
                                <InputGroup label="Fondo Plataforma (mm)">
                                    <input type="number" className="form-input" value={formData.shaftDepth} onChange={e => updateField('shaftDepth', Number(e.target.value))}/>
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3: ESPECIFICACIONES */}
                {currentStep === 3 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">Cerramientos y Seguridad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Tipo de Puerta">
                                <select className="form-select" value={formData.doorType} onChange={e => updateField('doorType', e.target.value)}>
                                    <option value="Manual Batiente">Manual Batiente</option>
                                    <option value="Puerta Reja">Puerta Tipo Reja</option>
                                    <option value="Automática Reforzada">Automática Reforzada</option>
                                </select>
                            </InputGroup>
                            <InputGroup label="Acabado de Estructura">
                                <input type="text" className="form-input" value={formData.cabinFinish} onChange={e => updateField('cabinFinish', e.target.value)} placeholder="Ej: Pintura Epóxica / Galvanizado"/>
                            </InputGroup>
                            <InputGroup label="Piso de Plataforma">
                                <select className="form-select" value={formData.cabinFloor} onChange={e => updateField('cabinFloor', e.target.value)}>
                                    <option value="Placa Antiderrapante">Placa Antiderrapante</option>
                                    <option value="Lámina Lisa">Lámina Lisa</option>
                                    <option value="Rejilla Irving">Rejilla Irving</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>
                )}
             </div>
          </div>

          {/* MONITOR TÉCNICO (Opcional, reutilizado) */}
          <div className="w-[350px] border-l bg-slate-50 p-6 hidden lg:block">
              <div className="bg-[#0A2463] text-white p-6 rounded-2xl shadow-lg">
                  <h4 className="text-[#D4AF37] font-black text-xs tracking-widest mb-4">ESPECIFICACIÓN DE CARGA</h4>
                  <div className="space-y-4">
                      <div>
                          <p className="text-[10px] text-slate-400 uppercase">Modelo Seleccionado</p>
                          <p className="font-bold">{formData.model === 'PLAT' ? 'MONTACARGAS' : 'VEHICULAR'}</p>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 uppercase">Capacidad Total</p>
                          <p className="text-2xl font-black text-[#D4AF37]">{formData.capacity} KG</p>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] text-slate-400 uppercase">Estatus Ingeniería</p>
                          <div className="flex items-center gap-2 mt-1">
                              <CheckCircle2 size={16} className="text-green-400"/>
                              <span className="text-xs font-medium">Configuración Segura</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}