// ARCHIVO: src/features/quoter/SelectionAssistant.tsx
import { useState } from 'react';
import { Sparkles, X, CheckCircle2, AlertTriangle, Box, ArrowRight, ArrowLeft, FileText, Scale } from 'lucide-react';
import type { QuoteData } from '../../types';

interface SelectionAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: Partial<QuoteData>) => void;
  clientName: string;
  projectRef: string;
}

// 1. BASE DE DATOS DE MARKETING Y FICHAS TÉCNICAS
const MODEL_SPECS: any = {
    'HYD': {
        title: "ELEVADOR HIDRÁULICO",
        subtitle: "La solución arquitectónica flexible",
        desc: "El módulo de potencia permite una instalación cómoda en sótanos o espacios reducidos, ideal para recorridos medios.",
        features: [
            "Recorrido eficiente hasta 12-15 metros.",
            "Operación suave y silenciosa.",
            "Consumo de energía CERO en bajada (Gravedad).",
            "Mantenimiento e instalación de bajo costo.",
            "Sistema de rescate automático integrado."
        ],
        imageColor: "bg-orange-500"
    },
    'MRL-G': {
        title: "MRL-G (BANDAS)",
        subtitle: "Tecnología Gearless de Alto Desempeño",
        desc: "La evolución de la tracción. Utiliza bandas planas recubiertas que eliminan la fricción metal-metal, garantizando suavidad extrema.",
        features: [
            "Suspensión por BANDAS (STM) ultra silenciosas.",
            "Sin cuarto de máquinas (Motor en cubo).",
            "Ahorro energético Premium (Regenerativo opcional).",
            "Ideal para cargas medias y altas (>400kg).",
            "Requiere Sobrepaso (Overhead) estándar de 4m."
        ],
        imageColor: "bg-blue-600"
    },
    'MRL-L': {
        title: "MRL-L (HOME / LIGERO)",
        subtitle: "Eficiencia en Espacio Reducido",
        desc: "Diseñado para cubos compactos y cargas ligeras. Incluye su propia estructura autoportante para facilitar la instalación.",
        features: [
            "Suspensión por CABLE DE ACERO tradicional.",
            "Estructura Alamex INCLUIDA (Obligatoria).",
            "Optimizado para cargas menores a 400kg.",
            "Foso reducido flexible (40cm o 130cm).",
            "Ideal para proyectos residenciales verticales."
        ],
        imageColor: "bg-indigo-500"
    }
};

