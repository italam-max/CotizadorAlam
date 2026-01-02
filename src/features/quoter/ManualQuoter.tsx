// ARCHIVO: src/features/quoter/ManualQuoter.tsx
import { useState, useEffect } from 'react';
import { 
  Building, Calculator, Box, Layout, Settings, 
  Save, FileText, ArrowRight, ArrowLeft, AlertTriangle, 
  CheckCircle2, RefreshCcw, Lock, Users, Zap, Ruler, Info, X, ChevronRight
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { InputGroup } from '../../components/ui/InputGroup';
import { ClientAutocomplete } from '../../components/ui/ClientAutocomplete';
import { toTitleCase } from '../../services/utils';
import { validateConfiguration, getSmartDefaults, getStrictOptions } from '../../services/calculations';

interface ManualQuoterProps {
  initialData: QuoteData;
  existingQuotes: QuoteData[];
  onUpdate: (data: QuoteData) => void;
  onSave: (data: QuoteData) => void;
  onViewPreview: () => void;
  onOpenOpsCalculator: () => void;
  onExit?: () => void;
}

const STEPS = [
  { id: 1, label: 'Proyecto', icon: Building },
  { id: 2, label: 'Ingeniería', icon: Calculator },
  { id: 3, label: 'Acabados', icon: Layout },
  { id: 4, label: 'Extras', icon: Settings },
];

export default function ManualQuoter({ 
  initialData, existingQuotes, onUpdate, onSave, onViewPreview, onOpenOpsCalculator 
}: ManualQuoterProps) {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [validation, setValidation] = useState<{warnings: string[], suggestions: Partial<QuoteData>, fieldsWithError: string[]}>({warnings: [], suggestions: {}, fieldsWithError: []});
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]); 
  const [autoCorrectionMessage, setAutoCorrectionMessage] = useState<string | null>(null);

  const strictOptions = getStrictOptions(formData);

  useEffect(() => {
      const isModelValid = strictOptions.validModels.some(m => m.id === formData.model);
      if (!isModelValid && strictOptions.validModels.length > 0) {
          const newModel = strictOptions.validModels[0].id;
          if (newModel !== formData.model) {
              const newData = { ...formData, model: newModel };
              setFormData(newData);
              onUpdate(newData);
              setAutoCorrectionMessage(`Modelo ajustado a ${newModel} (Normativa).`);
              setTimeout(() => setAutoCorrectionMessage(null), 4000);
          }
      }
      const res = validateConfiguration(formData);
      setValidation(res);
  }, [formData.capacity, formData.model, formData.speed, formData.travel, formData.stops, formData.persons, formData.overhead, formData.pit, formData.shaftWidth, formData.shaftDepth]);

  const updateField = (field: keyof QuoteData, value: any) => {
    let newData = { ...formData, [field]: value };

    if (field === 'capacity') {
        const defaults = getSmartDefaults(Number(value), formData.travel, formData.stops);
        newData = { ...newData, ...defaults };
    }

    if (field === 'stops') {
        const newStops = Number(value);
        const newTravel = (newStops - 1) * 3000;
        newData.travel = newTravel;
        const defaults = getSmartDefaults(newData.capacity, newTravel, newStops);
        newData = { ...newData, model: defaults.model || newData.model, traction: newData.traction || defaults.traction };
    }
    
    const futureRestrictions = getStrictOptions(newData);
    if (field === 'pit' && Number(value) < futureRestrictions.minPit) newData.pit = futureRestrictions.minPit;
    if (field === 'overhead' && Number(value) < futureRestrictions.minOverhead) newData.overhead = futureRestrictions.minOverhead;
    if (field === 'shaftWidth' && Number(value) < futureRestrictions.minShaftWidth) newData.shaftWidth = futureRestrictions.minShaftWidth;
    if (field === 'shaftDepth' && Number(value) < futureRestrictions.minShaftDepth) newData.shaftDepth = futureRestrictions.minShaftDepth;
    if (futureRestrictions.strictPersons !== null) newData.persons = futureRestrictions.strictPersons;

    setFormData(newData);
    onUpdate(newData);
    setIsDirty(true);
  };

  const handleSave = () => {
    const cleanData = { ...formData, clientName: toTitleCase(formData.clientName || ''), projectRef: formData.projectRef.trim() };
    onSave(cleanData);
    setIsDirty(false);
  };

  const applySuggestions = () => {
      const newData = { ...formData, ...validation.suggestions };
      setFormData(newData);
      onUpdate(newData);
      setIsDirty(true);
      setDismissedWarnings([]); 
  };

  const dismissWarning = (warningMsg: string) => setDismissedWarnings(prev => [...prev, warningMsg]);
  const activeWarnings = validation.warnings.filter(w => !dismissedWarnings.includes(w));

  const getInputClass = (fieldName: string, baseClass: string = 'form-input') => {
      const hasError = validation.fieldsWithError?.includes(fieldName);
      return `${baseClass} ${hasError ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500' : 'border-slate-300 focus:border-[#0A2463]'}`;
  };

  // --- COMPONENTES UI INTERNOS PARA LIMPIEZA ---
  const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <div className="p-1.5 bg-[#0A2463]/10 rounded-md text-[#0A2463]">
              <Icon size={16} strokeWidth={2.5}/>
          </div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9] font-sans text-slate-800">
      
      {/* HEADER COMPACTO */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-20 sticky top-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0A2463] rounded-lg flex items-center justify-center text-white shadow-lg">
                <Calculator size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Configurador Técnico</h2>
                <p className="text-xs text-slate-500 font-medium">Ref: {formData.projectRef || 'Sin Referencia'}</p>
            </div>
        </div>

        {/* STEPPER COMPACTO */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                return (
                    <button 
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                            isActive ? 'bg-white text-[#0A2463] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {step.id}. {step.label}
                    </button>
                );
            })}
        </div>

        <div className="flex gap-2">
            <button onClick={onViewPreview} className="btn-secondary px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                <FileText size={16}/> <span className="hidden sm:inline">Previa</span>
            </button>
            <button onClick={handleSave} disabled={!isDirty} className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 bg-[#0A2463] text-white hover:bg-[#0A2463]/90 shadow-md">
                <Save size={16}/> <span className="hidden sm:inline">Guardar</span>
            </button>
        </div>
      </div>

      {/* TOAST FLOTANTE */}
      {autoCorrectionMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
              <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-3 text-xs font-medium border border-slate-700">
                  <Info size={14} className="text-blue-400"/>
                  {autoCorrectionMessage}
              </div>
          </div>
      )}

      {/* LAYOUT PRINCIPAL (GRID) */}
      <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-6">
                    
                    {/* --- PASO 1: PROYECTO --- */}
                    {currentStep === 1 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
                            <SectionTitle title="Información del Proyecto" icon={Building} />
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-8">
                                    <ClientAutocomplete value={formData.clientName} onChange={v => updateField('clientName', v)} existingQuotes={existingQuotes} />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <InputGroup label="Referencia Interna">
                                        <input type="text" value={formData.projectRef} onChange={e => updateField('projectRef', e.target.value)} className={getInputClass('projectRef')} />
                                    </InputGroup>
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <InputGroup label="Fecha">
                                        <input type="date" value={formData.projectDate} onChange={e => updateField('projectDate', e.target.value)} className="form-input" />
                                    </InputGroup>
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <InputGroup label="Teléfono">
                                        <input type="tel" value={formData.contactPhone || ''} onChange={e => updateField('contactPhone', e.target.value)} className="form-input" />
                                    </InputGroup>
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <InputGroup label="Email">
                                        <input type="email" value={formData.contactEmail || ''} onChange={e => updateField('contactEmail', e.target.value)} className="form-input" />
                                    </InputGroup>
                                </div>
                                <div className="col-span-12 h-px bg-slate-100 my-2"></div>
                                <div className="col-span-6 md:col-span-3">
                                    <InputGroup label="Cantidad">
                                        <input type="number" min="1" value={formData.quantity} onChange={e => updateField('quantity', Number(e.target.value))} className="form-input font-bold text-center bg-slate-50" />
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PASO 2: INGENIERÍA (REDSEÑADO) --- */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                             {/* TARJETA 1: TRÁFICO Y CARGA */}
                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <SectionTitle title="Definición de Tráfico y Carga" icon={Users} />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <InputGroup label="Paradas">
                                        <input type="number" value={formData.stops} onChange={e => updateField('stops', Number(e.target.value))} className={getInputClass('stops', "form-input font-bold text-center text-lg")} />
                                    </InputGroup>
                                    <InputGroup label="Recorrido (mm)">
                                        <input type="number" value={formData.travel || 0} onChange={e => updateField('travel', Number(e.target.value))} className={getInputClass('travel', "form-input font-semibold")} />
                                    </InputGroup>
                                    <InputGroup label="Capacidad (kg)">
                                        <select value={formData.capacity} onChange={e => updateField('capacity', Number(e.target.value))} className={getInputClass('capacity', "form-select font-bold text-lg text-[#0A2463]")}>
                                            {[320, 400, 450, 630, 800, 1000, 1250, 1600, 2000, 2500, 3000, 4000, 5000].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </InputGroup>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pasajeros</span>
                                        <div className="h-[42px] bg-slate-50 border border-slate-200 rounded-md flex items-center px-3 justify-between">
                                            <span className="font-bold text-slate-700">{formData.persons || 0}</span>
                                            <Users size={14} className="text-slate-400"/>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* TARJETA 2: SISTEMA MOTRIZ */}
                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <SectionTitle title="Sistema Motriz" icon={Zap} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="md:col-span-2">
                                        <InputGroup label="Modelo Recomendado" helpText="Restringido por normativa">
                                            <div className="relative">
                                                <select value={formData.model} onChange={e => updateField('model', e.target.value)} className={getInputClass('model', "form-select font-bold bg-[#0A2463]/5 text-[#0A2463]")}>
                                                    {strictOptions.validModels.map(model => <option key={model.id} value={model.id}>{model.label}</option>)}
                                                </select>
                                                {strictOptions.validModels.length === 1 && <Lock size={12} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400"/>}
                                            </div>
                                        </InputGroup>
                                    </div>
                                    <InputGroup label="Velocidad (m/s)">
                                        <input type="number" step="0.1" value={formData.speed} onChange={e => updateField('speed', Number(e.target.value))} className={getInputClass('speed')} />
                                    </InputGroup>
                                    <div className="md:col-span-3">
                                        <InputGroup label="Tecnología de Tracción">
                                            <select value={formData.traction || '1:1'} onChange={e => updateField('traction', e.target.value)} className="form-select bg-slate-50">
                                                <option value="Bandas Planas (STM)">Bandas Planas (STM) - Premium</option>
                                                <option value="Cable de Acero">Cable de Acero - Estándar</option>
                                                <option value="Impulsión Hidráulica">Impulsión Hidráulica</option>
                                                <option value="1:1">1:1 (Directa)</option>
                                                <option value="2:1">2:1 (Desmultiplicada)</option>
                                                <option value="4:1">4:1 (Carga Pesada)</option>
                                            </select>
                                        </InputGroup>
                                    </div>
                                </div>
                             </div>

                             {/* TARJETA 3: OBRA CIVIL */}
                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <SectionTitle title="Dimensiones de Cubo" icon={Ruler} />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                                    <InputGroup label="Fosa (Pit)" helpText={`Mín: ${strictOptions.minPit}`}>
                                        <input type="number" value={formData.pit || 1200} onChange={e => updateField('pit', Number(e.target.value))} className={getInputClass('pit')} min={strictOptions.minPit} />
                                    </InputGroup>
                                    <InputGroup label="Sobrepaso" helpText={`Mín: ${strictOptions.minOverhead}`}>
                                        <input type="number" value={formData.overhead || 3500} onChange={e => updateField('overhead', Number(e.target.value))} className={getInputClass('overhead')} min={strictOptions.minOverhead} />
                                    </InputGroup>
                                    <InputGroup label="Ancho Cubo" helpText={`Mín: ${strictOptions.minShaftWidth}`}>
                                        <input type="number" value={formData.shaftWidth || 0} onChange={e => updateField('shaftWidth', Number(e.target.value))} className={getInputClass('shaftWidth')} min={strictOptions.minShaftWidth}/>
                                    </InputGroup>
                                    <InputGroup label="Fondo Cubo" helpText={`Mín: ${strictOptions.minShaftDepth}`}>
                                        <input type="number" value={formData.shaftDepth || 0} onChange={e => updateField('shaftDepth', Number(e.target.value))} className={getInputClass('shaftDepth')} min={strictOptions.minShaftDepth}/>
                                    </InputGroup>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputGroup label="Tipo de Estructura">
                                        <select value={formData.shaftType || 'Concreto'} onChange={e => updateField('shaftType', e.target.value)} className="form-select">
                                            <option value="Concreto">Concreto</option>
                                            <option value="Estructura Metálica">Estructura Metálica</option>
                                            <option value="Mampostería">Mampostería</option>
                                        </select>
                                    </InputGroup>
                                    <InputGroup label="Suministro de Cubo">
                                         <select value={formData.shaftConstructionReq || 'No'} onChange={e => updateField('shaftConstructionReq', e.target.value)} className="form-select">
                                            <option value="No">Cliente</option>
                                            <option value="Sí">Alamex (Estructura)</option>
                                        </select>
                                    </InputGroup>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* --- PASO 3: ESTÉTICA --- */}
                    {currentStep === 3 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
                            <SectionTitle title="Interior y Accesos" icon={Layout} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cabina</h4>
                                    <InputGroup label="Modelo">
                                        <input type="text" value={formData.cabinModel || 'ASC Estándar'} onChange={e => updateField('cabinModel', e.target.value)} className="form-input" />
                                    </InputGroup>
                                    <InputGroup label="Acabado Paredes">
                                        <select value={formData.cabinFinish || 'Inox'} onChange={e => updateField('cabinFinish', e.target.value)} className="form-select">
                                            <option value="Inox">Acero Inoxidable</option>
                                            <option value="Espejo">Acero Espejo</option>
                                            <option value="Pintado">Acero Pintado</option>
                                            <option value="Panorámica">Panorámica</option>
                                        </select>
                                    </InputGroup>
                                    <InputGroup label="Piso">
                                        <input type="text" value={formData.cabinFloor || 'Granito'} onChange={e => updateField('cabinFloor', e.target.value)} className="form-input" />
                                    </InputGroup>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Puertas</h4>
                                    <InputGroup label="Apertura">
                                        <select value={formData.doorType || 'Automática Central'} onChange={e => updateField('doorType', e.target.value)} className="form-select">
                                            <option value="Automática Central">Automática Central</option>
                                            <option value="Telescópica">Automática Telescópica</option>
                                            <option value="Manual">Manual Batiente</option>
                                        </select>
                                    </InputGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Ancho Paso (mm)">
                                            <select value={formData.doorWidth || 800} onChange={e => updateField('doorWidth', Number(e.target.value))} className="form-select">
                                                {[700, 800, 900, 1000, 1100, 1200].map(w => <option key={w} value={w}>{w}</option>)}
                                            </select>
                                        </InputGroup>
                                        <InputGroup label="Altura Paso (mm)">
                                            <select value={formData.doorHeight || 2000} onChange={e => updateField('doorHeight', Number(e.target.value))} className="form-select">
                                                {[2000, 2100, 2200, 2300, 2400].map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </InputGroup>
                                    </div>
                                    <InputGroup label="Acabado">
                                        <input type="text" value={formData.doorFinish || 'Inox 304'} onChange={e => updateField('doorFinish', e.target.value)} className="form-input" />
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PASO 4: EXTRAS --- */}
                    {currentStep === 4 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
                            <SectionTitle title="Normativa y Componentes" icon={Settings} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Normativa">
                                    <select value={formData.norm || 'EN 81-20'} onChange={e => updateField('norm', e.target.value)} className="form-select font-bold">
                                        <option value="EN 81-20">EN 81-20</option>
                                        <option value="EN 81-1">EN 81-1</option>
                                        <option value="ASME">ASME A17.1</option>
                                    </select>
                                </InputGroup>
                                <InputGroup label="Resistencia al Fuego">
                                    <select value={formData.fireRating ? 'Sí' : 'No'} onChange={e => updateField('fireRating', e.target.value === 'Sí')} className="form-select">
                                        <option value="No">No</option>
                                        <option value="Sí">Sí (EI 60/120)</option>
                                    </select>
                                </InputGroup>
                                <InputGroup label="Botoneras (COP/LOP)">
                                    <input type="text" value={formData.cop || 'Display LCD'} onChange={e => updateField('cop', e.target.value)} className="form-input" />
                                </InputGroup>
                                <InputGroup label="Nomenclatura">
                                    <input type="text" value={formData.nomenclature || 'PB, 1, 2...'} onChange={e => updateField('nomenclature', e.target.value)} className="form-input" placeholder="Ej: PB, 1, 2..." />
                                </InputGroup>
                                <InputGroup label="Pasamanos">
                                    <input type="text" value={formData.handrail || 'Redondo Inox'} onChange={e => updateField('handrail', e.target.value)} className="form-input" />
                                </InputGroup>
                                <InputGroup label="Instalación">
                                    <select value={formData.installation ? 'Sí' : 'No'} onChange={e => updateField('installation', e.target.value === 'Sí')} className="form-select bg-slate-50">
                                        <option value="Sí">Sí, Incluida</option>
                                        <option value="No">No (Solo Suministro)</option>
                                    </select>
                                </InputGroup>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMNA DERECHA: MONITOR DE INGENIERÍA (STICKY) */}
            <div className="hidden lg:block lg:col-span-4 pl-4 sticky top-24 h-fit">
                <div className="bg-[#0A2463] text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0d2d7a]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                            <Zap size={14}/> Monitor de Ingeniería
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* RESUMEN RÁPIDO */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-400 uppercase mb-1">Modelo</p>
                                <p className="font-bold text-lg">{formData.model}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-400 uppercase mb-1">Velocidad</p>
                                <p className="font-bold text-lg">{formData.speed} m/s</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-400 uppercase mb-1">Carga</p>
                                <p className="font-bold text-lg text-[#D4AF37]">{formData.capacity} kg</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-400 uppercase mb-1">Recorrido</p>
                                <p className="font-bold text-lg">{(formData.travel/1000).toFixed(1)} m</p>
                            </div>
                        </div>

                        {/* LISTA DE ALERTAS */}
                        <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Validaciones Activas</p>
                            
                            {activeWarnings.length > 0 ? activeWarnings.map((w, idx) => (
                                <div key={idx} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-start gap-3 relative group">
                                    <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5"/>
                                    <p className="text-xs text-red-100 font-medium leading-relaxed pr-4">{w.replace('ADVERTENCIA: ', '')}</p>
                                    <button onClick={() => dismissWarning(w)} className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors">
                                        <X size={12}/>
                                    </button>
                                </div>
                            )) : (
                                <div className="p-4 rounded-lg border border-dashed border-white/10 text-center">
                                    <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2"/>
                                    <p className="text-xs text-slate-400">Configuración válida</p>
                                </div>
                            )}

                            {Object.keys(validation.suggestions).length > 0 && (
                                <button onClick={applySuggestions} className="w-full py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-[#0A2463] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 mt-4">
                                    <RefreshCcw size={14}/> Corregir Automáticamente
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

          </div>
      </div>
      
      {/* NAVEGACIÓN INFERIOR (FOOTER) */}
      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-30 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
                onClick={() => setCurrentStep(p => Math.max(1, p - 1))} 
                disabled={currentStep === 1} 
                className="px-5 py-2.5 text-slate-500 font-bold flex items-center gap-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
            >
                <ArrowLeft size={16}/> Anterior
            </button>
            
            <div className="flex gap-2">
                 {STEPS.map(step => (
                     <div key={step.id} className={`w-2 h-2 rounded-full transition-all ${currentStep === step.id ? 'bg-[#0A2463] w-4' : 'bg-slate-300'}`}></div>
                 ))}
            </div>

            <button 
                onClick={() => setCurrentStep(p => Math.min(STEPS.length, p + 1))} 
                disabled={currentStep === STEPS.length} 
                className="px-6 py-2.5 bg-[#0A2463] hover:bg-[#0A2463]/90 text-white font-bold flex items-center gap-2 rounded-lg shadow-md shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all text-sm"
            >
                Siguiente <ChevronRight size={16}/>
            </button>
      </div>

    </div>
  );
}