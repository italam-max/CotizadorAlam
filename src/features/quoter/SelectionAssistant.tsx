// ARCHIVO: src/features/quoter/SelectionAssistant.tsx
import { useState, useEffect } from 'react';
import { 
  Sparkles, X, CheckCircle2, AlertTriangle, Box, ArrowRight, ArrowLeft, 
  FileText, Scale, Activity, RefreshCcw, Ruler, ShieldCheck, ChevronRight,
  Layers, DoorOpen, Users // <--- Nuevo icono
} from 'lucide-react';
import type { QuoteData } from '../../types';

interface SelectionAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: Partial<QuoteData>) => void;
  clientName: string;
  projectRef: string;
}

// 1. TABLA DE CAPACIDADES ESTÁNDAR (Personas -> KG -> Uso)
const CAPACITY_STEPS = [
    { persons: 4, kg: 320, label: 'Residencial Básico' },
    { persons: 6, kg: 450, label: 'Residencial Estándar' },
    { persons: 8, kg: 630, label: 'Edificio / Oficinas' },
    { persons: 10, kg: 800, label: 'Comercial / Torre' },
    { persons: 13, kg: 1000, label: 'Alto Tráfico / Carga' },
    { persons: 16, kg: 1275, label: 'Montacamillas' },
    { persons: 21, kg: 1600, label: 'Carga Pesada / Hospital' },
];

const MODEL_SPECS: any = {
    'HYD': {
        title: "HIDRÁULICO",
        tag: "Bajo Recorrido",
        desc: "Solución de potencia fluida ideal para optimización de espacios verticales reducidos.",
        features: [
            "Recorrido eficiente < 15m",
            "Consumo energético nulo en bajada",
            "Rescate automático mecánico",
            "Instalación de bajo impacto"
        ],
        gradient: "bg-gradient-to-br from-orange-900 to-amber-700"
    },
    'MRL-G': {
        title: "MRL-G SERIES",
        tag: "High Performance",
        desc: "Tracción Gearless con tecnología de bandas planas. La síntesis perfecta entre silencio y potencia.",
        features: [
            "STM (Bandas) Ultra Silenciosas",
            "Machine-Room-Less (Sin Cuarto)",
            "Eficiencia Energética A+",
            "Confort de viaje superior"
        ],
        gradient: "bg-gradient-to-br from-[#0A2463] to-blue-900"
    },
    'MRL-L': {
        title: "MRL-LITE",
        tag: "Compact Living",
        desc: "Ingeniería optimizada para estructuras ligeras y espacios residenciales modernos.",
        features: [
            "Estructura Autoportante Incluida",
            "Optimización de Foso (Pit)",
            "Tracción convencional probada",
            "Ideal para Home Lift / Residencial"
        ],
        gradient: "bg-gradient-to-br from-indigo-900 to-purple-900"
    }
};

