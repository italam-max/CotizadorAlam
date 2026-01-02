// ARCHIVO: src/features/quoter/components/ElevatorVisualizer.tsx

import React from 'react';
import type { ElevatorType } from '../types';

interface Props {
  type: ElevatorType;
}

export const ElevatorVisualizer: React.FC<Props> = ({ type }) => {
  
  // Lógica para construir la ruta de la imagen
  const getImagePath = (t: ElevatorType) => {
    const fileName = t.toLowerCase(); // Convierte 'MRL' a 'mrl'
    // Asegúrate de que las imágenes estén en public/assets/elevators/
    return `/assets/elevators/${fileName}.png`;
  };

  return (
    <div className="h-full bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
      
      {/* Efecto de luz de fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center py-4">
        <img 
          src={getImagePath(type)}
          alt={`Elevador tipo ${type}`}
          onError={(e) => {
            // Si no encuentra la foto, pone una por defecto
            (e.currentTarget as HTMLImageElement).src = '/assets/elevators/default.png';
          }}
          className="max-h-[300px] object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105"
        />
      </div>

      <div className="mt-4 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-700 backdrop-blur-sm">
        <span className="text-slate-400 text-xs font-bold tracking-wider">
          VISTA: <span className="text-amber-500">{type}</span>
        </span>
      </div>
    </div>
  );
};