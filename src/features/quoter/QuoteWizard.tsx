// ARCHIVO: src/features/quoter/QuoteWizard.tsx
import { useState } from 'react';
import { X, Zap, MousePointer2, ArrowRight } from 'lucide-react';
import type { QuoteData } from '../../types';

// IMPORTAMOS LOS DOS COMPONENTES HIJOS
import ManualQuoter from './ManualQuoter';
import SelectionAssistant from './SelectionAssistant';

interface QuoteWizardProps {
  initialData: QuoteData;
  existingQuotes: QuoteData[]; // Para el autocompletado en modo manual
  onUpdate: (data: QuoteData) => void;
  onSave: (data: QuoteData) => void;
  onExit: () => void;
  onViewPreview: () => void;
  onOpenOpsCalculator: () => void;
}

type QuoteMode = 'selection' | 'manual' | 'wizard';

export default function QuoteWizard(props: QuoteWizardProps) {
  
  const [mode, setMode] = useState<QuoteMode>('selection');

  // LÓGICA DE INICIO:
  // Si la cotización ya tiene ID y no es un borrador vacío, saltamos la selección
  // y vamos directo al modo manual para editar.
  if (mode === 'selection' && props.initialData.id && props.initialData.status !== 'Borrador') {
      setMode('manual');
  }

  // MANEJADOR: Cuando el Asistente termina su magia
  const handleAssistantComplete = (suggestedData: Partial<QuoteData>) => {
      // 1. Fusionamos lo que recomendó el asistente con los datos base
      const mergedData = { 
          ...props.initialData, 
          ...suggestedData,
          // Aseguramos mantener el ID si existía
          id: props.initialData.id 
      };
      
      // 2. Actualizamos el estado global (App.tsx)
      props.onUpdate(mergedData); 
      
      // 3. Enviamos al usuario al modo manual para que revise los detalles finos
      setMode('manual');
  };

  // --- 1. MODO SELECCIÓN (PANTALLA DE INICIO) ---
  if (mode === 'selection') {
    return (
        <div className="h-full flex flex-col bg-[#F9F7F2] relative overflow-hidden animate-fadeIn">
            <div className="absolute inset-0 arabesque-pattern opacity-30 pointer-events-none"></div>
            
            {/* Header de Salida */}
            <div className="p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-black text-[#0A2463]">Nueva Cotización</h2>
                <button onClick={props.onExit} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <X size={24}/>
                </button>
            </div>

            {/* Contenido Central */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 gap-8">
                <div className="text-center mb-4">
                    <h3 className="text-3xl font-bold text-[#0A2463] mb-2">¿Cómo deseas iniciar?</h3>
                    <p className="text-gray-500">Selecciona el flujo de trabajo que prefieras</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    
                    {/* OPCIÓN A: ASISTENTE INTELIGENTE */}
                    <button 
                        onClick={() => setMode('wizard')}
                        className="group relative bg-white hover:bg-[#0A2463] p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-[#D4AF37] text-left flex flex-col items-start gap-4"
                    >
                        <div className="p-4 bg-blue-50 text-[#0A2463] rounded-2xl group-hover:bg-[#D4AF37] group-hover:text-[#0A2463] transition-colors">
                            <Zap size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-[#0A2463] group-hover:text-white mb-2">Asistente Inteligente</h4>
                            <p className="text-sm text-gray-500 group-hover:text-white/80">Recomendado para edificios estándar o clientes indecisos. Te haremos preguntas simples y sugeriremos el equipo ideal.</p>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-[#D4AF37] font-bold text-sm uppercase tracking-wider group-hover:text-white">
                            Iniciar Wizard <ArrowRight size={16}/>
                        </div>
                    </button>

                    {/* OPCIÓN B: MANUAL AVANZADO */}
                    <button 
                        onClick={() => setMode('manual')}
                        className="group relative bg-white hover:bg-[#0A2463] p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-[#D4AF37] text-left flex flex-col items-start gap-4"
                    >
                        <div className="p-4 bg-gray-50 text-gray-600 rounded-2xl group-hover:bg-[#D4AF37] group-hover:text-[#0A2463] transition-colors">
                            <MousePointer2 size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-[#0A2463] group-hover:text-white mb-2">Modo Manual Avanzado</h4>
                            <p className="text-sm text-gray-500 group-hover:text-white/80">Control total para expertos. Define fosa, overhead, acabados específicos y normativa técnica paso a paso.</p>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-wider group-hover:text-white">
                            Ir al Formulario <ArrowRight size={16}/>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- 2. MODO MANUAL (El formulario grande) ---
  if (mode === 'manual') {
      return (
        <ManualQuoter 
            // Pasamos todas las props que recibimos
            initialData={props.initialData}
            existingQuotes={props.existingQuotes}
            onUpdate={props.onUpdate}
            onSave={props.onSave}
            onExit={props.onExit} // Por si ManualQuoter tuviera botón de salir
            onViewPreview={props.onViewPreview}
            onOpenOpsCalculator={props.onOpenOpsCalculator}
        />
      );
  }

  // --- 3. MODO ASISTENTE (El modal inteligente) ---
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