// ARCHIVO: src/features/tools/ProjectTracker.tsx
import React, { useState } from 'react';
import { Radar, ArrowLeft, Info, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import type { QuoteData } from '../../types';
import { PROJECT_STAGES } from '../../data/constants';

interface ProjectTrackerProps {
  quote: QuoteData;
  onUpdate: (q: QuoteData) => void;
  onBack: () => void;
}

export default function ProjectTracker({ quote, onUpdate, onBack }: ProjectTrackerProps) {
  const [activeStageId, setActiveStageId] = useState(quote.currentStage || 'ingenieria');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [pendingStage, setPendingStage] = useState<string | null>(null);

  const currentStageIndex = PROJECT_STAGES.findIndex(s => s.id === activeStageId);

  const handleStageClick = (stageId: string) => {
    if (stageId !== activeStageId) {
       setPendingStage(stageId);
       setShowNotifyModal(true);
    }
  };

  const confirmStageChange = (notify: boolean) => {
    if (pendingStage) {
      setActiveStageId(pendingStage);
      onUpdate({ ...quote, currentStage: pendingStage });
      
      if (notify) {
        const stageLabel = PROJECT_STAGES.find(s => s.id === pendingStage)?.label;
        const msg = `Estimado ${quote.clientName}, nos complace informarle que su proyecto ${quote.projectRef} ha avanzado a la etapa de: *${stageLabel}*. \n\nSeguimos trabajando para usted.\n\nAtte. Alamex Elevadores`;
        window.open(`https://wa.me/${quote.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    }
    setShowNotifyModal(false);
    setPendingStage(null);
  };

  return (
    <div className="p-8 animate-fadeIn h-full flex flex-col overflow-auto bg-gray-50">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900 flex items-center gap-3">
            <Radar className="text-green-500" size={32} /> Rastreo y Seguimiento
          </h2>
          <p className="text-gray-500 mt-1">Monitoreo de etapas del proyecto: <span className="font-bold text-gray-800">{quote.projectRef}</span></p>
        </div>
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={18} /> Volver
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Barra de progreso visual */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-14 left-0 w-full h-1 bg-gray-100 -z-10"></div>
          <div 
            className="absolute top-14 left-0 h-1 bg-blue-500 transition-all duration-700 -z-10"
            style={{ width: `${(currentStageIndex / (PROJECT_STAGES.length - 1)) * 100}%` }}
          ></div>

          <div className="relative flex justify-between items-start z-10">
            {PROJECT_STAGES.map((stage, idx) => {
              const isActive = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex flex-col items-center group cursor-pointer w-20" onClick={() => handleStageClick(stage.id)}>
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? `${stage.bg} ${stage.color} border-white shadow-md` : 'bg-white text-gray-300 border-gray-200'} ${isCurrent ? 'ring-4 ring-blue-100 scale-125' : ''}`}>
                      <Icon size={20} />
                   </div>
                   <div className={`mt-4 text-center transition-colors ${isActive ? 'text-gray-800' : 'text-gray-300'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Fase {idx + 1}</p>
                      <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-blue-600' : ''}`}>{stage.label}</p>
                   </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ... Resto de la UI (Detalles de etapa y Modal) ... */}
        {/* (Copia el resto del contenido del componente Tracker aquí) */}
      </div>
      
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowNotifyModal(false)}>
           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-blue-600 p-6 text-center">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                    <TrendingUp className="text-white" size={24} />
                 </div>
                 <h3 className="text-xl font-black text-white">Actualización de Etapa</h3>
                 <p className="text-blue-100 text-sm mt-1">El proyecto cambia de estado.</p>
              </div>
              <div className="p-8">
                 <p className="text-gray-700 font-medium text-center mb-6">
                    Vas a mover el proyecto a la etapa: <br/>
                    <strong className="text-lg text-blue-900">{PROJECT_STAGES.find(s => s.id === pendingStage)?.label}</strong>
                    <br/><br/>
                    ¿Deseas notificar al cliente de este cambio?
                 </p>
                 <div className="flex gap-3">
                    <button onClick={() => confirmStageChange(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">
                       No notificar
                    </button>
                    <button onClick={() => confirmStageChange(true)} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
                       <MessageCircle size={18} /> Sí, Notificar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}