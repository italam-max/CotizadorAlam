// ARCHIVO: src/features/quoter/components/ConfigAnalysisTable.tsx

import React from 'react';
import type { ConfigItem } from '../types';

interface Props {
  items: ConfigItem[];
}

export const ConfigAnalysisTable: React.FC<Props> = ({ items }) => {
  return (
    <div className="w-full mt-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-2">
        <div className="w-1.5 h-6 bg-amber-500 rounded-sm"></div>
        <h3 className="text-xl text-white font-light">Desglose de Configuración</h3>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-5 font-semibold border-b border-slate-700 w-1/4">Componente</th>
              <th className="p-5 font-semibold border-b border-slate-700 w-1/4">Especificación</th>
              <th className="p-5 font-semibold border-b border-slate-700 w-1/2">Detalles / Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {items.map((item, idx) => (
              <tr 
                key={item.id} 
                className={`hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}
              >
                <td className="p-5 text-slate-300 font-medium border-r border-slate-700/30">
                  {item.parametro}
                </td>
                <td className="p-5">
                  <span className="text-amber-500 font-mono text-sm bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    {item.valor}
                  </span>
                </td>
                <td className="p-5 text-slate-400 text-sm italic">
                  {item.observaciones || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
