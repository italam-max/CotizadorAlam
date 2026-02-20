// ARCHIVO: src/features/quoter/components/KeyDataDisplay.tsx

import React from 'react';
import type { QuoteData } from '../../../types';

interface Props {
  data: QuoteData;
}

export const KeyDataDisplay: React.FC<Props> = ({ data }) => {
  
  const formatCurrency = (val: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Tarjeta Principal de Precio - Ocupa 2 columnas */}
      <div className="col-span-2 bg-slate-800 border-l-4 border-amber-500 p-5 rounded-lg shadow-md">
        <h4 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">
          Inversión Total Estimada
        </h4>
        <div className="text-amber-400 text-4xl font-mono font-bold">
          {formatCurrency(data.price, data.currency || 'MXN')}
        </div>
      </div>

      {/* Tarjetas de Datos Técnicos */}
      <DataCard label="Capacidad" value={data.capacity} sub={`${data.persons} Personas`} />
      <DataCard label="Velocidad" value={data.speed} />
      <DataCard label="Niveles" value={data.stops} sub="Paradas" />
      <DataCard label="Recorrido" value={data.travel} />
    </div>
  );
};

// Sub-componente interno para no repetir código HTML
const DataCard = ({ label, value, sub }: { label: string, value: string | number, sub?: string }) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50 hover:border-amber-500/30 transition-colors group">
    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-amber-500/70 transition-colors">
      {label}
    </p>
    <p className="text-slate-200 text-xl font-mono font-medium">
      {value} <span className="text-slate-500 text-xs font-sans font-normal">{sub}</span>
    </p>
  </div>
);