// ARCHIVO: src/features/tools/ProjectPlanner.tsx
import { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCcw, Edit3, Activity } from 'lucide-react';
import type { QuoteData } from '../../types';
import { STANDARD_PHASES } from '../../data/constants';

export default function ProjectPlanner({ currentQuote }: { currentQuote: QuoteData }) {
  const [config, setConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    elevators: 1,
    stops: 4,
  });

  const [phases, setPhases] = useState(STANDARD_PHASES);

  const syncWithQuote = () => {
    setConfig({
      ...config,
      elevators: currentQuote.quantity || 1,
      stops: currentQuote.stops || 4,
    });
  };

  useEffect(() => {
    setPhases(prev => prev.map(p => {
      if (!p.isVariable) return p;
      let newDuration = p.baseDuration;
      if (p.name === 'Fabricación') {
        newDuration += Math.max(0, (config.elevators - 1) * 0.5);
      } else if (p.name === 'Instalación') {
        newDuration = 4 + ((config.elevators - 1) * 0.8) + ((config.stops - 2) * 0.1);
      }
      return { ...p, duration: parseFloat(newDuration.toFixed(1)) };
    }));
  }, [config.elevators, config.stops]);

  const handleDurationChange = (id: string, newVal: number) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, duration: newVal } : p));
  };

  const schedule = useMemo(() => {
    let currentWeeks = 0;
    const start = new Date(config.startDate);
    
    return phases.map(phase => {
      const duration = phase.duration !== undefined ? phase.duration : phase.baseDuration;
      const phaseStart = new Date(start);
      phaseStart.setDate(start.getDate() + (currentWeeks * 7));
      
      currentWeeks += duration;
      
      const phaseEnd = new Date(start);
      phaseEnd.setDate(start.getDate() + (currentWeeks * 7));

      return {
        ...phase,
        finalDuration: duration,
        startStr: phaseStart.toLocaleDateString(),
        endStr: phaseEnd.toLocaleDateString(),
        startWeeks: currentWeeks - duration,
        endWeeks: currentWeeks
      };
    });
  }, [config.startDate, phases]);

  const totalWeeks = schedule[schedule.length - 1].endWeeks;

  return (
    <div className="p-8 animate-fadeIn h-full flex flex-col overflow-auto">
      <div className="mb-6 border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900 flex items-center gap-3">
            <Calendar className="text-yellow-500" size={32} /> Planificación de Proyecto
          </h2>
          <p className="text-gray-500 mt-1">Cronograma configurable según parámetros de obra.</p>
        </div>
        
        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-wrap gap-4 items-end">
           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Inicio</label>
              <input type="date" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})} className="border p-1.5 rounded text-sm font-bold text-blue-900 w-32" />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Equipos</label>
              <input type="number" min="1" value={config.elevators} onChange={e => setConfig({...config, elevators: Number(e.target.value)})} className="border p-1.5 rounded text-sm font-bold text-blue-900 w-16 text-center" />
           </div>
           
           <button onClick={syncWithQuote} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-bold flex items-center gap-1 transition-colors h-full mb-0.5">
              <RefreshCcw size={14}/> Sincronizar
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        <div className="w-full lg:w-2/5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit3 size={18} className="text-blue-600"/> Ajuste de Fases</h3>
           <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {schedule.map((phase) => (
                 <div key={phase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${phase.color}`}></div>
                       <span className="text-sm font-medium text-gray-700">{phase.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <input 
                         type="number" step="0.5" min="0.1" value={phase.finalDuration} 
                         onChange={(e) => handleDurationChange(phase.id, parseFloat(e.target.value))}
                         className="w-16 text-center border border-gray-300 rounded p-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                       <span className="text-xs text-gray-400">sem</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Cronograma Visual</h3>
           
           <div className="flex-1 relative overflow-y-auto">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 z-0"></div>
              <div className="space-y-4 relative z-10">
                {schedule.map((phase, idx) => (
                  <div key={idx} className="flex flex-col mb-4 group">
                    <div className="flex items-center justify-between text-xs mb-1 px-1">
                       <span className="font-bold text-gray-700">{phase.name}</span>
                       <span className="text-gray-500">{phase.startStr} - {phase.endStr}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className={`h-full ${phase.color} rounded-full relative`} style={{ width: `${(phase.finalDuration / totalWeeks) * 100}%`, marginLeft: `${(phase.startWeeks / totalWeeks) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}