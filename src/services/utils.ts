// ARCHIVO: src/services/utils.ts
// CORRECCIÓN: Agregamos 'type' en los imports
import type { QuoteData } from '../types';
import { ELEVATOR_MODELS } from '../data/constants';

export const generateQuoteDescription = (data: QuoteData) => {
  const modelLabel = ELEVATOR_MODELS.find(m => m.id === data.model)?.label || data.model;
  return `Elevador ${modelLabel} de ${data.capacity} kg / ${data.persons} personas a ${data.speed} m/s. de ${data.stops} niveles, salida ${data.entrances}, acabado de cabina: ${data.cabinFinish} con acabado de Piso ${data.cabinFloor} y puertas de ${data.floorDoorFinish} - ${data.doorWidth} x ${data.doorHeight} de ${data.doorType}.`;
};

export const getNextReference = (quotes: QuoteData[]) => {
  let maxId = 0;
  quotes.forEach(q => {
    const match = q.projectRef.match(/ALAM-PROY-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxId) maxId = num;
    }
  });
  const nextNum = maxId + 1;
  return `ALAM-PROY-${String(nextNum).padStart(4, '0')}`;
};