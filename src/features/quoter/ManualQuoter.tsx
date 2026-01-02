// ARCHIVO: src/features/quoter/ManualQuoter.tsx
import { useState, useEffect } from 'react';
import { 
  Building, Calculator, Layout, Save, FileText, 
  ArrowRight, ArrowLeft, AlertTriangle, Zap, CheckCircle2 
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { InputGroup } from '../../components/ui/InputGroup';
import { ClientAutocomplete } from '../../components/ui/ClientAutocomplete';
import { ElevatorVisualizer } from './components/ElevatorVisualizer';
import { 
  validateConfiguration, 
  getSmartDefaults, 
  getStrictOptions 
} from '../../services/calculations';
import { CAPACITY_PERSONS_TABLE } from '../../data/constants';

interface ManualQuoterProps {
  initialData: QuoteData;
  existingQuotes: QuoteData[];
  onUpdate: (data: QuoteData) => void;
  onSave: (data: QuoteData) => void;
  onViewPreview: () => void;
  onOpenOpsCalculator: () => void;
}

const STEPS = [
  { id: 1, label: 'General', icon: Building },
  { id: 2, label: 'Técnico', icon: Calculator },
  { id: 3, label: 'Acabados', icon: Layout },
];

export function ManualQuoter({ 
  initialData, existingQuotes, onUpdate, onSave, onViewPreview 
}: ManualQuoterProps) {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(initialData);
  const [validation, setValidation] = useState<{warnings: string[], fieldsWithError: string[]}>({warnings: [], fieldsWithError: []});

  // 1. Obtener restricciones en tiempo real (Incluye validSpeeds)
  const strictOptions = getStrictOptions(formData);

  useEffect(() => {
      const res = validateConfiguration(formData);
      setValidation(res);
  }, [formData]);

  const updateField = (field: keyof QuoteData, value: any) => {
    let newData = { ...formData, [field]: value };

    // Regla: Paradas define Recorrido (solo si el usuario lo cambia explícitamente)
    if (field === 'stops') {
        const newStops = Number(value);
        newData.travel = (newStops - 1) * 3000;
    }

    // Auto-configuración inteligente
    if (['capacity', 'stops', 'speed', 'model'].includes(field)) {
        const defaults = getSmartDefaults(newData);
        newData = { ...newData, ...defaults };
        (newData as any)[field] = value; 
        
        if (field === 'stops') {
             newData.travel = (Number(value) - 1) * 3000; 
        }
    }

    setFormData(newData);
    onUpdate(newData);
  };

  const getInputClass = (fieldName: string) => {
      const hasError = validation.fieldsWithError.includes(fieldName);
      return `form-input transition-all ${hasError 
          ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-200 focus:border-red-500' 
          : 'border-slate-300 focus:border-[#0A2463]'}`;
  };

  // CÁLCULO DE RECORRIDO TOTAL
  const totalTravelMeters = (
    (formData.travel || 0) + 
    (formData.pit || 0) + 
    (formData.overhead || 0)
  ) / 1000;

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9]">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm shrink-0">
        <div>
            <h2 className="text-lg font-black text-[#0A2463]">{formData.projectRef || 'Nueva Cotización'}</h2>
            <p className="text-xs text-slate-500">{formData.clientName || 'Sin Cliente Asignado'}</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {STEPS.map(s => (
                <button 
                    key={s.id} 
                    onClick={() => setCurrentStep(s.id)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${currentStep === s.id ? 'bg-white text-[#0A2463] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <s.icon size={14} /> {s.label}
                </button>
            ))}
        </div>

        <div className="flex gap-2">
            <button onClick={onViewPreview} className="btn-secondary px-3 py-2 text-xs flex gap-2 items-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">
                <FileText size={16}/> <span className="hidden sm:inline">Previa</span>
            </button>
            <button onClick={() => onSave(formData)} className="btn-primary bg-[#0A2463] text-white px-4 py-2 text-xs flex gap-2 items-center rounded-lg hover:bg-blue-900 shadow-md transition-transform active:scale-95">
                <Save size={16}/> <span className="hidden sm:inline">Guardar</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
             <div className="max-w-3xl mx-auto space-y-8 pb-10">
                
                {/* PASO 1 */}
                {currentStep === 1 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                            <div className="p-1.5 bg-blue-50 rounded text-blue-700"><Building size={18}/></div>
                            Información del Proyecto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <ClientAutocomplete value={formData.clientName} onChange={v => updateField('clientName', v)} existingQuotes={existingQuotes}/>
                            </div>
                            <InputGroup label="Referencia Interna">
                                <input className={getInputClass('projectRef')} value={formData.projectRef} onChange={e => updateField('projectRef', e.target.value)} placeholder="Ej: ALAM-2024-001"/>
                            </InputGroup>
                            <InputGroup label="Fecha de Proyecto">
                                <input type="date" className="form-input" value={formData.projectDate} onChange={e => updateField('projectDate', e.target.value)}/>
                            </InputGroup>
                            <InputGroup label="Cantidad de Equipos">
                                <input type="number" min="1" className="form-input font-bold text-center bg-slate-50" value={formData.quantity} onChange={e => updateField('quantity', Number(e.target.value))}/>
                            </InputGroup>
                        </div>
                    </div>
                )}

                {/* PASO 2 */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#0A2463]"></div>
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                                <div className="p-1.5 bg-blue-50 rounded text-blue-700"><Calculator size={18}/></div>
                                Configuración Motriz
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                <InputGroup label="Capacidad (kg)">
                                    <select className={getInputClass('capacity')} value={formData.capacity} onChange={e => updateField('capacity', Number(e.target.value))}>
                                        {[320, 400, 450, 630, 800, 1000, 1250, 1600, 2000, 2500, 3000, 4000, 5000].map(c => (
                                            <option key={c} value={c}>{c} kg ({CAPACITY_PERSONS_TABLE.find(p => p.kg === c)?.persons || '?'} pers)</option>
                                        ))}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Velocidad (m/s)">
                                    <select className={getInputClass('speed')} value={formData.speed} onChange={e => updateField('speed', e.target.value)}>
                                        {/* 👇 AQUI ESTÁ EL CAMBIO: Usamos strictOptions.validSpeeds */}
                                        {strictOptions.validSpeeds.map(s => (
                                            <option key={s} value={s}>{s} m/s</option>
                                        ))}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Paradas / Niveles">
                                    <input type="number" min="2" max="60" className={getInputClass('stops')} value={formData.stops} onChange={e => updateField('stops', Number(e.target.value))}/>
                                </InputGroup>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Modelo Recomendado" helpText="Filtrado por normativa vigente">
                                    <select className="form-select font-bold text-[#0A2463] bg-white border-blue-200" value={formData.model} onChange={e => updateField('model', e.target.value)}>
                                        {strictOptions.validModels.map(m => (
                                            <option key={m.id} value={m.id}>{m.label}</option>
                                        ))}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Recorrido (mm)" helpText="Calculado: (Paradas - 1) x 3000">
                                    <div className="relative">
                                        <input type="number" className={getInputClass('travel')} value={formData.travel} onChange={e => updateField('travel', Number(e.target.value))}/>
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">mm</span>
                                    </div>
                                </InputGroup>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                                <div className="p-1.5 bg-amber-50 rounded text-amber-600"><Zap size={18}/></div>
                                Dimensiones Críticas de Obra
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="Fosa (Pit)" helpText={`Mínimo: ${strictOptions.minPit} mm`}>
                                    <input type="number" className={getInputClass('pit')} value={formData.pit} onChange={e => updateField('pit', Number(e.target.value))} min={strictOptions.minPit}/>
                                </InputGroup>
                                <InputGroup label="Sobrepaso (Overhead)" helpText={`Mínimo: ${strictOptions.minOverhead} mm`}>
                                    <input type="number" className={getInputClass('overhead')} value={formData.overhead} onChange={e => updateField('overhead', Number(e.target.value))} min={strictOptions.minOverhead}/>
                                </InputGroup>
                                <InputGroup label="Ancho Cubo (mm)" helpText={`Mín: ${strictOptions.minShaftWidth}`}>
                                    <input type="number" className={getInputClass('shaftWidth')} value={formData.shaftWidth} onChange={e => updateField('shaftWidth', Number(e.target.value))}/>
                                </InputGroup>
                                <InputGroup label="Fondo Cubo (mm)" helpText={`Mín: ${strictOptions.minShaftDepth}`}>
                                    <input type="number" className={getInputClass('shaftDepth')} value={formData.shaftDepth} onChange={e => updateField('shaftDepth', Number(e.target.value))}/>
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3 */}
                {currentStep === 3 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                            <div className="p-1.5 bg-purple-50 rounded text-purple-700"><Layout size={18}/></div>
                            Estética y Accesos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Tipo de Puertas">
                                <select className="form-select" value={formData.doorType} onChange={e => updateField('doorType', e.target.value)}>
                                    <option value="Automática Central">Automática Central</option>
                                    <option value="Telescópica">Telescópica Lateral</option>
                                    <option value="Manual">Manual Batiente</option>
                                </select>
                            </InputGroup>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Ancho Paso (mm)">
                                    <select className="form-select" value={formData.doorWidth} onChange={e => updateField('doorWidth', Number(e.target.value))}>
                                        {[700, 800, 900, 1000, 1100, 1200].map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Alto Paso (mm)">
                                    <select className="form-select" value={formData.doorHeight} onChange={e => updateField('doorHeight', Number(e.target.value))}>
                                        {[2000, 2100, 2200, 2300, 2400].map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </InputGroup>
                            </div>
                            <InputGroup label="Acabado Cabina">
                                <input type="text" className="form-input" value={formData.cabinFinish} onChange={e => updateField('cabinFinish', e.target.value)} placeholder="Ej: Inox Satinado 304"/>
                            </InputGroup>
                            <InputGroup label="Piso de Cabina">
                                <input type="text" className="form-input" value={formData.cabinFloor} onChange={e => updateField('cabinFloor', e.target.value)} placeholder="Ej: Granito Negro"/>
                            </InputGroup>
                            <InputGroup label="Modelo Botoneras">
                                <input type="text" className="form-input" value={formData.copModel} onChange={e => updateField('copModel', e.target.value)} placeholder="Ej: Touch Glass"/>
                            </InputGroup>
                            <InputGroup label="Normativa">
                                <select className="form-select font-medium" value={formData.norm} onChange={e => updateField('norm', e.target.value)}>
                                    <option value="EN 81-20">EN 81-20 (Europea Actual)</option>
                                    <option value="EN 81-1">EN 81-1 (Estándar)</option>
                                    <option value="ASME">ASME A17.1 (Americana)</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>
                )}

             </div>
          </div>

          {/* COLUMNA DERECHA: MONITOR TÉCNICO */}
          <div className="w-[400px] border-l border-slate-200 hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-hidden bg-slate-50 transition-all duration-300">
              <div className="h-full flex flex-col p-4 gap-4">
                  
                  <div className="bg-[#0A2463] text-white rounded-2xl shadow-xl overflow-hidden border border-slate-700 flex flex-col shrink-0">
                      
                      <div className="h-56 relative bg-slate-800 border-b border-white/10 group">
                          <div className="absolute top-3 left-3 z-10 bg-black/40 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wide border border-white/10 shadow-sm">
                              Vista: {formData.model}
                          </div>
                          <ElevatorVisualizer type={String(formData.model)} />
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A2463] via-transparent to-transparent opacity-90"></div>
                      </div>

                      <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-[#0d2d7a]">
                          <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                              <Zap size={14}/> Monitor Técnico
                          </h3>
                          <div className={`w-2 h-2 rounded-full ${validation.warnings.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-400 shadow-[0_0_8px_#4ade80]'}`}></div>
                      </div>

                      <div className="p-5 space-y-5">
                          <div className="grid grid-cols-2 gap-3">
                              <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
                                  <p className="text-[9px] text-slate-400 uppercase mb-1 group-hover:text-[#D4AF37]">Modelo</p>
                                  <p className="font-bold text-base">{formData.model}</p>
                              </div>
                              <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
                                  <p className="text-[9px] text-slate-400 uppercase mb-1 group-hover:text-[#D4AF37]">Velocidad</p>
                                  <p className="font-bold text-base">{formData.speed} m/s</p>
                              </div>
                              <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
                                  <p className="text-[9px] text-slate-400 uppercase mb-1 group-hover:text-[#D4AF37]">Carga</p>
                                  <p className="font-bold text-base text-[#D4AF37]">{formData.capacity} kg</p>
                              </div>
                              <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
                                  <p className="text-[9px] text-slate-400 uppercase mb-1 group-hover:text-[#D4AF37]">Recorrido Útil</p>
                                  <p className="font-bold text-base">{(formData.travel/1000).toFixed(1)} m</p>
                              </div>
                              
                              <div className="col-span-2 p-3 bg-gradient-to-r from-white/10 to-transparent rounded-lg border border-white/10 hover:border-[#D4AF37]/50 transition-all group mt-1">
                                  <div className="flex justify-between items-center">
                                      <p className="text-[10px] text-slate-300 uppercase font-bold group-hover:text-[#D4AF37]">Recorrido Total</p>
                                      <p className="font-black text-lg text-white tracking-wide">{totalTravelMeters.toFixed(2)} m</p>
                                  </div>
                              </div>

                          </div>
                      </div>
                  </div>

                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-y-auto">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Análisis de Ingeniería</p>
                      
                      {validation.warnings.length > 0 ? (
                          <div className="space-y-2">
                              {validation.warnings.map((w, idx) => (
                                  <div key={idx} className="bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-start gap-2.5">
                                      <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5"/>
                                      <p className="text-[11px] text-red-800 font-medium leading-relaxed">{w.replace('ADVERTENCIA: ', '')}</p>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-emerald-500/80 gap-2 opacity-80">
                              <CheckCircle2 size={28}/>
                              <p className="text-xs font-medium">Configuración válida</p>
                          </div>
                      )}
                  </div>

                  <div className="flex justify-between items-center pt-2 shrink-0">
                        <button onClick={() => setCurrentStep(p => Math.max(1, p-1))} disabled={currentStep === 1} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full disabled:opacity-30 transition-all"><ArrowLeft size={20}/></button>
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(step => (
                                <div key={step} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentStep === step ? 'bg-[#0A2463] scale-125' : 'bg-slate-300'}`}></div>
                            ))}
                        </div>
                        <button onClick={() => setCurrentStep(p => Math.min(3, p+1))} disabled={currentStep === 3} className="p-2 text-white bg-[#0A2463] hover:bg-[#0A2463]/90 rounded-full disabled:opacity-50 disabled:bg-slate-300 shadow-md transition-all"><ArrowRight size={20}/></button>
                  </div>

              </div>
          </div>

      </div>
    </div>
  );
}