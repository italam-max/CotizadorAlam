// ARCHIVO: src/features/quoter/QuoteWizard.tsx
import { useState } from 'react';
import { X, Zap, MousePointer2, ArrowRight, Sparkles } from 'lucide-react';
import type { QuoteData } from '../../types';

// IMPORTAMOS LOS COMPONENTES
import { ManualQuoter } from './ManualQuoter';
import { PlatformQuoter } from './PlatformQuoter';
import SelectionAssistant from './SelectionAssistant';

interface QuoteWizardProps {
  initialData: QuoteData;
  existingQuotes: QuoteData[];
  onUpdate: (data: QuoteData) => void;
  onSave: (data: QuoteData) => void;
  onExit: () => void;
  onViewPreview: () => void;
  onOpenOpsCalculator: () => void;
}

// Definimos los modos incluyendo la distinción entre Vertical y Plataforma
type QuoteMode = 'selection' | 'manual_vertical' | 'manual_platform' | 'wizard';

export default function QuoteWizard(props: QuoteWizardProps) {
  
  const [mode, setMode] = useState<QuoteMode>('selection');

  // LÓGICA DE AUTO-REDIRECCIÓN:
  // Si estamos editando una cotización existente, detectamos el tipo para ir al editor correcto
  if (mode === 'selection' && props.initialData.id && props.initialData.status !== 'Borrador') {
      const isPlatform = props.initialData.model === 'PLAT' || props.initialData.model === 'CAR';
      setMode(isPlatform ? 'manual_platform' : 'manual_vertical');
  }

  // MANEJADOR: Cuando el Asistente Inteligente termina
  const handleAssistantComplete = (suggestedData: Partial<QuoteData>) => {
      const mergedData = { 
          ...props.initialData, 
          ...suggestedData,
          id: props.initialData.id 
      };
      
      props.onUpdate(mergedData); 
      
      // Si el asistente recomendó un equipo de carga/vehicular, vamos a PlatformQuoter
      if (suggestedData.model === 'PLAT' || suggestedData.model === 'CAR') {
          setMode('manual_platform');
      } else {
          setMode('manual_vertical');
      }
  };

  // --- 1. PANTALLA DE SELECCIÓN ---
  if (mode === 'selection') {
    return (
        <div className="h-full flex flex-col bg-[#F9F7F2] relative overflow-hidden animate-fadeIn">
            <div className="absolute inset-0 arabesque-pattern opacity-30 pointer-events-none"></div>
            
            {/* Header */}
            <div className="p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-black text-[#0A2463]">Nueva Cotización</h2>
                <button onClick={props.onExit} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <X size={24}/>
                </button>
            </div>

            {/* Contenido Central */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 gap-8">
                <div className="text-center mb-4">
                    <h3 className="text-3xl font-bold text-[#0A2463] mb-2">¿Qué tipo de equipo deseas cotizar?</h3>
                    <p className="text-gray-500">Selecciona el flujo de trabajo especializado</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    
                    {/* OPCIÓN A: MONTA CARGAS (Abre el editor de plataformas) */}
                    <button 
                        onClick={() => setMode('manual_platform')}
                        className="group relative bg-white hover:bg-[#0A2463] p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-[#D4AF37] text-left flex flex-col items-start gap-4"
                    >
                        <div className="p-4 bg-blue-50 text-[#0A2463] rounded-2xl group-hover:bg-[#D4AF37] group-hover:text-[#0A2463] transition-colors">
                            <Zap size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-[#0A2463] group-hover:text-white mb-2">Montacargas o sistemas de elevación vehicular</h4>
                            <p className="text-sm text-gray-500 group-hover:text-white/80">Configuración industrial para carga pesada y vehículos. Enfoque en dimensiones de plataforma y capacidad hidráulica.</p>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-[#D4AF37] font-bold text-sm uppercase tracking-wider group-hover:text-white">
                            Configurar Carga <ArrowRight size={16}/>
                        </div>
                    </button>

                    {/* OPCIÓN B: ELEVACIÓN VERTICAL (Abre el ManualQuoter) */}
                    <button 
                        onClick={() => setMode('manual_vertical')}
                        className="group relative bg-white hover:bg-[#0A2463] p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-[#D4AF37] text-left flex flex-col items-start gap-4"
                    >
                        <div className="p-4 bg-gray-50 text-gray-600 rounded-2xl group-hover:bg-[#D4AF37] group-hover:text-[#0A2463] transition-colors">
                            <MousePointer2 size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-[#0A2463] group-hover:text-white mb-2">Cotización de Elevación Vertical</h4>
                            <p className="text-sm text-gray-500 group-hover:text-white/80">Flujo completo para elevadores de pasajeros y residenciales. Define fosa, acabados de cabina y normativa técnica.</p>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-wider group-hover:text-white">
                            Ir al Formulario <ArrowRight size={16}/>
                        </div>
                    </button>
                </div>

                {/* BOTÓN SECUNDARIO: ASISTENTE */}
                <button 
                    onClick={() => setMode('wizard')}
                    className="mt-4 flex items-center gap-2 text-slate-400 hover:text-[#0A2463] text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    <Sparkles size={16} className="text-[#D4AF37]"/> 
                    ¿Necesitas ayuda? Usar Asistente Inteligente
                </button>
            </div>
        </div>
    );
  }

  // --- 2. MODOS DE EDICIÓN ---

  if (mode === 'manual_vertical') {
      return (
        <ManualQuoter 
            initialData={props.initialData}
            existingQuotes={props.existingQuotes}
            onUpdate={props.onUpdate}
            onSave={props.onSave}
            onViewPreview={props.onViewPreview}
            onOpenOpsCalculator={props.onOpenOpsCalculator}
        />
      );
  }

  if (mode === 'manual_platform') {
      return (
        <PlatformQuoter 
            initialData={props.initialData}
            existingQuotes={props.existingQuotes}
            onUpdate={props.onUpdate}
            onSave={props.onSave}
            onViewPreview={props.onViewPreview}
        />
      );
  }

  if (mode === 'wizard') {
      return (
        <SelectionAssistant 
            isOpen={true} 
            onClose={() => setMode('selection')} 
            onApply={handleAssistantComplete}
            clientName={props.initialData.clientName || ''}
            projectRef={props.initialData.projectRef || ''}
        />
      );
  }

  return null;
}