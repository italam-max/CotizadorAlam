// ARCHIVO: src/features/tools/ProjectTracker.tsx
import { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, AlertCircle, Package, Truck, 
  ArrowLeft, Search, Loader2, Ruler, Hammer, Ship, Wrench, LayoutGrid
} from 'lucide-react';
import type { QuoteData, ProjectPhase } from '../../types';
import { supabase } from '../../supabaseClient';

interface ProjectTrackerProps {
  quote: QuoteData | null; // Ahora puede ser null si entramos directo
  onUpdate: (quote: QuoteData) => void;
  onBack: () => void;
}

// Fases del proyecto (Estandarizadas)
const PHASES: ProjectPhase[] = [
  { id: 'start', name: 'Ingeniería', baseDuration: 1, color: 'bg-blue-500' },
  { id: 'manufacturing', name: 'Manufactura', baseDuration: 4, color: 'bg-yellow-500' },
  { id: 'transit', name: 'Tránsito / Aduana', baseDuration: 2, color: 'bg-purple-500' },
  { id: 'delivery', name: 'Entrega en Obra', baseDuration: 1, color: 'bg-green-500' },
  { id: 'installation', name: 'Instalación', baseDuration: 4, color: 'bg-orange-500' }
];

export default function ProjectTracker({ quote: initialQuote, onUpdate, onBack }: ProjectTrackerProps) {
  // --- ESTADOS ---
  // Si nos pasan una quote inicial (viniendo del dashboard), la mostramos directo.
  // Si no (viniendo del sidebar), mostramos el Dashboard de Rastreo.
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(
     initialQuote && initialQuote.id ? initialQuote : null
  );

  const [projects, setProjects] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar proyectos activos al montar el componente (Solo si no hay uno seleccionado)
  useEffect(() => {
    if (!selectedQuote) {
        fetchActiveProjects();
    }
  }, [selectedQuote]);

  const fetchActiveProjects = async () => {
    setLoading(true);
    // Traemos todo lo que NO sea borrador. Asumimos que "Enviada", "Sincronizado", etc. son activos.
    const { data } = await supabase
        .from('quotes')
        .select('*')
        .neq('status', 'Borrador') 
        .order('projectDate', { ascending: false });
    
    if (data) setProjects(data as any);
    setLoading(false);
  };

  // --- CÁLCULOS DE KPI (Métricas) ---
  const stats = {
      engineering: projects.filter(p => p.currentStage === 'Ingeniería').length,
      manufacturing: projects.filter(p => p.currentStage === 'Manufactura').length,
      transit: projects.filter(p => p.currentStage === 'Tránsito / Aduana').length,
      installation: projects.filter(p => p.currentStage === 'Instalación').length,
  };

  // Filtrado para el buscador interno
  const filteredProjects = projects.filter(p => 
    p.projectRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // --- VISTA 1: DASHBOARD DE OPERACIONES (Cuando no hay quote seleccionada) ---
  if (!selectedQuote) {
      return (
        <div className="h-full flex flex-col p-6 md:p-10 animate-fadeIn bg-slate-50 overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Truck className="text-blue-900" size={32}/> Rastreador de Pedidos
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">Monitoreo en tiempo real del estatus de fabricación y entrega.</p>
                </div>
                {/* Buscador Rápido */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Buscar por Folio o Cliente..." 
                        className="pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none w-64 md:w-80 shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* KPI CARDS (Resumen Ejecutivo) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <KPICard 
                    title="En Ingeniería / Planos" 
                    count={stats.engineering} 
                    icon={<Ruler size={24}/>} 
                    color="blue"
                    desc="Pendiente aprobación"
                />
                <KPICard 
                    title="En Manufactura" 
                    count={stats.manufacturing} 
                    icon={<Hammer size={24}/>} 
                    color="yellow"
                    desc="Fabricación en planta"
                />
                <KPICard 
                    title="En Tránsito" 
                    count={stats.transit} 
                    icon={<Ship size={24}/>} 
                    color="purple"
                    desc="Aduana / Transporte"
                />
                <KPICard 
                    title="En Instalación" 
                    count={stats.installation} 
                    icon={<Wrench size={24}/>} 
                    color="orange"
                    desc="Obra civil / Montaje"
                />
            </div>

            {/* LISTA DE PROYECTOS */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex-1 flex flex-col">
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <LayoutGrid size={18}/> Pedidos Activos
                    </h3>
                    <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                        {filteredProjects.length} Proyectos
                    </span>
                </div>
                
                <div className="overflow-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-blue-900" size={32}/>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <Package size={48} className="mx-auto mb-4 opacity-50"/>
                            <p>No se encontraron pedidos activos con ese criterio.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="p-4 border-b">Folio</th>
                                    <th className="p-4 border-b">Cliente</th>
                                    <th className="p-4 border-b">Modelo / Equipos</th>
                                    <th className="p-4 border-b">Fase Actual</th>
                                    <th className="p-4 border-b text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProjects.map(project => (
                                    <tr key={project.id} className="hover:bg-blue-50 transition-colors group">
                                        <td className="p-4 font-bold text-blue-900">{project.projectRef}</td>
                                        <td className="p-4 text-slate-700">{project.clientName}</td>
                                        <td className="p-4 text-sm text-slate-500">{project.model} ({project.quantity} equipos)</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getPhaseColor(project.currentStage)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {project.currentStage || 'Ingeniería'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setSelectedQuote(project)}
                                                className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Ver Detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      );
  }


  // --- VISTA 2: DETALLE DEL PROYECTO (TIMELINE) ---
  // (Esta es la lógica que ya tenías, pero encapsulada)
  
  const currentStageIndex = PHASES.findIndex(p => p.name === (selectedQuote.currentStage || 'Ingeniería'));
  const safeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  const handleStageChange = (stageName: string) => {
      const updatedQuote = { ...selectedQuote, currentStage: stageName };
      setSelectedQuote(updatedQuote);
      onUpdate(updatedQuote); 
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-10 animate-fadeIn bg-slate-50 overflow-auto">
      {/* Header Detalle */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => {
                    // Si nos pasaron una quote inicial (venimos de dashboard principal), onBack regresa al dashboard principal.
                    // Si no (venimos del tracker dashboard), regresamos a null (tracker dashboard).
                    if (initialQuote?.id) onBack(); 
                    else setSelectedQuote(null);
                }} 
                className="p-2 hover:bg-white hover:shadow rounded-full transition-all text-slate-500"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    {selectedQuote.projectRef}
                </h2>
                <p className="text-slate-500 font-medium mt-1">Cliente: {selectedQuote.clientName}</p>
            </div>
        </div>
        
        <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
            Vista Detallada
        </div>
      </div>

      {/* Timeline Visual (Igual que antes) */}
      <div className="max-w-5xl mx-auto w-full mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-200 rounded-full -translate-y-1/2 z-0"></div>
        <div 
            className="absolute top-1/2 left-0 h-2 bg-blue-900 rounded-full -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
            style={{ width: `${(safeIndex / (PHASES.length - 1)) * 100}%` }}
        ></div>

        <div className="relative z-10 flex justify-between w-full">
            {PHASES.map((phase, index) => {
                const isActive = index === safeIndex;
                const isCompleted = index < safeIndex;
                
                return (
                    <div key={phase.id} className="flex flex-col items-center group cursor-pointer" onClick={() => handleStageChange(phase.name)}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 transform ${isActive ? 'bg-blue-900 border-blue-200 scale-125 shadow-xl text-white' : isCompleted ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-300 text-slate-300 hover:border-blue-300'}`}>
                            {isCompleted ? <CheckCircle size={20} /> : isActive ? <Truck size={20} className="animate-pulse"/> : <Clock size={20} />}
                        </div>
                        <p className={`mt-4 text-sm font-bold transition-colors ${isActive ? 'text-blue-900' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                            {phase.name}
                        </p>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
         <div className="bg-slate-900 text-white p-6"><h3 className="font-bold text-lg flex items-center gap-2"><AlertCircle/> Estado del Proyecto</h3></div>
         <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold text-slate-800 text-lg mb-4">Datos Generales</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex justify-between border-b border-slate-100 pb-2"><span>Equipos:</span> <span className="font-bold text-slate-800">{selectedQuote.quantity}</span></li>
                    <li className="flex justify-between border-b border-slate-100 pb-2"><span>Modelo:</span> <span className="font-bold text-slate-800">{selectedQuote.model}</span></li>
                    <li className="flex justify-between border-b border-slate-100 pb-2"><span>Niveles:</span> <span className="font-bold text-slate-800">{selectedQuote.stops}</span></li>
                </ul>
            </div>
            <div className={`p-6 rounded-xl border ${getPhaseBg(selectedQuote.currentStage)}`}>
                <h4 className="font-bold mb-2 text-slate-800">Fase: {selectedQuote.currentStage || 'Ingeniería'}</h4>
                <p className="text-sm text-slate-600">El proyecto se encuentra activo en esta fase. Asegúrese de actualizar la bitácora en Odoo si hay cambios.</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

const KPICard = ({ title, count, icon, color, desc }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
    };

    return (
        <div className={`p-5 rounded-xl border shadow-sm flex items-start justify-between ${colors[color] || colors.blue}`}>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</p>
                <h3 className="text-3xl font-black mt-1">{count}</h3>
                <p className="text-[10px] mt-1 font-medium opacity-70">{desc}</p>
            </div>
            <div className="p-2 bg-white/50 rounded-lg">{icon}</div>
        </div>
    );
};

const getPhaseColor = (stage?: string) => {
    switch(stage) {
        case 'Ingeniería': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Manufactura': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'Tránsito / Aduana': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'Instalación': return 'bg-orange-50 text-orange-700 border-orange-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
}

const getPhaseBg = () => {
    // Retorna clases para el fondo de la tarjeta de detalle
    return 'bg-slate-50 border-slate-200'; 
}