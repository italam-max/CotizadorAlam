// ARCHIVO: src/features/tools/TrafficAnalyzer.tsx
import { useState, useEffect } from 'react';
import { 
  BarChart2, Calculator, Building, TrendingUp, AlertTriangle, 
  ThumbsDown, Zap, ShoppingCart, Users, ArrowRight, CheckCircle2, Diamond
} from 'lucide-react';

import { calculateTrafficAnalysis } from '../../services/trafficService';
import { InputGroup } from '../../components/ui/InputGroup';

interface TrafficAnalyzerProps {
  onQuote: (data: any) => void;
}

export default function TrafficAnalyzer({ onQuote }: TrafficAnalyzerProps) {
  const [inputs, setInputs] = useState({
    type: 'Residencial', floors: 10, travelMeters: 30, areaPerFloor: 500, unitsPerFloor: 4, occupantsPerUnit: 3, doorType: '800'
  });
  const [results, setResults] = useState<any>(null);
  // Estado para el efecto de "Foco Interactivo"
  const [hoveredCard, setHoveredCard] = useState<'standard' | 'excellent' | null>(null);

  const handleCalc = () => {
    const res = calculateTrafficAnalysis(inputs);
    setResults(res);
    // Auto-enfocar la excelente al calcular
    setTimeout(() => setHoveredCard('excellent'), 500);
    setTimeout(() => setHoveredCard(null), 2500);
  };

  useEffect(() => {
    if (inputs.type === 'Oficinas') setInputs(prev => ({...prev, occupantsPerUnit: 0})); 
  }, [inputs.type]);

  return (
    <div className="h-full flex flex-col bg-[#F9F7F2] animate-fadeIn overflow-hidden relative">
      
      <div className="absolute inset-0 arabesque-pattern pointer-events-none z-0 opacity-30"></div>

      {/* HEADER */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-[#F9F7F2]/80 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div>
          <h2 className="text-2xl font-black text-[#0A2463] flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-[#0A2463]/5 rounded-lg border border-[#0A2463]/10">
                <BarChart2 className="text-[#D4AF37]" size={24} />
            </div>
            Estudio de Tráfico Vertical
          </h2>
          <p className="text-sm text-[#0A2463]/60 mt-1 font-medium ml-14">
            Herramienta de consultoría para dimensionamiento óptimo según norma.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 z-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA: PARÁMETROS */}
            <div className="lg:col-span-4 space-y-6 sticky top-28">
                <div className="luxury-glass p-6 rounded-2xl border-t-4 border-t-[#0A2463] shadow-lg">
                    <h3 className="font-bold text-[#0A2463] mb-6 flex items-center gap-2 border-b border-[#0A2463]/10 pb-3">
                        <Building size={18} className="text-[#D4AF37]"/> Datos del Inmueble
                    </h3>
                    
                    <div className="space-y-5">
                        <InputGroup label="Tipo de Edificio">
                            <select className="form-select bg-white/50" value={inputs.type} onChange={e => setInputs({...inputs, type: e.target.value})}>
                            <option value="Residencial">Residencial / Vivienda</option>
                            <option value="Oficinas">Oficinas Corporativas</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Hospital">Hospital / Clínica</option>
                            </select>
                        </InputGroup>

                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Niveles">
                            <input type="number" className="form-input bg-white/50" value={inputs.floors} onChange={e => setInputs({...inputs, floors: Number(e.target.value)})} />
                            </InputGroup>
                            <InputGroup label="Recorrido (m)">
                            <input type="number" className="form-input bg-white/50" value={inputs.travelMeters} onChange={e => setInputs({...inputs, travelMeters: Number(e.target.value)})} />
                            </InputGroup>
                        </div>

                        {inputs.type === 'Oficinas' ? (
                            <InputGroup label="Área Útil por Piso (m²)">
                                <input type="number" className="form-input bg-white/50" value={inputs.areaPerFloor} onChange={e => setInputs({...inputs, areaPerFloor: Number(e.target.value)})} />
                            </InputGroup>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                            <InputGroup label={inputs.type === 'Hospital' ? 'Camas/Piso' : (inputs.type === 'Hotel' ? 'Hab/Piso' : 'Deptos/Piso')}>
                                <input type="number" className="form-input bg-white/50" value={inputs.unitsPerFloor} onChange={e => setInputs({...inputs, unitsPerFloor: Number(e.target.value)})} />
                            </InputGroup>
                            <InputGroup label="Ocupantes" helpText="Por unidad/habitación">
                                <input type="number" className="form-input bg-white/50" value={inputs.occupantsPerUnit} onChange={e => setInputs({...inputs, occupantsPerUnit: Number(e.target.value)})} />
                            </InputGroup>
                            </div>
                        )}

                        <button 
                            onClick={handleCalc} 
                            className="w-full btn-premium-primary justify-center mt-4 py-3 shadow-lg group relative overflow-hidden"
                        >
                             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <Calculator size={18} className="relative z-10" /> 
                            <span className="relative z-10">Generar Estudio</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: RESULTADOS INTERACTIVOS */}
            <div className="lg:col-span-8">
                {!results ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center luxury-glass rounded-2xl border border-dashed border-[#0A2463]/20 text-[#0A2463]/40">
                        <div className="p-6 bg-[#0A2463]/5 rounded-full mb-4 animate-pulse">
                            <TrendingUp size={48} className="opacity-50" />
                        </div>
                        <p className="font-bold text-lg text-[#0A2463]">Esperando Datos</p>
                        <p className="text-sm opacity-70">Ingresa los parámetros para generar la comparativa.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-slideUp">
                        
                        {/* BANNER DE POBLACIÓN */}
                        <div className="luxury-glass p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between border-l-4 border-l-[#D4AF37] shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#0A2463] text-white rounded-xl shadow-lg shadow-[#0A2463]/20">
                                    <Users size={24}/>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Población Total Estimada</p>
                                    <p className="text-3xl font-black text-[#0A2463]">{results.population} <span className="text-sm font-medium text-gray-500">usuarios</span></p>
                                </div>
                            </div>
                            <div className="text-right mt-4 md:mt-0 bg-[#0A2463]/5 px-4 py-2 rounded-lg border border-[#0A2463]/10">
                                <p className="text-[10px] font-bold text-[#0A2463]/60 uppercase">Configuración</p>
                                <p className="font-bold text-[#0A2463] text-sm">{inputs.type} • {inputs.floors} Niveles</p>
                            </div>
                        </div>

                        {/* CONTENEDOR DE COMPARACIÓN INTERACTIVA */}
                        {/* Aquí aplicamos la lógica de desenfoque basada en el hover */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
                            
                            {/* OPCIÓN 1: ESTÁNDAR (Se atenúa si la otra está en hover) */}
                            <div 
                                onMouseEnter={() => setHoveredCard('standard')}
                                onMouseLeave={() => setHoveredCard(null)}
                                className={`bg-white/50 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-sm flex flex-col relative overflow-hidden transition-all duration-500 ${
                                    hoveredCard === 'excellent' ? 'opacity-50 scale-95 blur-[1px] grayscale-[30%]' : 'hover:shadow-xl hover:scale-[1.02]'
                                }`}
                            >
                                <div className="p-6 border-b border-amber-900/5 bg-gradient-to-r from-amber-50/80 to-transparent">
                                    <h4 className="text-lg font-black text-amber-800 flex items-center gap-2 uppercase tracking-tight">
                                        <AlertTriangle size={20} className="text-amber-600"/> Nivel Estándar
                                    </h4>
                                    <p className="text-xs text-amber-700/70 mt-1 font-medium">Cumplimiento normativo básico.</p>
                                </div>
                                
                                <div className="p-6 space-y-6 flex-1">
                                    {/* Métricas Principales */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <span className="text-6xl font-black text-[#0A2463] tracking-tighter leading-none">{results.standard.elevators}</span>
                                            <span className="text-xs font-bold text-gray-400 uppercase ml-2">Equipos</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Intervalo de Espera</p>
                                            <p className="text-2xl font-black text-amber-600">{results.standard.interval} s</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <SpecBox label="Velocidad" value={`${results.standard.speed} m/s`} />
                                        <SpecBox label="Capacidad" value={`${results.standard.persons} Pers.`} />
                                    </div>

                                    {/* Lista de Consideraciones (Estilo Chip Negativo) */}
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-800 mb-3 flex items-center gap-1 uppercase tracking-wider opacity-70"><ThumbsDown size={12}/> Consideraciones</p>
                                        <div className="flex flex-wrap gap-2">
                                            {results.standard.cons.map((c: string, i: number) => (
                                                <div key={i} className="px-3 py-1.5 bg-amber-100/50 text-amber-900/80 text-xs font-medium rounded-lg border border-amber-200/50 flex items-center gap-1">
                                                   <span className="w-1 h-1 rounded-full bg-amber-400"></span> {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-amber-900/5 bg-white/40">
                                    <button 
                                        onClick={() => onQuote({ ...inputs, ...results.standard, tier: 'Standard' })}
                                        className="w-full py-3.5 bg-white border-2 border-amber-100 text-amber-900 font-bold rounded-2xl shadow-sm hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide"
                                    >
                                        Cotizar Opción Base <ArrowRight size={16}/>
                                    </button>
                                </div>
                            </div>

                            {/* OPCIÓN 2: EXCELENTE (LA ESTRELLA DEL SHOW) */}
                            <div 
                                onMouseEnter={() => setHoveredCard('excellent')}
                                onMouseLeave={() => setHoveredCard(null)}
                                className={`bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-emerald-400/30 shadow-2xl relative overflow-hidden z-10 ring-4 ring-emerald-50/50 transition-all duration-500 transform ${
                                    hoveredCard === 'standard' ? 'scale-95 opacity-90' : 'scale-100 md:scale-105 hover:shadow-emerald-500/20'
                                }`}
                            >
                                {/* Animación de brillo sutil */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-shimmer"></div>

                                {/* Badge Premium Diagonal */}
                                <div className="absolute top-4 right-[-35px] rotate-45 bg-gradient-to-r from-[#D4AF37] to-[#FBBF24] text-[#0A2463] text-[9px] font-black px-10 py-1 shadow-md z-20 uppercase tracking-widest">
                                    Recomendado
                                </div>

                                {/* Header Rico */}
                                <div className="p-7 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-600 to-teal-500">
                                    <h4 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight drop-shadow-sm">
                                        <Diamond size={22} className="text-[#D4AF37] fill-[#D4AF37]"/> Nivel Excelente
                                    </h4>
                                    <p className="text-sm text-emerald-50 mt-1.5 font-medium opacity-90">Máximo confort, plusvalía y eficiencia garantizada.</p>
                                </div>
                                
                                <div className="p-7 space-y-7 flex-1 bg-gradient-to-b from-white to-emerald-50/30">
                                    {/* Métricas Principales Destacadas */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <span className="text-7xl font-black text-[#0A2463] tracking-tighter leading-none drop-shadow-sm">{results.excellent.elevators}</span>
                                            <span className="text-sm font-bold text-[#D4AF37] uppercase ml-2">Equipos</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Intervalo de Espera</p>
                                            <p className="text-3xl font-black text-emerald-600">{results.excellent.interval} s</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase bg-emerald-100/50 px-2 py-0.5 rounded-full inline-block mt-1">Óptimo</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SpecBox label="Velocidad" value={`${results.excellent.speed} m/s`} highlightedIcon={Zap} />
                                        <SpecBox label="Capacidad" value={`${results.excellent.persons} Pers.`} highlightedIcon={Users} />
                                    </div>

                                    {/* Ventajas Interactivas (Chips de Cristal) */}
                                    <div>
                                        <p className="text-[11px] font-bold text-emerald-800 mb-4 flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 size={14} className="text-emerald-500"/> Ventajas Competitivas</p>
                                        <div className="flex flex-wrap gap-3">
                                            {results.excellent.pros.map((c: string, i: number) => (
                                                <div key={i} className="group/chip pl-2 pr-4 py-2 bg-white text-emerald-900 text-xs font-bold rounded-xl border-2 border-emerald-100 shadow-sm flex items-center gap-2 transition-all hover:scale-105 hover:border-emerald-300 hover:shadow-md cursor-default bg-gradient-to-br from-white to-emerald-50/50">
                                                   <CheckCircle2 size={14} className="text-emerald-500 group-hover/chip:text-emerald-600 transition-colors"/> 
                                                   {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de Acción Principal */}
                                <div className="p-5 border-t border-emerald-500/10 bg-white/60 backdrop-blur-md">
                                    <button 
                                        onClick={() => onQuote({ ...inputs, ...results.excellent, tier: 'Excellent' })}
                                        className="w-full py-4 bg-gradient-to-r from-[#0A2463] to-[#051338] text-white font-black rounded-2xl shadow-xl shadow-[#0A2463]/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest group relative overflow-hidden border border-[#D4AF37]/30"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                        <ShoppingCart size={18} className="text-[#D4AF37]" /> 
                                        <span className="relative z-10">Cotizar Solución Premium</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponente de Especificación Mejorado ---
const SpecBox = ({ label, value, highlightedIcon: Icon }: { label: string, value: string, highlightedIcon?: any }) => (
    <div className={`p-4 rounded-2xl flex items-center gap-3 border transition-all ${Icon ? 'bg-white border-emerald-100 shadow-sm hover:border-emerald-300' : 'bg-gray-50/50 border-gray-100'}`}>
        {Icon && (
            <div className="p-2.5 bg-emerald-100/50 text-emerald-600 rounded-xl">
                <Icon size={18} />
            </div>
        )}
        <div>
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <span className={`block font-black text-xl ${Icon ? 'text-[#0A2463]' : 'text-gray-700'}`}>{value}</span>
        </div>
    </div>
);