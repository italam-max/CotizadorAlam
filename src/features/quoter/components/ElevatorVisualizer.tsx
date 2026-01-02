// ARCHIVO: src/features/quoter/components/ElevatorVisualizer.tsx
import React from 'react';

interface Props {
  type: string; 
}

export const ElevatorVisualizer: React.FC<Props> = ({ type }) => {
  
  // Lógica de mapeo exacta para tus archivos
  const getImagePath = (modelId: string) => {
    // Normalizamos a mayúsculas para evitar errores (mr -> MR)
    const id = modelId ? modelId.toUpperCase() : '';

    // 1. Caso MR (Tu archivo es MR.PNG)
    if (id === 'MR') return '/assets/elevators/MR.PNG';
    
    // 2. Casos MRL (Tu archivo es mrl.PNG)
    // Esto cubre 'MRL-G', 'MRL-L', 'MRL', etc.
    if (id.includes('MRL')) return '/assets/elevators/mrl.PNG';
    
    // 3. Caso Hidráulico u otros (Usa default por ahora)
    // Si consigues una imagen para HYD, agrégala aquí:
    // if (id === 'HYD') return '/assets/elevators/hyd.png';
    
    return '/assets/elevators/default.PNG';
  };

  const imageSrc = getImagePath(type);

  return (
    <div className="h-full w-full bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
      
      {/* Luz de fondo ambiental */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 pointer-events-none" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* LA CLAVE ESTÁ AQUÍ: key={imageSrc} obliga a React a recrear la imagen al cambiar */}
        <img 
          key={imageSrc} 
          src={imageSrc}
          alt={`Vista ${type}`}
          onError={(e) => {
            e.currentTarget.src = '/assets/elevators/default.PNG';
          }}
          className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-700 hover:scale-105 animate-fadeIn"
        />
      </div>

      {/* Etiqueta flotante */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900/90 rounded-full border border-slate-600 backdrop-blur-md z-20 shadow-xl flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
        <span className="text-slate-300 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
          MODELO: <span className="text-white">{type || 'N/A'}</span>
        </span>
      </div>
    </div>
  );
};