export default function SelectionAssistant({ isOpen, onClose, onApply, clientName, projectRef }: SelectionAssistantProps) {
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Datos del Wizard
  const [wizData, setWizData] = useState({
      width: 0,
      depth: 0,
      stops: 2,
      openings: 2,
      height: 3000,
      capacity: 630, // KG (Valor técnico interno)
      persons: 8,    // Personas (Valor visual externo)
      pitAvailable: true,
      structureProvider: 'client' as 'client' | 'alamex',
  });

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if(isOpen) setIsAnimating(true);
  }, [isOpen]);

  useEffect(() => {
    if (wizData.openings < wizData.stops) {
        setWizData(prev => ({ ...prev, openings: prev.stops }));
    }
  }, [wizData.stops]);

  // Helper para manejar el slider de capacidad
  const handleCapacityChange = (stepIndex: number) => {
      const selected = CAPACITY_STEPS[stepIndex];
      setWizData(prev => ({
          ...prev,
          capacity: selected.kg,
          persons: selected.persons
      }));
  };

  // Encontrar el índice actual para el slider
  const currentCapIndex = CAPACITY_STEPS.findIndex(c => c.kg === wizData.capacity) !== -1 
    ? CAPACITY_STEPS.findIndex(c => c.kg === wizData.capacity) 
    : 2; // Default a 630kg

  if (!isOpen) return null;

  // LÓGICA DE CÁLCULO
  const calculateResult = () => {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 50);

      const isHydraulicZone = wizData.height < 12000 || wizData.stops <= 3;
      const hasDoubleEntrance = wizData.openings > wizData.stops;

      let recommendedModel: any = 'MRL-G';
      let pitDepth = 1200;
      let overhead = 3600; 
      let tractionType = 'Bandas Planas (STM)';
      let shaftTypeFinal = 'Concreto';
      let constructionReqFinal = 'No';

      if (isHydraulicZone) {
          recommendedModel = 'HYD';
          tractionType = 'Impulsión Hidráulica';
          overhead = 3200;
          pitDepth = wizData.pitAvailable ? 1200 : 400; 
          
          if (wizData.structureProvider === 'alamex') {
              shaftTypeFinal = 'Estructura Metálica';
              constructionReqFinal = 'Sí (Suministro Alamex)';
          }
      } else {
          // Lógica MRL
          if (wizData.capacity < 450) {
              recommendedModel = 'MRL-L';
              tractionType = 'Cable de Acero';
              pitDepth = wizData.pitAvailable ? 1100 : 400; 
          } else {
              recommendedModel = 'MRL-G';
              tractionType = 'Bandas Planas (STM)';
          }
          if (wizData.structureProvider === 'alamex') {
              shaftTypeFinal = 'Estructura Metálica';
              constructionReqFinal = 'Sí (Suministro Alamex)';
          }
      }

      const technicalData: Partial<QuoteData> = {
          model: recommendedModel,
          stops: wizData.stops,
          doorType: hasDoubleEntrance ? 'Automática (Doble Emb.)' : 'Automática Central',
          travel: wizData.height,
          shaftWidth: wizData.width,
          shaftDepth: wizData.depth,
          capacity: wizData.capacity,
          persons: wizData.persons, // Guardamos personas también
          pit: pitDepth,
          overhead: overhead,
          shaftType: shaftTypeFinal,
          constructionReq: constructionReqFinal.includes('Sí'),
          traction: tractionType,
      };

      setResult(technicalData);
      setStep(3);
  };

  const handleConfirm = () => {
      onApply(result);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0A2463]">
        
        {/* FONDO */}
        <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#0A2463]/40 to-transparent"></div>
             <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
             <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        </div>

        {/* HEADER */}
        <header className="relative z-10 px-10 py-8 flex justify-between items-end border-b border-white/5">
            <div>
                <h2 className="text-3xl font-thin tracking-wider text-white">
                    ALAMEX <span className="font-bold text-[#D4AF37]">ENGINEERING</span>
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mt-1">Configurador Técnico de Elevación</p>
            </div>
            <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1 transition-all duration-500 ${step >= s ? 'w-8 bg-[#D4AF37]' : 'w-4 bg-white/10'}`}></div>
                    ))}
                </div>
                <button onClick={onClose} className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                    <span className="group-hover:translate-x-1 transition-transform">Salir</span> <X size={20} className="text-[#D4AF37]"/>
                </button>
            </div>
        </header>

        {/* MAIN */}
        <main className={`flex-1 relative z-10 flex items-center justify-center p-8 transition-opacity duration-700 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* PASO 1: ORIGEN */}
            {step === 1 && (
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 text-center mb-8">
                        <h3 className="text-4xl md:text-5xl font-light mb-4">Origen del Proyecto</h3>
                        <p className="text-gray-400 text-lg font-light">Seleccione el estado actual de la infraestructura</p>
                    </div>

                    <button 
                        onClick={() => { alert("Redirigiendo a modo manual..."); onClose(); }}
                        className="group relative h-80 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 rounded-sm backdrop-blur-sm transition-all duration-500 flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                        <RefreshCcw size={64} strokeWidth={1} className="text-gray-500 group-hover:text-white transition-colors relative z-10 mb-6"/>
                        <div className="relative z-10 text-center">
                            <h4 className="text-2xl font-bold text-white mb-2 tracking-wide">MODERNIZACIÓN</h4>
                            <p className="text-sm text-gray-400 uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">Cubo Existente</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setStep(2)}
                        className="group relative h-80 bg-[#0A2463]/20 hover:bg-[#0A2463]/40 border border-white/10 hover:border-[#D4AF37] rounded-sm backdrop-blur-sm transition-all duration-500 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(10,36,99,0.3)]"
                    >
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0A2463]/80 to-transparent opacity-60"></div>
                        <Sparkles size={64} strokeWidth={1} className="text-[#D4AF37] group-hover:scale-110 transition-transform relative z-10 mb-6"/>
                        <div className="relative z-10 text-center">
                            <h4 className="text-2xl font-bold text-white mb-2 tracking-wide">OBRA NUEVA</h4>
                            <p className="text-sm text-gray-400 uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">Proyecto Desde Cero</p>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </button>
                </div>
            )}

            {/* PASO 2: DATOS TÉCNICOS (PERSONAS / CAPACIDAD) */}
            {step === 2 && (
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* IZQUIERDA */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                            <div className="w-12 h-12 border border-[#D4AF37] rounded-full flex items-center justify-center text-[#D4AF37]">
                                <Ruler size={24}/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Dimensiones de Obra</h3>
                                <p className="text-gray-500 text-sm">Ingrese datos en milímetros (mm)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <TechInput 
                                label="Ancho Cubo" 
                                value={wizData.width} 
                                onChange={(v: number) => setWizData({...wizData, width: v})} 
                                placeholder="0000"
                            />
                            <TechInput 
                                label="Fondo de Cubo" 
                                value={wizData.depth} 
                                onChange={(v: number) => setWizData({...wizData, depth: v})} 
                                placeholder="0000"
                            />
                            <TechInput 
                                label="Recorrido (m)" 
                                value={wizData.height} 
                                onChange={(v: number) => setWizData({...wizData, height: v})} 
                                placeholder="0000"
                                suffix="mm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Layers size={14}/> Niveles / Paradas
                                </label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" min="2" max="30" 
                                        value={wizData.stops}
                                        onChange={e => setWizData({...wizData, stops: Number(e.target.value)})}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                    />
                                    <span className="text-4xl font-thin text-white w-16 text-right">{wizData.stops}</span>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 border border-white/10 rounded-sm relative overflow-hidden">
                                {wizData.openings > wizData.stops && (
                                    <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#0A2463] text-[9px] font-bold px-2 py-1 uppercase">Doble Embarque</div>
                                )}
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <DoorOpen size={14}/> Total de Salidas
                                </label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" min={wizData.stops} max={wizData.stops * 2} 
                                        value={wizData.openings}
                                        onChange={e => setWizData({...wizData, openings: Number(e.target.value)})}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                                    />
                                    <span className="text-4xl font-thin text-white w-16 text-right">{wizData.openings}</span>
                                </div>
                            </div>
                        </div>

                        {/* SLIDER DE CAPACIDAD (POR PERSONAS) */}
                        <div className="pt-4">
                             <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2 mb-6">
                                <Users size={16}/> Capacidad Requerida
                            </label>
                            
                            <input 
                                type="range" 
                                min="0" 
                                max={CAPACITY_STEPS.length - 1} 
                                value={currentCapIndex}
                                onChange={e => handleCapacityChange(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] mb-4"
                            />
                            
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <div className="text-5xl font-thin text-white leading-none">
                                        {wizData.persons} <span className="text-lg font-bold text-gray-500">Personas</span>
                                    </div>
                                    <div className="text-[#D4AF37] text-sm font-bold mt-2 uppercase tracking-wide flex items-center gap-2">
                                        <Scale size={12}/> {wizData.capacity} KG
                                    </div>
                                </div>
                                <div className="text-right pb-1">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full">
                                        {CAPACITY_STEPS[currentCapIndex].label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DERECHA */}
                    <div className="lg:col-span-4 flex flex-col justify-between space-y-8 border-l border-white/5 pl-8 md:pl-12">
                        
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-white mb-6">Infraestructura</h3>
                            
                            {/* Toggle Fosa */}
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle size={12}/> Disponibilidad Fosa
                                </p>
                                <div className="flex bg-white/5 p-1 rounded-sm">
                                    <button 
                                        onClick={() => setWizData({...wizData, pitAvailable: true})}
                                        className={`flex-1 py-2 text-xs font-bold transition-all ${wizData.pitAvailable ? 'bg-[#D4AF37] text-[#0A2463]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        ESTÁNDAR
                                    </button>
                                    <button 
                                        onClick={() => setWizData({...wizData, pitAvailable: false})}
                                        className={`flex-1 py-2 text-xs font-bold transition-all ${!wizData.pitAvailable ? 'bg-[#D4AF37] text-[#0A2463]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        REDUCIDO
                                    </button>
                                </div>
                            </div>

                            {/* Toggle Estructura */}
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Box size={12}/> Estructura Cubo
                                </p>
                                <div className="flex bg-white/5 p-1 rounded-sm">
                                    <button 
                                        onClick={() => setWizData({...wizData, structureProvider: 'client'})}
                                        className={`flex-1 py-2 text-xs font-bold transition-all ${wizData.structureProvider === 'client' ? 'bg-[#D4AF37] text-[#0A2463]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        CLIENTE
                                    </button>
                                    <button 
                                        onClick={() => setWizData({...wizData, structureProvider: 'alamex'})}
                                        className={`flex-1 py-2 text-xs font-bold transition-all ${wizData.structureProvider === 'alamex' ? 'bg-[#D4AF37] text-[#0A2463]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        ALAMEX
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/10">
                            <button onClick={calculateResult} className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0A2463] py-4 rounded-sm font-black hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all tracking-wide flex items-center justify-center gap-2 text-lg">
                                <Activity size={20}/> CALCULAR
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-gray-500 hover:text-white flex items-center justify-center gap-2 transition-colors text-xs font-bold tracking-widest uppercase">
                                <ArrowLeft size={14}/> Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PASO 3: RESULTADO FINAL */}
            {step === 3 && result && (
                <div className="w-full h-full max-w-6xl flex items-center justify-center animate-scaleIn">
                    <div className="w-full grid grid-cols-1 md:grid-cols-12 bg-[#0A2463] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                        
                        {/* Panel Izquierdo: Modelo */}
                        <div className={`col-span-1 md:col-span-5 ${MODEL_SPECS[result.model].gradient} p-10 relative overflow-hidden flex flex-col justify-between`}>
                            <div className="absolute -right-20 -top-20 w-64 h-64 border border-white/10 rounded-full"></div>
                            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/80">Configuración Óptima</span>
                                </div>
                                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">{MODEL_SPECS[result.model].title}</h1>
                                <p className="text-xl text-white/80 font-light">{MODEL_SPECS[result.model].tag}</p>
                            </div>

                            <div className="relative z-10 mt-12">
                                <p className="text-white/70 leading-relaxed font-light border-l-2 border-[#D4AF37] pl-4">
                                    {MODEL_SPECS[result.model].desc}
                                </p>
                            </div>
                        </div>

                        {/* Panel Derecho: Specs */}
                        <div className="col-span-1 md:col-span-7 p-10 bg-[#020617]/90 backdrop-blur-md">
                            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Proyecto</p>
                                    <h3 className="text-2xl font-bold text-white">{projectRef}</h3>
                                    <p className="text-[#D4AF37] text-sm mt-1">{clientName}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-thin text-white">{result.persons} <span className="text-sm font-bold text-gray-500">Pers</span></div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">{result.capacity} KG</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
                                <ResultRow label="Sistema de Tracción" value={result.traction} />
                                <ResultRow label="Recorrido / Configuración" value={`${(result.travel/1000).toFixed(1)}m / ${result.stops} P / ${wizData.openings} S`} />
                                <ResultRow label="Tipo de Puertas" value={result.doorType} highlight={result.doorType.includes('Doble')} />
                                <ResultRow label="Fosa (Pit)" value={`${result.pit} mm`} highlight={result.pit < 1000} />
                                <ResultRow label="Huida (Overhead)" value={`${result.overhead} mm`} />
                                <ResultRow label="Estructura / Instalación" value={result.shaftType} sub={result.constructionReq ? 'Incluida' : 'Por Cliente'}/>
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                                <button onClick={() => setStep(2)} className="px-6 py-4 text-gray-400 font-bold hover:text-white transition-colors text-xs uppercase tracking-widest">
                                    <ArrowLeft size={16} className="inline mr-2"/> Ajustar Datos
                                </button>
                                <button onClick={handleConfirm} className="flex-1 bg-white text-[#0A2463] py-4 rounded-sm font-black hover:bg-[#D4AF37] transition-all uppercase tracking-wider flex items-center justify-center gap-2">
                                    Aplicar Configuración <ChevronRight size={18}/>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </main>
    </div>
  );
}

const TechInput = ({ label, value, onChange, placeholder, suffix }: any) => (
    <div className="relative group">
        <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2 block transition-colors group-focus-within:text-white">
            {label}
        </label>
        <div className="relative">
            <input 
                type="number"
                value={value || ''}
                onChange={e => onChange(Number(e.target.value))}
                placeholder={placeholder}
                className="w-full bg-transparent border-b border-white/20 py-3 text-3xl font-thin text-white placeholder-white/10 focus:border-[#D4AF37] outline-none transition-all font-mono"
            />
            {suffix && <span className="absolute right-0 bottom-4 text-xs text-gray-500 font-bold">{suffix}</span>}
        </div>
    </div>
);

const ResultRow = ({ label, value, sub, highlight }: any) => (
    <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-lg font-medium ${highlight ? 'text-[#D4AF37]' : 'text-white'}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 font-bold mt-0.5">{sub}</p>}
    </div>
);