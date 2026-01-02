// ARCHIVO: src/features/tools/ProjectPlanner.tsx
import { useState, useEffect, useMemo } from 'react';
// CORRECCIÓN: Agregamos CheckCircle2 a las importaciones
import { Calendar, RefreshCcw, Activity, Clock, Layers, Flag, CheckCircle2 } from 'lucide-react';
import type { QuoteData, ProjectPhase } from '../../types';
import { STANDARD_PHASES } from '../../data/constants';

// Interfaz extendida para los items calculados del cronograma
interface ScheduleItem extends ProjectPhase {
  finalDuration: number;
  startStr: string;
  endStr: string;
  fullEndDate: Date;
  startWeeks: number;
  endWeeks: number;
  gradient: string;
}

export default function ProjectPlanner({ currentQuote }: { currentQuote: QuoteData }) {
  const [config, setConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    elevators: 1,
    stops: 4,
  });

  // Tipamos explícitamente el estado
  const [phases, setPhases] = useState<ProjectPhase[]>(STANDARD_PHASES);

  const syncWithQuote = () => {
    setConfig({
      ...config,
      elevators: currentQuote.quantity || 1,
      stops: currentQuote.stops || 4,
    });
  };

  useEffect(() => {
    setPhases((prev: ProjectPhase[]) => prev.map((p: ProjectPhase) => {
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
    setPhases((prev: ProjectPhase[]) => prev.map((p: ProjectPhase) => p.id === id ? { ...p, duration: newVal } : p));
  };

  const schedule = useMemo<ScheduleItem[]>(() => {
    let currentWeeks = 0;
    const start = new Date(config.startDate);
    
    return phases.map((phase: ProjectPhase, index: number) => {
      const duration = phase.duration !== undefined ? phase.duration : phase.baseDuration;
      
      const phaseStart = new Date(start);
      phaseStart.setDate(start.getDate() + (currentWeeks * 7));
      
      currentWeeks += duration;
      
      const phaseEnd = new Date(start);
      phaseEnd.setDate(start.getDate() + (currentWeeks * 7)); 

      return {
        ...phase,
        finalDuration: duration,
        startStr: phaseStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
        endStr: phaseEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
        fullEndDate: phaseEnd,
        startWeeks: currentWeeks - duration,
        endWeeks: currentWeeks,
        gradient: getPremiumGradient(index)
      };
    });
  }, [config.startDate, phases]);

  // Si phases o schedule están vacíos, no renderizamos o mostramos loader
  if (!schedule || schedule.length === 0) return null;

  const totalWeeks = schedule[schedule.length - 1].endWeeks;
  const projectEndDate = schedule[schedule.length - 1].fullEndDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="h-full flex flex-col bg-[#F9F7F2] animate-fadeIn overflow-y-auto custom-scrollbar relative">
      
      <div className="absolute inset-0 arabesque-pattern pointer-events-none z-0 opacity-30"></div>
      
      {/* HEADER MINIMALISTA */}
      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center bg-[#F9F7F2]/90 backdrop-blur-md sticky top-0 z-30 border-b border-[#D4AF37]/10 gap-6">
        <div>
          <h2 className="text-2xl font-black text-[#0A2463] flex items-center gap-3 tracking-tight">
            <Calendar className="text-[#D4AF37]" size={24} />
            Cronograma Maestro
          </h2>
          <p className="text-sm text-[#0A2463]/60 mt-1 font-medium ml-9">
            Proyección de tiempos y ruta crítica.
          </p>
        </div>
        
        {/* CONTROLES SIMPLIFICADOS */}
        <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-xl border border-[#0A2463]/5 shadow-sm">
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-[#0A2463]/40 uppercase tracking-wider">Inicio</label>
              <input 
                type="date" 
                value={config.startDate} 
                onChange={e => setConfig({...config, startDate: e.target.value})} 
                className="bg-transparent text-[#0A2463] font-bold text-sm focus:outline-none" 
              />
           </div>
           <div className="w-px h-8 bg-[#0A2463]/10"></div>
           <button 
                onClick={syncWithQuote} 
                className="text-xs font-bold text-[#0A2463] hover:text-[#D4AF37] flex items-center gap-2 transition-colors"
                title="Recalcular con datos de cotización"
           >
              <RefreshCcw size={14}/> Sincronizar
           </button>
        </div>
      </div>

      <div className="p-6 md:p-8 z-10 space-y-8 max-w-[1600px] mx-auto w-full">
        
        {/* 1. CARDS DE DATOS CLAVE (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0A2463]/5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duración Total</p>
                    <p className="text-3xl font-black text-[#0A2463]">{totalWeeks.toFixed(1)} <span className="text-sm font-medium text-gray-400">Semanas</span></p>
                </div>
                <div className="p-3 bg-[#0A2463]/5 rounded-xl text-[#0A2463] group-hover:text-[#D4AF37] transition-colors"><Clock size={24}/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0A2463]/5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Etapas Críticas</p>
                    <p className="text-3xl font-black text-[#0A2463]">{schedule.length} <span className="text-sm font-medium text-gray-400">Fases</span></p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:text-[#D4AF37] transition-colors"><Layers size={24}/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0A2463]/5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fecha Estimada Entrega</p>
                    <p className="text-xl font-black text-[#0A2463] leading-tight">{schedule[schedule.length-1].endStr}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date().getFullYear()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:text-[#D4AF37] transition-colors"><Flag size={24}/></div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 2. LISTA DE FASES (Minimalista) */}
            <div className="lg:col-span-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#0A2463]/5 p-6 shadow-sm">
                <h3 className="font-bold text-[#0A2463] mb-6 text-sm uppercase tracking-wider border-b border-[#0A2463]/10 pb-2">Configuración de Tiempos</h3>
                <div className="space-y-3">
                    {schedule.map((phase: ScheduleItem, idx: number) => (
                        <div key={phase.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 w-4">{idx + 1}.</span>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A2463] transition-colors">{phase.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" step="0.5" min="0.1" 
                                    value={phase.finalDuration} 
                                    onChange={(e) => handleDurationChange(phase.id, parseFloat(e.target.value))}
                                    className="w-12 text-right bg-transparent text-sm font-bold text-[#0A2463] border-b border-transparent focus:border-[#D4AF37] outline-none transition-all hover:bg-white"
                                />
                                <span className="text-[9px] text-gray-400 uppercase">sem</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. VISUALIZADOR GANTT (Sticky & Clean) */}
            <div className="lg:col-span-8 flex flex-col sticky top-28">
                <div className="bg-white rounded-2xl shadow-lg border border-[#0A2463]/5 overflow-hidden">
                   {/* Header Gráfico */}
                   <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                       <h3 className="font-bold text-[#0A2463] text-sm uppercase tracking-wider flex items-center gap-2">
                           <Activity size={16} className="text-[#D4AF37]"/> Flujo de Trabajo
                       </h3>
                       <div className="flex gap-2">
                           {[0, 25, 50, 75, 100].map(pct => (
                               <div key={pct} className="text-[9px] text-gray-400">{pct}%</div>
                           ))}
                       </div>
                   </div>
                   
                   <div className="p-6 bg-white relative">
                      {/* Grid de fondo sutil */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: 'linear-gradient(90deg, #0A2463 1px, transparent 1px)', backgroundSize: '10% 100%'}}></div>

                      <div className="space-y-5 relative z-10">
                        {schedule.map((phase: ScheduleItem, idx: number) => (
                          <div key={idx} className="group flex flex-col gap-1">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#0A2463] transition-colors">{phase.name}</span>
                                <span className="text-[9px] text-gray-400 font-mono">{phase.startStr} - {phase.endStr}</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                    className={`h-full rounded-full shadow-sm transition-all duration-700 ease-out relative ${phase.gradient}`} 
                                    style={{ 
                                        width: `${Math.max(1, (phase.finalDuration / totalWeeks) * 100)}%`, 
                                        marginLeft: `${(phase.startWeeks / totalWeeks) * 100}%` 
                                    }}
                               >
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                {/* 4. RESUMEN GENERADO AUTOMÁTICAMENTE */}
                <div className="mt-6 bg-[#0A2463] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                    
                    <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16}/> Resumen Ejecutivo del Proyecto
                    </h4>
                    
                    <p className="text-sm leading-relaxed text-white/90 font-light">
                        El proyecto dará inicio el <strong className="text-white font-bold">{new Date(config.startDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. 
                        Se ha estructurado un plan de trabajo de <strong className="text-white font-bold">{totalWeeks.toFixed(1)} semanas</strong> totales, 
                        abarcando desde la Ingeniería hasta la Entrega Final. 
                        La fase crítica de instalación está programada para durar <strong className="text-white font-bold">{schedule.find((p: ScheduleItem) => p.name === 'Instalación')?.finalDuration} semanas</strong>.
                        Se estima la conclusión y entrega operativa para el <strong className="text-[#D4AF37] font-bold">{projectEndDate}</strong>.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// Gradientes limpios y elegantes
const getPremiumGradient = (index: number) => {
    const gradients = [
        'bg-blue-500',      
        'bg-indigo-500',  
        'bg-[#D4AF37]',    
        'bg-slate-500',    
        'bg-purple-500',  
        'bg-teal-500',      
        'bg-orange-500',  
        'bg-[#0A2463]',    
        'bg-pink-500',      
        'bg-cyan-500',      
        'bg-emerald-500',
    ];
    return gradients[index % gradients.length];
};