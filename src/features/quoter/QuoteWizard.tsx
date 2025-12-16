// ARCHIVO: src/features/quoter/QuoteWizard.tsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, Save, Users, Settings, Activity, 
  MoveVertical, Box, Shield, Package, DollarSign, Info, 
  Truck, FileText, CheckCircle, Eye 
} from 'lucide-react';
import type { QuoteData } from '../../types';
import { INITIAL_FORM_STATE, ELEVATOR_MODELS, CONTROL_GROUPS, CAPACITIES, SPEEDS, TRACTIONS, SHAFT_TYPES, YES_NO, CABIN_MODELS, FLOOR_FINISHES, DOOR_TYPES, NORMS, DISPLAYS } from '../../data/constants';
import { calculateMaterials } from '../../services/calculations';
import { InputGroup } from '../../components/ui/InputGroup';
import { SectionTitle } from '../../components/ui/SectionTitle';

interface QuoteWizardProps {
  initialData?: QuoteData;
  onSave: (data: QuoteData) => void;
  onExit: () => void;
  onUpdate: (data: QuoteData) => void;
  onViewPreview: () => void;
  onOpenOpsCalculator: () => void;
}

export default function QuoteWizard({ initialData, onSave, onExit, onUpdate, onViewPreview, onOpenOpsCalculator }: QuoteWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(initialData || INITIAL_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false); 
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const inputType = (e.target as HTMLInputElement).type; 
    const newData = { ...formData, [name]: inputType === 'number' ? Number(value) : value };
    setFormData(newData);
    onUpdate(newData);
  };

  const materials = useMemo(() => calculateMaterials(formData), [formData]);

  // --- LÓGICA DE SEGURIDAD ---
  const handleSafePreview = () => {
    if (!formData.id) {
        alert("⚠️ ¡Atención!\n\nDebes GUARDAR la cotización antes de generar la Vista Previa para asegurar que se genere el folio correctamente.");
        return;
    }
    onViewPreview();
  };

  const handleManualSave = () => {
      setIsSaving(true);
      onSave(formData);
      setTimeout(() => setIsSaving(false), 800);
  };

  const renderStep = () => {
    switch(step) {
      case 1: 
        return (
          <div className="animate-fadeIn">
            <SectionTitle title="Datos de Contacto" icon={Users} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Cliente"><input name="clientName" value={formData.clientName} onChange={handleChange} className="form-input" /></InputGroup>
              <InputGroup label="Referencia"><input name="projectRef" value={formData.projectRef} onChange={handleChange} className="form-input" /></InputGroup>
              <InputGroup label="Teléfono"><input name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="form-input" /></InputGroup>
              <InputGroup label="Email"><input name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="form-input" /></InputGroup>
            </div>
            
            <SectionTitle title="Configuración Principal" icon={Settings} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <InputGroup label="Cantidad">
                  <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="form-input font-bold text-blue-900" />
               </InputGroup>
               <InputGroup label="Modelo de Equipo">
                  <select name="model" value={formData.model} onChange={handleChange} className="form-select">
                    {ELEVATOR_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
               </InputGroup>
               <InputGroup label="Tipo de Grupo">
                  <select name="controlGroup" value={formData.controlGroup} onChange={handleChange} className="form-select">
                    {CONTROL_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </InputGroup>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fadeIn space-y-6 h-full overflow-auto pr-2">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <SectionTitle title="1. Máquina y Desempeño" icon={Activity} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InputGroup label="Capacidad (kg)">
                        <select name="capacity" value={formData.capacity} onChange={handleChange} className="form-select">
                            {CAPACITIES.map(c => <option key={c} value={c}>{c} kg</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Personas">
                        <input type="number" name="persons" value={formData.persons} onChange={handleChange} className="form-input" />
                    </InputGroup>
                    <InputGroup label="Velocidad (m/s)">
                        <select name="speed" value={formData.speed} onChange={handleChange} className="form-select">
                            {SPEEDS.map(s => <option key={s} value={s}>{s} m/s</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Tracción">
                        <select name="traction" value={formData.traction} onChange={handleChange} className="form-select">
                            {TRACTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <SectionTitle title="2. Cubo y Recorrido" icon={MoveVertical} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Paradas"><input type="number" name="stops" value={formData.stops} onChange={handleChange} className="form-input" /></InputGroup>
                        <InputGroup label="Recorrido (mm)"><input type="number" name="travel" value={formData.travel} onChange={handleChange} className="form-input" /></InputGroup>
                        <InputGroup label="Fosa (Pit)"><input type="number" name="pit" value={formData.pit} onChange={handleChange} className="form-input" /></InputGroup>
                        <InputGroup label="Overhead"><input type="number" name="overhead" value={formData.overhead} onChange={handleChange} className="form-input" /></InputGroup>
                        <InputGroup label="Ancho Cubo"><input type="number" name="shaftWidth" value={formData.shaftWidth} onChange={handleChange} className="form-input" /></InputGroup>
                        <InputGroup label="Fondo Cubo"><input type="number" name="shaftDepth" value={formData.shaftDepth} onChange={handleChange} className="form-input" /></InputGroup>
                        <InputGroup label="Tipo Cubo">
                            <select name="shaftType" value={formData.shaftType} onChange={handleChange} className="form-select">
                                {SHAFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="Construcción Req.">
                            <select name="shaftConstructionReq" value={formData.shaftConstructionReq} onChange={handleChange} className="form-select">
                                {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </InputGroup>
                    </div>
                </div>

                <div>
                    <SectionTitle title="3. Cabina y Puertas" icon={Box} />
                    <div className="space-y-4">
                        <InputGroup label="Modelo Cabina">
                            <select name="cabinModel" value={formData.cabinModel} onChange={handleChange} className="form-select text-sm">
                                {CABIN_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <InputGroup label="Acabado Cabina"><input name="cabinFinish" value={formData.cabinFinish} onChange={handleChange} className="form-input" /></InputGroup>
                            <InputGroup label="Piso Cabina">
                                <select name="cabinFloor" value={formData.cabinFloor} onChange={handleChange} className="form-select">
                                    {FLOOR_FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </InputGroup>
                        </div>
                        <InputGroup label="Tipo Puerta">
                            <select name="doorType" value={formData.doorType} onChange={handleChange} className="form-select">
                                {DOOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <InputGroup label="Ancho Puerta"><input type="number" name="doorWidth" value={formData.doorWidth} onChange={handleChange} className="form-input" /></InputGroup>
                            <InputGroup label="Alto Puerta"><input type="number" name="doorHeight" value={formData.doorHeight} onChange={handleChange} className="form-input" /></InputGroup>
                        </div>
                        <InputGroup label="Acabado Puerta Piso"><input name="floorDoorFinish" value={formData.floorDoorFinish} onChange={handleChange} className="form-input" /></InputGroup>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <SectionTitle title="4. Normativa y Accesorios" icon={Shield} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InputGroup label="Norma Aplicada">
                        <select name="norm" value={formData.norm} onChange={handleChange} className="form-select">
                            {NORMS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Resistencia Fuego">
                        <select name="fireResistance" value={formData.fireResistance} onChange={handleChange} className="form-select">
                            {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="LOP (Pasillo)">
                        <select name="lopModel" value={formData.lopModel} onChange={handleChange} className="form-select">
                            {DISPLAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="COP (Cabina)">
                        <select name="copModel" value={formData.copModel} onChange={handleChange} className="form-select">
                            {DISPLAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Instalación">
                        <select name="installationReq" value={formData.installationReq} onChange={handleChange} className="form-select">
                            {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Reg. Contrapeso">
                        <select name="cwGovernor" value={formData.cwGovernor} onChange={handleChange} className="form-select">
                            {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Pasamanos">
                        <select name="handrailType" value={formData.handrailType} onChange={handleChange} className="form-select">
                            <option value="Redondo">Redondo</option>
                            <option value="Cuadrado">Cuadrado</option>
                        </select>
                    </InputGroup>
                    <InputGroup label="Nomenclatura"><input name="floorNomenclature" value={formData.floorNomenclature} onChange={handleChange} className="form-input" /></InputGroup>
                </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fadeIn h-full flex flex-col gap-6">
             <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="text-2xl font-black text-blue-900 flex items-center gap-2">
                  <Package className="text-yellow-500" /> Lista de Materiales (BOM)
                </h3>
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-bold">
                  Ref: {formData.projectRef}
                </span>
             </div>

             <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info size={14} /> Resumen de Equipo Propuesto
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="block text-gray-500 text-[10px] font-bold uppercase">Modelo</span>
                        <span className="font-bold text-blue-900">{ELEVATOR_MODELS.find(m => m.id === formData.model)?.label || formData.model}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="block text-gray-500 text-[10px] font-bold uppercase">Capacidad</span>
                        <span className="font-bold text-blue-900">{formData.capacity} kg ({formData.persons} Pers.)</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="block text-gray-500 text-[10px] font-bold uppercase">Velocidad</span>
                        <span className="font-bold text-blue-900">{formData.speed} m/s</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="block text-gray-500 text-[10px] font-bold uppercase">Paradas / Recorrido</span>
                        <span className="font-bold text-blue-900">{formData.stops} / {(formData.travel / 1000).toFixed(2)} m</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="block text-gray-500 text-[10px] font-bold uppercase">Cantidad</span>
                        <span className="font-bold text-blue-900">{formData.quantity} Unidad(es)</span>
                    </div>
                </div>
             </div>

             <div className="flex-1 flex gap-6 overflow-hidden">
                 <div className="flex-1 overflow-auto border rounded-xl bg-white shadow-sm">
                    <table className="w-full text-xs">
                       <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 font-bold uppercase tracking-wider">
                          <tr>
                             <th className="p-3 text-left w-1/4">Item</th>
                             <th className="p-3 text-left w-1/2">Descripción Técnica</th>
                             <th className="p-3 text-center w-1/4">Cant.</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {Object.entries(materials).map(([cat, data]: any) => (
                              <React.Fragment key={cat}>
                                 <tr className={`${data.color}`}>
                                    <td colSpan={3} className="p-2 px-4 font-bold border-y border-white/50 flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-current opacity-50"></div> {cat}
                                    </td>
                                 </tr>
                                 {data.items.map((item:any, idx:number) => (
                                     <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                         <td className="p-3 font-bold text-gray-800 border-r border-gray-50">{item.product}</td>
                                         <td className="p-3 text-gray-600 leading-relaxed">{item.desc}</td>
                                         <td className="p-3 text-center">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-blue-900 font-mono font-bold">
                                              {item.qty} <span className="text-[10px] text-gray-400 font-sans">{item.unit}</span>
                                            </span>
                                         </td>
                                     </tr>
                                 ))}
                              </React.Fragment>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                          <DollarSign size={18} className="text-green-600"/> Costos Estimados
                        </h4>
                        
                        <div className="space-y-4">
                           <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-800 font-bold mb-1 uppercase">Equipos</p>
                              <div className="flex justify-between items-end">
                                 <span className="text-sm text-gray-600">{formData.quantity} Unidad(es)</span>
                                 <span className="font-mono font-bold text-blue-900 text-lg">---</span>
                              </div>
                           </div>

                           <button 
                             onClick={onOpenOpsCalculator}
                             className="w-full py-3 bg-blue-100 text-blue-800 rounded-lg font-bold shadow-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm border border-blue-200"
                           >
                              <Truck size={18}/> Calculadora de Costos Operativos
                           </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-2">
                       <p className="font-bold flex items-center gap-2"><Info size={14}/> Siguiente Paso</p>
                       <p>Recuerda <strong>GUARDAR</strong> tu proyecto usando el botón superior.</p>
                       {/* Botón de vista previa arriba, aquí solo información */}
                    </div>
                 </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* --- HEADER NUEVO (CON BOTONES DE ACCIÓN) --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
         <div className="flex items-center gap-4">
             <button onClick={onExit} className="text-slate-500 hover:text-blue-900 font-bold text-sm">Cancelar</button>
             <div className="h-6 w-px bg-slate-300"></div>
             <div>
                <h2 className="font-black text-slate-800 text-lg leading-none">{formData.projectRef || 'Nueva Cotización'}</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                   {formData.id ? 'Guardado en sistema' : 'Borrador no guardado'}
                </p>
             </div>
         </div>

         {/* BOTONES SUPERIORES */}
         <div className="flex items-center gap-3">
             <button 
                onClick={handleManualSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
                    formData.id 
                    ? 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50' 
                    : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 animate-pulse'
                }`}
             >
                {isSaving ? <CheckCircle size={18} className="animate-bounce"/> : <Save size={18} />}
                {isSaving ? 'Guardando...' : 'Guardar Proyecto'}
             </button>

             <button 
                onClick={handleSafePreview}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white shadow-md transition-all ${
                    formData.id 
                    ? 'bg-blue-900 hover:bg-blue-800' 
                    : 'bg-slate-400 cursor-not-allowed opacity-70'
                }`}
                title={!formData.id ? "Guarda primero para habilitar" : "Ver documento"}
             >
                <Eye size={18} /> Vista Previa
             </button>
         </div>
      </div>
      
      {/* CUERPO DEL WIZARD */}
      <div className="flex-1 p-8 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">
         {/* Pasos visuales */}
         <div className="flex gap-2 justify-center mb-6">
             {[1, 2, 3].map(n => <div key={n} className={`w-3 h-3 rounded-full transition-colors ${step >= n ? 'bg-blue-600' : 'bg-gray-300'}`} />)}
         </div>

         {renderStep()}
      </div>

      {/* FOOTER DE NAVEGACIÓN */}
      <div className="p-6 border-t bg-white flex justify-between sticky bottom-0 z-10">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-secondary disabled:opacity-50">Anterior</button>
          
          <div className="flex items-center gap-4">
              {step < 3 && (
                  <button onClick={() => setStep(s => s + 1)} className="btn-primary">Siguiente <ArrowRight size={18}/></button> 
              )}
          </div>
      </div>
    </div>
  );
}