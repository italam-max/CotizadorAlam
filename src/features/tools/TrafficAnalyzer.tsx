// ARCHIVO: src/features/tools/TrafficAnalyzer.tsx
import { useState, useEffect } from 'react';
import { 
  BarChart2, Calculator, Building, TrendingUp, AlertTriangle, 
  ThumbsDown, Zap, ThumbsUp, ShoppingCart 
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

  const handleCalc = () => {
    const res = calculateTrafficAnalysis(inputs);
    setResults(res);
  };

  useEffect(() => {
    if (inputs.type === 'Oficinas') setInputs(prev => ({...prev, occupantsPerUnit: 0})); 
  }, [inputs.type]);

  return (
    <div className="p-8 animate-fadeIn h-full flex flex-col overflow-auto">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-black text-blue-900 flex items-center gap-3">
          <BarChart2 className="text-yellow-500" size={32} /> Analizador de Tráfico
        </h2>
        <p className="text-gray-500 mt-1 max-w-3xl">
          Herramienta de consultoría para determinar la configuración óptima comparando opciones Estándar vs Excelente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building size={18} className="text-blue-600"/> Datos del Inmueble
          </h3>
          
          <InputGroup label="Tipo de Edificio">
            <select className="form-select" value={inputs.type} onChange={e => setInputs({...inputs, type: e.target.value})}>
              <option value="Residencial">Residencial / Vivienda</option>
              <option value="Oficinas">Oficinas Corporativas</option>
              <option value="Hotel">Hotel</option>
              <option value="Hospital">Hospital / Clínica</option>
            </select>
          </InputGroup>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Niveles / Paradas">
              <input type="number" className="form-input" value={inputs.floors} onChange={e => setInputs({...inputs, floors: Number(e.target.value)})} />
            </InputGroup>
            <InputGroup label="Recorrido (m)">
              <input type="number" className="form-input" value={inputs.travelMeters} onChange={e => setInputs({...inputs, travelMeters: Number(e.target.value)})} />
            </InputGroup>
          </div>

          {inputs.type === 'Oficinas' ? (
             <InputGroup label="Área Útil por Piso (m²)">
                <input type="number" className="form-input" value={inputs.areaPerFloor} onChange={e => setInputs({...inputs, areaPerFloor: Number(e.target.value)})} />
             </InputGroup>
          ) : (
             <div className="grid grid-cols-2 gap-4">
               <InputGroup label={inputs.type === 'Hospital' ? 'Camas por Piso' : (inputs.type === 'Hotel' ? 'Habitaciones/Piso' : 'Deptos por Piso')}>
                  <input type="number" className="form-input" value={inputs.unitsPerFloor} onChange={e => setInputs({...inputs, unitsPerFloor: Number(e.target.value)})} />
               </InputGroup>
               <InputGroup label={inputs.type === 'Hospital' ? 'Personas/Cama' : 'Ocupantes/Unidad'} helpText="Promedio estimado">
                  <input type="number" className="form-input" value={inputs.occupantsPerUnit} onChange={e => setInputs({...inputs, occupantsPerUnit: Number(e.target.value)})} />
               </InputGroup>
             </div>
          )}

          <button onClick={handleCalc} className="w-full btn-primary justify-center mt-4 bg-blue-900 hover:bg-blue-800 text-white">
            <Calculator size={18} /> Calcular Comparativa
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!results ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
               <TrendingUp size={64} className="mb-4 opacity-20" />
               <p className="font-medium text-lg">Ingresa los datos del edificio</p>
               <p className="text-sm">Se generará un comparativo de eficiencia.</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Población Total Estimada</p>
                    <p className="text-2xl font-black text-blue-900">{results.population} <span className="text-base font-normal text-blue-700">personas</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase">Edificio</p>
                    <p className="font-bold text-gray-700">{inputs.type} - {inputs.floors} Niveles</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-xl shadow-lg border-t-4 border-orange-400 overflow-hidden flex flex-col relative">
                    <div className="p-6 bg-orange-50 border-b border-orange-100">
                       <h4 className="text-lg font-black text-orange-800 flex items-center gap-2"><AlertTriangle size={20}/> NIVEL ESTÁNDAR</h4>
                       <p className="text-xs text-orange-700 mt-1">Opción base. Costo inicial menor.</p>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                       <div className="text-center py-2">
                          <span className="block text-5xl font-black text-gray-800">{results.standard.elevators}</span>
                          <span className="text-sm font-bold text-gray-500 uppercase">Elevadores</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                             <span className="block text-gray-400 text-xs font-bold">Velocidad</span>
                             <span className="font-bold text-gray-800 text-lg">{results.standard.speed} m/s</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                             <span className="block text-gray-400 text-xs font-bold">Capacidad</span>
                             <span className="font-bold text-gray-800 text-lg">{results.standard.persons} Pers.</span>
                          </div>
                       </div>
                       <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-gray-500">Espera Promedio</span>
                             <span className="font-bold text-orange-600">{results.standard.interval} s</span>
                          </div>
                          <div className="mt-3">
                              <p className="text-xs font-bold text-orange-800 mb-1 flex items-center gap-1"><ThumbsDown size={12}/> Desventajas / Riesgos:</p>
                              <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                                  {results.standard.cons.map((c: string, i: number) => <li key={i}>{c}</li>)}
                              </ul>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                       <button 
                         onClick={() => onQuote({ ...inputs, ...results.standard, tier: 'Standard' })}
                         className="w-full py-2 bg-white border border-orange-400 text-orange-800 font-bold rounded-lg shadow-sm hover:bg-orange-50 flex items-center justify-center gap-2 transition-colors">
                         <ShoppingCart size={16} /> Cotizar Estándar
                       </button>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-500 overflow-hidden flex flex-col transform scale-105 z-10 ring-4 ring-green-50 relative">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">RECOMENDADO</div>
                    <div className="p-6 bg-green-50 border-b border-green-100">
                       <h4 className="text-lg font-black text-green-800 flex items-center gap-2"><Zap size={20}/> NIVEL EXCELENTE</h4>
                       <p className="text-xs text-green-700 mt-1">Máximo confort y plusvalía.</p>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                       <div className="text-center py-2">
                          <span className="block text-5xl font-black text-gray-800">{results.excellent.elevators}</span>
                          <span className="text-sm font-bold text-gray-500 uppercase">Elevadores</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                             <span className="block text-gray-400 text-xs font-bold">Velocidad</span>
                             <span className="font-bold text-gray-800 text-lg">{results.excellent.speed} m/s</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                             <span className="block text-gray-400 text-xs font-bold">Capacidad</span>
                             <span className="font-bold text-gray-800 text-lg">{results.excellent.persons} Pers.</span>
                          </div>
                       </div>
                       <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-gray-500">Espera Promedio</span>
                             <span className="font-bold text-green-600">{results.excellent.interval} s</span>
                          </div>
                          <div className="mt-3">
                              <p className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1"><ThumbsUp size={12}/> Ventajas Competitivas:</p>
                              <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                                  {results.excellent.pros.map((c: string, i: number) => <li key={i}>{c}</li>)}
                              </ul>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-green-50 border-t border-green-100">
                       <button 
                         onClick={() => onQuote({ ...inputs, ...results.excellent, tier: 'Excellent' })}
                         className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center gap-2 transform transition hover:scale-105">
                         <ShoppingCart size={18} /> Cotizar Excelente
                       </button>
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}