export default function SelectionAssistant({ isOpen, onClose, onApply, clientName, projectRef }: SelectionAssistantProps) {
  const [step, setStep] = useState(1);
  const [wizData, setWizData] = useState({
      width: 0,
      depth: 0,
      stops: 2,
      height: 3000, // mm
      capacity: 300, // kg
      pitAvailable: null as boolean | null,
      structureProvider: 'client' as 'client' | 'alamex',
      structureMaterial: 'concreto' as 'concreto' | 'metal'
  });

  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  // 2. CEREBRO LÓGICO
  const calculateResult = () => {
      const isHydraulicZone = wizData.height < 12000 || wizData.stops <= 3;
      
      let recommendedModel: any = 'MRL-G';
      let pitDepth = 1200;
      let overhead = 3600; 
      let tractionType = 'Bandas';
      let shaftTypeFinal = 'Concreto';
      let constructionReqFinal = 'No';

      if (isHydraulicZone) {
          recommendedModel = 'HYD';
          tractionType = 'Hidráulico';
          overhead = 3200;
          pitDepth = wizData.pitAvailable ? 400 : 0; 

          if (wizData.structureProvider === 'alamex') {
              shaftTypeFinal = 'Estructura Metálica';
              constructionReqFinal = 'Sí (Suministro Alamex)';
          } else {
              shaftTypeFinal = wizData.structureMaterial === 'concreto' ? 'Concreto' : 'Estructura Metálica';
              constructionReqFinal = 'No (Suministro Cliente)';
          }
      } else {
          overhead = 4000; 

          if (wizData.capacity < 400) {
              recommendedModel = 'MRL-L';
              tractionType = 'Cable de Acero';
              shaftTypeFinal = 'Estructura Metálica';
              constructionReqFinal = 'Sí (Obligatorio Alamex)';
              pitDepth = wizData.pitAvailable ? 1300 : 400; 
          } else {
              recommendedModel = 'MRL-G';
              tractionType = 'Bandas';
              pitDepth = 1200;

              if (wizData.structureProvider === 'alamex') {
                  shaftTypeFinal = 'Estructura Metálica';
                  constructionReqFinal = 'Sí (Suministro Alamex)';
              } else {
                  shaftTypeFinal = wizData.structureMaterial === 'concreto' ? 'Concreto' : 'Estructura Metálica';
                  constructionReqFinal = 'No (Suministro Cliente)';
              }
          }
      }

      const technicalData: Partial<QuoteData> = {
          model: recommendedModel,
          stops: wizData.stops,
          travel: wizData.height,
          shaftWidth: wizData.width,
          shaftDepth: wizData.depth,
          capacity: wizData.capacity,
          pit: pitDepth,
          overhead: overhead,
          shaftType: shaftTypeFinal,
          shaftConstructionReq: constructionReqFinal,
          traction: tractionType,
          floorNomenclature: (pitDepth === 0) ? 'Requiere Rampa (Sin Foso)' : 'PB, 1, 2...',
      };

      setResult(technicalData);
      setStep(4);
  };

  const handleConfirm = () => {
      onApply(result);
      onClose();
      setStep(1);
      setResult(null);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg"><Sparkles className="text-white" size={20}/></div>
                    <div>
                        <h3 className="text-lg font-bold">Asistente de Selección Alamex</h3>
                        <p className="text-slate-400 text-xs">{step === 4 ? 'Solución Recomendada' : `Paso ${step} de 3`}</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto">
                
                {/* PASO 1: TIPO DE PROYECTO */}
                {step === 1 && (
                    <div className="space-y-8 animate-slideLeft max-w-2xl mx-auto">
                        <h4 className="text-2xl font-black text-slate-800 text-center">¿Cuál es la situación actual de la obra?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={() => { alert("Para modernizaciones, usa el modo manual."); onClose(); }} className="p-8 border-2 border-slate-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all group text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏗️</div>
                                <div><p className="font-bold text-slate-800 text-lg">Cubo Existente</p><p className="text-slate-500 text-sm mt-2">Modernización</p></div>
                            </button>
                            <button onClick={() => setStep(2)} className="p-8 border-2 border-blue-200 bg-blue-50/50 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all group text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">✨</div>
                                <div><p className="font-bold text-blue-900 text-lg">Proyecto Nuevo</p><p className="text-blue-600/80 text-sm mt-2">Obra Cero</p></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 2: DIMENSIONES Y CAPACIDAD */}
                {step === 2 && (
                    <div className="space-y-8 animate-slideLeft max-w-3xl mx-auto">
                        <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <CheckCircle2 className="text-blue-600" size={28}/> Requerimientos Técnicos
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ancho Cubo (mm)</label>
                                <input type="number" className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none text-lg font-bold" autoFocus
                                    value={wizData.width || ''} onChange={e => setWizData({...wizData, width: Number(e.target.value)})} placeholder="Ej: 1600"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fondo Cubo (mm)</label>
                                <input type="number" className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none text-lg font-bold"
                                    value={wizData.depth || ''} onChange={e => setWizData({...wizData, depth: Number(e.target.value)})} placeholder="Ej: 1600"/>
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1"><Scale size={12}/> Capacidad (kg)</label>
                                <input type="number" className="w-full p-4 border border-blue-200 rounded-xl bg-blue-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none text-lg font-black text-blue-900"
                                    value={wizData.capacity || ''} onChange={e => setWizData({...wizData, capacity: Number(e.target.value)})} placeholder="Ej: 300, 630..."/>
                                <p className="text-[10px] text-blue-500">* Determina si es MRL-L o MRL-G</p>
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recorrido Total (mm)</label>
                                <input type="number" className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none text-lg font-bold"
                                    value={wizData.height} onChange={e => setWizData({...wizData, height: Number(e.target.value)})} placeholder="Piso a Techo último"/>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Niveles / Paradas</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="2" max="30" className="flex-1" value={wizData.stops} onChange={e => setWizData({...wizData, stops: Number(e.target.value)})}/>
                                    <span className="text-2xl font-black text-slate-800 w-12 text-center">{wizData.stops}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* FOOTER PASO 2 (CON BOTÓN ATRÁS) */}
                        <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold px-4 py-2 transition-colors rounded-lg hover:bg-slate-50">
                                <ArrowLeft size={18}/> Atrás
                            </button>
                            <button onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2">
                                Continuar <ArrowRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 3: OBRA CIVIL */}
                {step === 3 && (
                    <div className="space-y-8 animate-slideLeft max-w-2xl mx-auto">
                        <div className="space-y-4">
                            <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="text-yellow-500"/> Foso / Pit Disponible</p>
                            <div className="flex gap-4">
                                <button onClick={() => setWizData({...wizData, pitAvailable: true})} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${wizData.pitAvailable === true ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}>
                                    Normal (≥ 40cm)
                                </button>
                                <button onClick={() => setWizData({...wizData, pitAvailable: false})} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${wizData.pitAvailable === false ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}>
                                    Nulo (0cm / Rampa)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><Box className="text-purple-500"/> Suministro de Estructura</p>
                            <div className="flex gap-4">
                                <button onClick={() => setWizData({...wizData, structureProvider: 'client'})} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${wizData.structureProvider === 'client' ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'border-slate-200 hover:border-purple-300 text-slate-600'}`}>
                                    Cliente (Obra Civil)
                                </button>
                                <button onClick={() => setWizData({...wizData, structureProvider: 'alamex'})} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${wizData.structureProvider === 'alamex' ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'border-slate-200 hover:border-purple-300 text-slate-600'}`}>
                                    Alamex (Metal)
                                </button>
                            </div>
                        </div>

                        {/* FOOTER PASO 3 (CON BOTÓN ATRÁS) */}
                        <div className="pt-8 flex justify-between items-center border-t border-gray-100">
                            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold px-4 py-2 transition-colors rounded-lg hover:bg-slate-50">
                                <ArrowLeft size={18}/> Atrás
                            </button>
                            <button onClick={calculateResult} className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 shadow-xl flex items-center gap-2 text-lg transform hover:-translate-y-1 transition-all">
                                <Sparkles size={20}/> Calcular Solución
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 4: RESULTADO VISUAL */}
                {step === 4 && result && (
                    <div className="flex flex-col md:flex-row gap-8 animate-fadeIn h-full">
                        {/* Columna Izquierda: Marketing */}
                        <div className={`w-full md:w-1/3 ${MODEL_SPECS[result.model].imageColor} rounded-xl p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-lg`}>
                            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10">
                                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm uppercase">Recomendado</div>
                                <h2 className="text-3xl font-black leading-tight mb-2">{MODEL_SPECS[result.model].title}</h2>
                                <p className="text-white/80 font-medium">{MODEL_SPECS[result.model].subtitle}</p>
                            </div>
                            <div className="relative z-10 mt-8">
                                <p className="text-sm leading-relaxed text-white/90 border-t border-white/20 pt-4">{MODEL_SPECS[result.model].desc}</p>
                            </div>
                        </div>

                        {/* Columna Derecha: Datos */}
                        <div className="flex-1 flex flex-col">
                            <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configuración Técnica</h4>
                                    <h3 className="text-2xl font-black text-slate-800 mt-1">{projectRef}</h3>
                                    <p className="text-sm text-blue-600 font-medium">{clientName}</p>
                                </div>
                                <div className="text-right bg-slate-50 px-4 py-2 rounded-lg">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Tracción</p>
                                    <p className="text-lg font-black text-slate-800">{result.traction || 'Estándar'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Carga / Personas</p>
                                    <p className="font-bold text-slate-700">{result.capacity} kg</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Recorrido</p>
                                    <p className="font-bold text-slate-700">{result.travel} mm / {result.stops} Paradas</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Foso / Overhead</p>
                                    <p className="font-bold text-slate-700">{result.pit} mm / {result.overhead} mm</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Estructura</p>
                                    <p className="font-bold text-slate-700 text-xs">{result.shaftType} ({result.shaftConstructionReq})</p>
                                </div>
                            </div>

                            <div className="flex-1 bg-green-50/50 p-4 rounded-xl border border-green-100">
                                <h5 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16}/> Ventajas Clave
                                </h5>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {MODEL_SPECS[result.model].features.map((feat: string, idx: number) => (
                                        <li key={idx} className="text-xs text-green-700 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>{feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                {/* BOTÓN ATRÁS (Para recalcular si es necesario) */}
                                <button onClick={() => setStep(3)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2">
                                    <ArrowLeft size={18}/> Cambiar Datos
                                </button>
                                <button onClick={handleConfirm} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2 transform hover:-translate-y-1 transition-all">
                                    <FileText size={18}/> Usar Configuración
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}