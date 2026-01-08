// ARCHIVO: src/features/quoter/ManualQuoter.tsx
import { useState, useEffect } from 'react';
import { 
  Building, Calculator, Layout, Save, FileText, 
  ArrowRight, ArrowLeft, AlertTriangle, Zap, CheckCircle2,
  Settings, Ruler
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
  { id: 1, label: 'Configuración Global', icon: Calculator }, 
  { id: 2, label: 'Acabados y Estética', icon: Layout },
];

export function ManualQuoter({ 
  initialData, existingQuotes, onUpdate, onSave, onViewPreview 
}: ManualQuoterProps) {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(initialData);
  const [validation, setValidation] = useState<{warnings: string[], fieldsWithError: string[]}>({warnings: [], fieldsWithError: []});

  // --- SOLUCIÓN AL PROBLEMA DE DUPLICADOS Y NAVEGACIÓN ---
  // Este efecto vigila cuando "initialData" cambia desde afuera (App.tsx).
  // Si detecta que guardaste (y recibiste ID) o cambiaste de proyecto, actualiza el formulario local.
  useEffect(() => {
    const isDifferentId = initialData.id !== formData.id;
    const isJustSaved = !formData.id && initialData.id; // Pasó de no tener ID a tenerlo (Guardado exitoso)
    const isDifferentRef = initialData.projectRef !== formData.projectRef; // Cambio de proyecto por referencia

    if (isDifferentId || isJustSaved || isDifferentRef) {
        setFormData(initialData);
        // Si cambiamos de proyecto, reiniciamos al paso 1 para ver lo importante
        if (isDifferentId || isDifferentRef) setCurrentStep(1);
    }
  }, [initialData]); // Se ejecuta cada vez que el padre manda datos nuevos

  const strictOptions = getStrictOptions(formData);
  const isMRL = String(formData.model).includes('MRL');

  useEffect(() => {
      const res = validateConfiguration(formData);
      setValidation(res);
  }, [formData]);

  const updateField = (field: keyof QuoteData, value: any) => {
    let newData = { ...formData, [field]: value };

    if (field === 'stops') {
        const newStops = Number(value);
        newData.travel = (newStops - 1) * 3000;
    }

    if (['capacity', 'stops', 'speed', 'model'].includes(field)) {
        const defaults = getSmartDefaults(newData);
        newData = { ...newData, ...defaults };
        
        if (field !== 'speed' && field !== 'model') {
             (newData as any)[field] = value;
        }
        if (field === 'model') {
             (newData as any)[field] = value;
        }
        
        if (field === 'stops') {
             newData.travel = (Number(value) - 1) * 3000; 
        }
    }

    setFormData(newData);
    onUpdate(newData);
  };

  const getInputClass = (fieldName: string, isHero = false) => {
      const hasError = validation.fieldsWithError.includes(fieldName);
      // Estilo base vs Estilo Hero (más grande y destacado)
      const baseClasses = isHero 
        ? "text-lg font-black py-4 px-5 shadow-lg tracking-wide" 
        : "text-sm px-4 py-3 shadow-inner";

      return `form-input w-full rounded-xl transition-all duration-300 outline-none appearance-none ${baseClasses}
      ${hasError 
          ? 'border border-red-500/50 bg-red-900/10 text-red-200 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
          : isHero 
            ? 'border border-[#D4AF37]/40 bg-[#051338] text-[#D4AF37] focus:border-[#D4AF37] focus:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:border-[#D4AF37]'
            : 'border border-white/10 bg-[#020610]/80 text-white placeholder-white/30 focus:border-[#D4AF37] focus:bg-[#051338] focus:text-white focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/40'}`;
  };

  const totalTravelMeters = (
    (formData.travel || 0) + 
    (isMRL ? 0 : (formData.pit || 0)) + 
    (isMRL ? 0 : (formData.overhead || 0))
  ) / 1000;

  return (
    <div className="flex flex-col h-full bg-[#020611] text-white relative overflow-hidden font-sans">
      
      {/* AMBIENT LIGHTING */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#0A2463]/30 to-transparent blur-[120px] opacity-50"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
              backgroundSize: '40px 40px'
          }}></div>
      </div>

      {/* HEADER */}
      <div className="px-8 py-5 flex justify-between items-center sticky top-0 z-30 bg-[#020611]/90 backdrop-blur-xl border-b border-[#D4AF37]/10 shadow-2xl shrink-0">
        <div className="relative cursor-default">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-lg relative z-10">{formData.projectRef || 'Nueva Cotización'}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                <p className="text-xs text-[#D4AF37]/90 font-medium uppercase tracking-widest relative z-10">{formData.clientName || 'Sin Cliente'}</p>
            </div>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner gap-1">
            {STEPS.map(s => (
                <button 
                    key={s.id} 
                    onClick={() => setCurrentStep(s.id)}
                    className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-500 flex items-center gap-2 relative overflow-hidden ${currentStep === s.id ? 'text-[#020611]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    {currentStep === s.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <s.icon size={16} strokeWidth={2.5} /> {s.label}
                    </span>
                </button>
            ))}
        </div>

        <div className="flex gap-4">
            <button onClick={onViewPreview} className="px-4 py-2 text-xs flex gap-2 items-center rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-[#D4AF37]/30 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <FileText size={16}/> <span className="hidden sm:inline">Previa</span>
            </button>
            <button onClick={() => onSave(formData)} className="px-6 py-2 text-xs flex gap-2 items-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942E] text-[#051338] font-black shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all active:scale-95 border border-[#F3E5AB]/20">
                <Save size={16}/> <span className="hidden sm:inline">GUARDAR</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex z-10">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
             <div className="max-w-4xl mx-auto space-y-8 pb-20">
                
                {/* -------------------- PASO 1: GLOBAL (DATOS + TÉCNICO) -------------------- */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        
                        {/* A. DATOS DEL PROYECTO */}
                        <div className="relative bg-[#051338]/40 backdrop-blur-2xl p-6 lg:p-8 rounded-[2rem] border border-white/10 shadow-lg hover:border-white/20 transition-colors">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="p-2 bg-gradient-to-br from-[#0A2463] to-[#020611] rounded-xl text-[#D4AF37] border border-[#D4AF37]/20 shadow-lg"><Building size={18}/></div>
                                <span className="opacity-90">Datos del Proyecto</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8">
                                    <ClientAutocomplete value={formData.clientName} onChange={v => updateField('clientName', v)} existingQuotes={existingQuotes}/>
                                </div>
                                <div className="md:col-span-4">
                                    <InputGroup label="Referencia Interna">
                                        <input className={getInputClass('projectRef')} value={formData.projectRef} onChange={e => updateField('projectRef', e.target.value)} placeholder="Ej: ALAM-2024-001"/>
                                    </InputGroup>
                                </div>
                                <div className="md:col-span-4">
                                    <InputGroup label="Fecha">
                                        <input type="date" className={`${getInputClass('projectDate')}`} style={{colorScheme: 'dark'}} value={formData.projectDate} onChange={e => updateField('projectDate', e.target.value)}/>
                                    </InputGroup>
                                </div>
                                <div className="md:col-span-4">
                                    <InputGroup label="Cantidad">
                                        <input type="number" min="1" className={`${getInputClass('quantity')} text-center font-black text-[#D4AF37] text-lg`} value={formData.quantity} onChange={e => updateField('quantity', Number(e.target.value))}/>
                                    </InputGroup>
                                </div>
                            </div>
                        </div>

                        {/* B. ESPECIFICACIONES TÉCNICAS */}
                        <div className="relative bg-[#051338]/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                            
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-[#0A2463] to-[#020611] rounded-xl text-amber-500 border border-amber-500/20 shadow-lg"><Settings size={18}/></div>
                                    <span className="opacity-90">Configuración Motriz</span>
                                </h3>
                            </div>
                            
                            {/* ZONA 1: MODELO HERO */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 ml-1">Modelo de Equipo</label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <div className="relative">
                                        <select 
                                            className={getInputClass('model', true)} 
                                            style={{colorScheme: 'dark'}} 
                                            value={formData.model} 
                                            onChange={e => updateField('model', e.target.value)}
                                        >
                                            {strictOptions.validModels.map(m => (
                                                <option key={m.id} value={m.id} className="bg-[#020611] text-white py-2">{m.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Zap size={20} className="text-[#D4AF37] opacity-80"/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ZONA 2: CONDICIONANTES PRINCIPALES */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                                    <InputGroup label="Capacidad de Carga">
                                        <div className="relative">
                                            <select className={`${getInputClass('capacity', true)} !py-3 !text-base`} style={{colorScheme: 'dark'}} value={formData.capacity} onChange={e => updateField('capacity', Number(e.target.value))}>
                                                {[320, 400, 450, 630, 800, 1000, 1250, 1600, 2000, 2500, 3000, 4000, 5000].map(c => (
                                                    <option key={c} value={c} className="bg-[#020611] text-white py-1">
                                                        {c} kg ({CAPACITY_PERSONS_TABLE.find(p => p.kg === c)?.persons || '?'} pers)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </InputGroup>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                                    <InputGroup label="Velocidad Nominal">
                                        <select className={`${getInputClass('speed', true)} !py-3 !text-base`} style={{colorScheme: 'dark'}} value={formData.speed} onChange={e => updateField('speed', e.target.value)}>
                                            {strictOptions.validSpeeds.map(s => (
                                                <option key={s} value={s} className="bg-[#020611] text-white py-1">{s} m/s</option>
                                            ))}
                                        </select>
                                    </InputGroup>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                                    <InputGroup label="Niveles / Paradas">
                                        <input type="number" min="2" max="60" className={`${getInputClass('stops', true)} !py-3 !text-base text-center`} value={formData.stops} onChange={e => updateField('stops', Number(e.target.value))}/>
                                    </InputGroup>
                                </div>
                            </div>

                            {/* ZONA 3: DIMENSIONES CRÍTICAS */}
                            <div className="relative">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Ruler size={14} className="text-[#D4AF37]"/> Dimensiones de Obra
                                </h4>
                                <div className="p-6 bg-[#020611]/50 rounded-2xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <InputGroup label="Recorrido" helpText="(Paradas-1)x3000">
                                            <div className="relative">
                                                <input type="number" className={getInputClass('travel')} value={formData.travel} onChange={e => updateField('travel', Number(e.target.value))}/>
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#D4AF37] font-bold">MM</span>
                                            </div>
                                        </InputGroup>
                                    </div>
                                    
                                    {!isMRL && (
                                        <>
                                            <div className="col-span-1">
                                                <InputGroup label="Fosa (Pit)" helpText={`Mín: ${strictOptions.minPit}`}>
                                                    <input type="number" className={getInputClass('pit')} value={formData.pit} onChange={e => updateField('pit', Number(e.target.value))}/>
                                                </InputGroup>
                                            </div>
                                            <div className="col-span-1">
                                                <InputGroup label="Sobrepaso (OH)" helpText={`Mín: ${strictOptions.minOverhead}`}>
                                                    <input type="number" className={getInputClass('overhead')} value={formData.overhead} onChange={e => updateField('overhead', Number(e.target.value))}/>
                                                </InputGroup>
                                            </div>
                                        </>
                                    )}

                                    <div className="col-span-1">
                                        <InputGroup label="Ancho Cubo" helpText={`Mín: ${strictOptions.minShaftWidth}`}>
                                            <input type="number" className={getInputClass('shaftWidth')} value={formData.shaftWidth} onChange={e => updateField('shaftWidth', Number(e.target.value))}/>
                                        </InputGroup>
                                    </div>
                                    <div className="col-span-1">
                                        <InputGroup label="Fondo Cubo" helpText={`Mín: ${strictOptions.minShaftDepth}`}>
                                            <input type="number" className={getInputClass('shaftDepth')} value={formData.shaftDepth} onChange={e => updateField('shaftDepth', Number(e.target.value))}/>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* -------------------- PASO 2: ACABADOS -------------------- */}
                {currentStep === 2 && (
                    <div className="relative bg-[#051338]/40 backdrop-blur-2xl p-8 lg:p-10 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="p-3 bg-gradient-to-br from-[#0A2463] to-[#020611] rounded-2xl text-purple-400 border border-purple-400/20 shadow-lg"><Layout size={24}/></div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Estética y Accesos</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputGroup label="Tipo de Puertas">
                                <select className={getInputClass('doorType')} style={{colorScheme: 'dark'}} value={formData.doorType} onChange={e => updateField('doorType', e.target.value)}>
                                    <option className="bg-[#020611] text-white" value="Automática Central">Automática Central</option>
                                    <option className="bg-[#020611] text-white" value="Telescópica">Telescópica Lateral</option>
                                    <option className="bg-[#020611] text-white" value="Manual">Manual Batiente</option>
                                </select>
                            </InputGroup>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Ancho Paso">
                                    <select className={getInputClass('doorWidth')} style={{colorScheme: 'dark'}} value={formData.doorWidth} onChange={e => updateField('doorWidth', Number(e.target.value))}>
                                        {[700, 800, 900, 1000, 1100, 1200].map(w => <option key={w} value={w} className="bg-[#020611] text-white">{w}</option>)}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Alto Paso">
                                    <select className={getInputClass('doorHeight')} style={{colorScheme: 'dark'}} value={formData.doorHeight} onChange={e => updateField('doorHeight', Number(e.target.value))}>
                                        {[2000, 2100, 2200, 2300, 2400].map(h => <option key={h} value={h} className="bg-[#020611] text-white">{h}</option>)}
                                    </select>
                                </InputGroup>
                            </div>
                            <InputGroup label="Acabado Cabina">
                                <input type="text" className={getInputClass('cabinFinish')} value={formData.cabinFinish} onChange={e => updateField('cabinFinish', e.target.value)} placeholder="Ej: Inox Satinado 304"/>
                            </InputGroup>
                            <InputGroup label="Piso de Cabina">
                                <input type="text" className={getInputClass('cabinFloor')} value={formData.cabinFloor} onChange={e => updateField('cabinFloor', e.target.value)} placeholder="Ej: Granito Negro"/>
                            </InputGroup>
                            <InputGroup label="Modelo Botoneras">
                                <input type="text" className={getInputClass('copModel')} value={formData.copModel} onChange={e => updateField('copModel', e.target.value)} placeholder="Ej: Touch Glass"/>
                            </InputGroup>
                            <InputGroup label="Normativa">
                                <select className={getInputClass('norm')} style={{colorScheme: 'dark'}} value={formData.norm} onChange={e => updateField('norm', e.target.value)}>
                                    <option className="bg-[#020611] text-white" value="EN 81-20">EN 81-20 (Europea Actual)</option>
                                    <option className="bg-[#020611] text-white" value="EN 81-1">EN 81-1 (Estándar)</option>
                                    <option className="bg-[#020611] text-white" value="ASME">ASME A17.1 (Americana)</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>
                )}

             </div>
          </div>

          {/* COLUMNA DERECHA: MONITOR TÉCNICO */}
          <div className="w-[440px] border-l border-white/5 hidden lg:block sticky top-24 h-[calc(100vh-96px)] overflow-hidden bg-[#020611]/40 backdrop-blur-md transition-all duration-300">
              <div className="h-full flex flex-col p-6 gap-6">
                  
                  {/* VISUALIZADOR */}
                  <div className="relative rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 group shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463] to-[#020611]"></div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37] rounded-full blur-[90px] opacity-10 pointer-events-none group-hover:opacity-20 transition duration-700"></div>

                      <div className="h-60 relative z-10">
                          <div className="absolute top-5 left-5 z-20 bg-[#020611]/80 backdrop-blur-md text-[#D4AF37] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#D4AF37]/30 shadow-lg">
                              {formData.model} SERIES
                          </div>
                          
                          <div className="h-full w-full flex items-center justify-center opacity-90 scale-90 transition duration-500 group-hover:scale-95">
                             <ElevatorVisualizer type={String(formData.model)} />
                          </div>
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#020611] via-transparent to-transparent opacity-80"></div>
                      </div>

                      <div className="px-6 py-4 border-t border-white/5 bg-[#020611]/50 backdrop-blur-md flex justify-between items-center relative z-10">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-2">
                              <Zap size={14}/> Live Monitor
                          </h3>
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${validation.warnings.length > 0 ? 'bg-red-500 text-red-500 animate-pulse' : 'bg-emerald-400 text-emerald-400'}`}></div>
                      </div>
                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all group">
                            <p className="text-[9px] text-white/40 uppercase font-bold mb-1 group-hover:text-[#D4AF37]">Velocidad</p>
                            <p className="font-bold text-lg text-white">{formData.speed} <span className="text-xs text-white/50">m/s</span></p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all group">
                            <p className="text-[9px] text-white/40 uppercase font-bold mb-1 group-hover:text-[#D4AF37]">Carga</p>
                            <p className="font-bold text-lg text-[#D4AF37]">{formData.capacity} <span className="text-xs text-[#D4AF37]/50">kg</span></p>
                        </div>
                        <div className="col-span-2 p-5 bg-gradient-to-r from-white/5 to-transparent rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all flex justify-between items-center group">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-bold mb-0.5 group-hover:text-[#D4AF37]">Recorrido Total</p>
                                <p className="text-xs text-white/30">Incluye Fosa + Sobrepaso</p>
                            </div>
                            <p className="font-black text-2xl text-white tracking-tight">{totalTravelMeters.toFixed(2)} <span className="text-sm font-medium text-white/50">m</span></p>
                        </div>
                  </div>

                  {/* ANÁLISIS DE INGENIERÍA */}
                  <div className="flex-1 bg-[#020611]/40 rounded-[1.5rem] border border-white/5 p-6 overflow-y-auto relative">
                      <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-[#020611] to-transparent pointer-events-none z-10"></div>
                      
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 text-center border-b border-white/5 pb-2">Status de Ingeniería</p>
                      
                      {validation.warnings.length > 0 ? (
                          <div className="space-y-4">
                              {validation.warnings.map((w, idx) => (
                                  <div key={idx} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 shadow-[0_0_10px_rgba(239,68,68,0.05)]">
                                      <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5"/>
                                      <p className="text-xs text-red-200 font-medium leading-relaxed opacity-90">{w.replace('ADVERTENCIA: ', '')}</p>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-emerald-500/40 gap-4 opacity-80">
                              <CheckCircle2 size={40} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"/>
                              <p className="text-xs font-medium tracking-wide uppercase">Configuración Óptima</p>
                          </div>
                      )}
                  </div>

                  {/* NAV INFERIOR */}
                  <div className="flex justify-between items-center pt-2 shrink-0">
                        <button onClick={() => setCurrentStep(p => Math.max(1, p-1))} disabled={currentStep === 1} className="w-12 h-12 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-full disabled:opacity-0 transition-all"><ArrowLeft size={24}/></button>
                        
                        <div className="flex gap-3">
                            {[1, 2].map(step => (
                                <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${currentStep === step ? 'w-8 bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]' : 'w-2 bg-white/10'}`}></div>
                            ))}
                        </div>

                        <button onClick={() => setCurrentStep(p => Math.min(2, p+1))} disabled={currentStep === 2} className="w-12 h-12 flex items-center justify-center text-[#051338] bg-[#D4AF37] hover:bg-[#F3E5AB] rounded-full disabled:opacity-0 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all transform active:scale-95"><ArrowRight size={24}/></button>
                  </div>

              </div>
          </div>

      </div>
    </div>
  );
}