// ARCHIVO: src/features/quoter/ManualQuoter.tsx
import { useState, useEffect } from 'react';
import { 
  Building, Calculator, Box, Layout, Settings, 
  Save, FileText, AlertTriangle, RefreshCcw
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { InputGroup } from '../../components/ui/InputGroup';
import { ClientAutocomplete } from '../../components/ui/ClientAutocomplete';
import { toTitleCase } from '../../services/utils';
import { validateConfiguration, getSmartDefaults } from '../../services/calculations'; // <--- IMPORTAMOS getSmartDefaults

interface ManualQuoterProps {
  initialData: QuoteData;
  existingQuotes: QuoteData[];
  onUpdate: (data: QuoteData) => void;
  onSave: (data: QuoteData) => void;
  onViewPreview: () => void;
  onOpenOpsCalculator: () => void;
  onExit?: () => void;
}

const TABS = [
  { id: 1, label: 'General', icon: Building },
  { id: 2, label: 'Desempeño', icon: Calculator },
  { id: 3, label: 'Cubo', icon: Box },
  { id: 4, label: 'Cabina/Puertas', icon: Layout },
  { id: 5, label: 'Accesorios', icon: Settings },
];

export default function ManualQuoter({ 
  initialData, existingQuotes, onUpdate, onSave, onViewPreview, onOpenOpsCalculator 
}: ManualQuoterProps) {
  
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [validation, setValidation] = useState<{warnings: string[], suggestions: Partial<QuoteData>}>({warnings: [], suggestions: {}});

  // Validar cada vez que cambian los datos críticos
  useEffect(() => {
      const res = validateConfiguration(formData);
      setValidation(res);
  }, [formData.capacity, formData.model, formData.shaftWidth, formData.shaftDepth, formData.speed, formData.travel, formData.stops]);

  const updateField = (field: keyof QuoteData, value: any) => {
    let newData = { ...formData, [field]: value };

    // --- LÓGICA DE AUTO-COMPLETADO INTELIGENTE (Smart Defaults) ---
    // Si cambio la capacidad, actualizo automáticamente el modelo y dimensiones sugeridas
    if (field === 'capacity') {
        const defaults = getSmartDefaults(Number(value), formData.travel, formData.stops);
        newData = { ...newData, ...defaults };
    }
    // Si cambio el recorrido o paradas, recalculo recomendaciones (ej. límites hidráulicos)
    // Nota: Aquí solo aplicamos cambios suaves si no afectan drásticamente lo que el usuario ya eligió, 
    // pero para capacidad (driver principal) aplicamos todo.
    
    setFormData(newData);
    onUpdate(newData);
    setIsDirty(true);
  };

  const handleSave = () => {
    const cleanData = {
        ...formData,
        clientName: toTitleCase(formData.clientName || ''),
        projectRef: formData.projectRef.trim()
    };
    onSave(cleanData);
    setIsDirty(false);
  };

  const applySuggestions = () => {
      const newData = { ...formData, ...validation.suggestions };
      setFormData(newData);
      onUpdate(newData);
      setIsDirty(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F7F2]">
      
      {/* HEADER DE TABS */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/20 px-8 py-4 flex justify-between items-center shadow-sm z-20">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                        activeTab === tab.id 
                        ? 'bg-[#0A2463] text-white shadow-md' 
                        : 'text-gray-400 hover:bg-gray-100 hover:text-[#0A2463]'
                    }`}
                >
                    <tab.icon size={14} className={activeTab === tab.id ? 'text-[#D4AF37]' : ''}/>
                    {tab.label}
                </button>
            ))}
        </div>
        
        <div className="flex gap-2">
            <button onClick={onViewPreview} className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-2">
                <FileText size={14}/> Previa
            </button>
            <button 
                onClick={handleSave} 
                disabled={!isDirty}
                className="btn-primary px-4 py-1.5 text-xs flex items-center gap-2 disabled:opacity-50"
            >
                <Save size={14} className="text-[#D4AF37]"/> Guardar
            </button>
        </div>
      </div>

      {/* BARRA DE ALERTAS DE INGENIERÍA (VALIDACIÓN ACTIVA) */}
      {validation.warnings.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-3 flex items-start justify-between animate-slideDown">
              <div className="flex gap-3">
                  <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18}/>
                  <div className="space-y-1">
                      {validation.warnings.map((w, idx) => (
                          <p key={idx} className="text-xs text-red-800 font-bold">{w}</p>
                      ))}
                  </div>
              </div>
              {Object.keys(validation.suggestions).length > 0 && (
                  <button 
                    onClick={applySuggestions}
                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-900 px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                      <RefreshCcw size={14}/> Corregir según Norma
                  </button>
              )}
          </div>
      )}

      {/* CONTENIDO DEL FORMULARIO */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto luxury-glass p-8 rounded-3xl border-t-4 border-t-[#0A2463] shadow-xl animate-fadeIn">
            
            {/* TAB 1: GENERAL */}
            {activeTab === 1 && (
                <div className="space-y-6 animate-slideUp">
                    <h3 className="text-lg font-bold text-[#0A2463] border-b border-gray-100 pb-2">Información del Proyecto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Referencia del Proyecto">
                            <input type="text" value={formData.projectRef} onChange={e => updateField('projectRef', e.target.value)} className="form-input text-lg font-bold" />
                        </InputGroup>
                        <ClientAutocomplete value={formData.clientName} onChange={v => updateField('clientName', v)} existingQuotes={existingQuotes} />
                        <InputGroup label="Email de Contacto">
                            <input type="email" value={formData.contactEmail || ''} onChange={e => updateField('contactEmail', e.target.value)} className="form-input" placeholder="cliente@empresa.com" />
                        </InputGroup>
                        <InputGroup label="Teléfono">
                            <input type="tel" value={formData.contactPhone || ''} onChange={e => updateField('contactPhone', e.target.value)} className="form-input" placeholder="+52..." />
                        </InputGroup>
                        <InputGroup label="Fecha">
                            <input type="date" value={formData.projectDate} onChange={e => updateField('projectDate', e.target.value)} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Cantidad de Equipos">
                            <input type="number" min="1" value={formData.quantity} onChange={e => updateField('quantity', Number(e.target.value))} className="form-input font-bold" />
                        </InputGroup>
                         <InputGroup label="Precio Unitario (MXN)">
                            <input type="number" value={formData.price} onChange={e => updateField('price', Number(e.target.value))} className="form-input text-green-700 font-bold" />
                        </InputGroup>
                    </div>
                </div>
            )}

            {/* TAB 2: MÁQUINA Y DESEMPEÑO */}
            {activeTab === 2 && (
                <div className="space-y-6 animate-slideUp">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-lg font-bold text-[#0A2463]">Configuración de Tracción</h3>
                        <button onClick={onOpenOpsCalculator} className="text-xs text-[#0A2463] underline font-bold">Calculadora</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Al cambiar la capacidad, se disparan los Defaults Inteligentes */}
                        <InputGroup label="Capacidad (kg)" helpText="Al cambiar esto se ajustará el Modelo automáticamente">
                            <select value={formData.capacity} onChange={e => updateField('capacity', Number(e.target.value))} className="form-select font-bold">
                                {[320, 400, 450, 630, 800, 1000, 1250, 1600, 2000, 2500].map(c => (
                                    <option key={c} value={c}>{c} kg</option>
                                ))}
                            </select>
                        </InputGroup>
                        <InputGroup label="Modelo Sugerido" helpText="Cambiado automáticamente según carga">
                            <select value={formData.model} onChange={e => updateField('model', e.target.value)} className="form-select font-bold">
                                <option value="MRL-G">MRL-G (Gearless)</option>
                                <option value="MRL-L">MRL-L (Lite)</option>
                                <option value="MR">MR (Con Cuarto)</option>
                                <option value="HYD">Hidráulico</option>
                                <option value="Home Lift">Home Lift</option>
                                <option value="PLAT">Plataforma</option>
                                <option value="CAR">Apila Autos</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Personas">
                            <input type="number" value={formData.persons || 0} onChange={e => updateField('persons', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Velocidad (m/s)">
                            <input type="number" step="0.1" value={formData.speed} onChange={e => updateField('speed', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Tracción">
                            <select value={formData.traction || '1:1'} onChange={e => updateField('traction', e.target.value)} className="form-select">
                                <option value="Bandas Planas (STM)">Bandas Planas (STM)</option>
                                <option value="Cable de Acero">Cable de Acero</option>
                                <option value="1:1">1:1 (Directa)</option>
                                <option value="2:1">2:1 (Desmultiplicada)</option>
                                <option value="4:1">4:1</option>
                            </select>
                        </InputGroup>
                    </div>
                </div>
            )}

            {/* TAB 3: CUBO Y RECORRIDO */}
            {activeTab === 3 && (
                <div className="space-y-6 animate-slideUp">
                    <h3 className="text-lg font-bold text-[#0A2463] border-b border-gray-100 pb-2">Dimensiones del Cubo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Paradas">
                            <input type="number" value={formData.stops} onChange={e => updateField('stops', Number(e.target.value))} className="form-input font-bold" />
                        </InputGroup>
                        <InputGroup label="Recorrido (mm)">
                            <input type="number" value={formData.travel || 0} onChange={e => updateField('travel', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Fosa / Pit (mm)">
                            <input type="number" value={formData.pit || 1200} onChange={e => updateField('pit', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Huida / Overhead (mm)">
                            <input type="number" value={formData.overhead || 3500} onChange={e => updateField('overhead', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Ancho Cubo (mm)">
                            <input type="number" value={formData.shaftWidth || 0} onChange={e => updateField('shaftWidth', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                         <InputGroup label="Fondo Cubo (mm)">
                            <input type="number" value={formData.shaftDepth || 0} onChange={e => updateField('shaftDepth', Number(e.target.value))} className="form-input" />
                        </InputGroup>
                         <InputGroup label="Tipo de Cubo">
                            <select value={formData.shaftType || 'Concreto'} onChange={e => updateField('shaftType', e.target.value)} className="form-select">
                                <option value="Concreto">Concreto</option>
                                <option value="Estructura Metálica">Estructura Metálica</option>
                                <option value="Mampostería">Mampostería</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Suministro Cubo">
                             <select value={formData.shaftConstructionReq || 'No'} onChange={e => updateField('shaftConstructionReq', e.target.value)} className="form-select">
                                <option value="No">Cliente</option>
                                <option value="Sí">Alamex (Estructura)</option>
                            </select>
                        </InputGroup>
                    </div>
                </div>
            )}

            {/* TAB 4: CABINA Y PUERTAS */}
            {activeTab === 4 && (
                <div className="space-y-6 animate-slideUp">
                    <h3 className="text-lg font-bold text-[#0A2463] border-b border-gray-100 pb-2">Estética y Accesos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Modelo Cabina">
                            <input type="text" value={formData.cabinModel || 'ASC Estándar'} onChange={e => updateField('cabinModel', e.target.value)} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Acabado Cabina">
                             <select value={formData.cabinFinish || 'Inox'} onChange={e => updateField('cabinFinish', e.target.value)} className="form-select">
                                <option value="Inox">Acero Inoxidable (Hairline)</option>
                                <option value="Espejo">Acero Espejo</option>
                                <option value="Pintado">Acero Pintado (Epoxy)</option>
                                <option value="Panorámica">Cristal / Panorámica</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Piso Cabina">
                            <input type="text" value={formData.cabinFloor || 'Granito'} onChange={e => updateField('cabinFloor', e.target.value)} className="form-input" />
                        </InputGroup>
                        
                        <div className="col-span-1 md:col-span-2 h-px bg-gray-100 my-2"></div>
                        
                        <InputGroup label="Tipo de Puerta">
                             <select value={formData.doorType || 'Automática Central'} onChange={e => updateField('doorType', e.target.value)} className="form-select">
                                <option value="Automática Central">Automática Central</option>
                                <option value="Telescópica">Automática Telescópica</option>
                                <option value="Manual">Manual Batiente</option>
                            </select>
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Ancho Puerta (mm)">
                                <select value={formData.doorWidth || 800} onChange={e => updateField('doorWidth', Number(e.target.value))} className="form-select">
                                    <option value={700}>700</option>
                                    <option value={800}>800</option>
                                    <option value={900}>900</option>
                                    <option value={1000}>1000</option>
                                    <option value={1100}>1100</option>
                                </select>
                            </InputGroup>
                             <InputGroup label="Alto Puerta (mm)">
                                <select value={formData.doorHeight || 2000} onChange={e => updateField('doorHeight', Number(e.target.value))} className="form-select">
                                    <option value={2000}>2000</option>
                                    <option value={2100}>2100</option>
                                    <option value={2200}>2200</option>
                                </select>
                            </InputGroup>
                        </div>
                         <InputGroup label="Acabado Puertas Piso">
                             <input type="text" value={formData.doorFinish || 'Inox 304'} onChange={e => updateField('doorFinish', e.target.value)} className="form-input" />
                        </InputGroup>
                    </div>
                </div>
            )}

            {/* TAB 5: ACCESORIOS */}
            {activeTab === 5 && (
                <div className="space-y-6 animate-slideUp">
                    <h3 className="text-lg font-bold text-[#0A2463] border-b border-gray-100 pb-2">Normativa y Componentes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <InputGroup label="Norma Aplicada">
                             <select value={formData.norm || 'EN 81-20'} onChange={e => updateField('norm', e.target.value)} className="form-select">
                                <option value="EN 81-20">EN 81-20/50 (Actual)</option>
                                <option value="EN 81-1">EN 81-1 (Anterior)</option>
                                <option value="ASME">ASME A17.1</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Resistencia al Fuego">
                             <select value={formData.fireRating ? 'Sí' : 'No'} onChange={e => updateField('fireRating', e.target.value === 'Sí')} className="form-select">
                                <option value="No">No</option>
                                <option value="Sí">Sí (EI 60/120)</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Botonera de Pasillo (LOP)">
                            <input type="text" value={formData.lop || 'Display LCD'} onChange={e => updateField('lop', e.target.value)} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Botonera de Cabina (COP)">
                            <input type="text" value={formData.cop || 'Display LCD + Braille'} onChange={e => updateField('cop', e.target.value)} className="form-input" />
                        </InputGroup>
                         <InputGroup label="Nomenclatura">
                            <input type="text" value={formData.nomenclature || 'PB, 1, 2...'} onChange={e => updateField('nomenclature', e.target.value)} className="form-input" placeholder="Ej: S1, PB, 1, 2..." />
                        </InputGroup>
                         <InputGroup label="Pasamanos">
                            <input type="text" value={formData.handrail || 'Redondo Inox'} onChange={e => updateField('handrail', e.target.value)} className="form-input" />
                        </InputGroup>
                        <InputGroup label="Incluye Instalación">
                             <select value={formData.installation ? 'Sí' : 'No'} onChange={e => updateField('installation', e.target.value === 'Sí')} className="form-select">
                                <option value="Sí">Sí</option>
                                <option value="No">No (Solo Suministro)</option>
                            </select>
                        </InputGroup>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}