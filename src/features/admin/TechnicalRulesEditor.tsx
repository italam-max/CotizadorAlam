import { useConfig } from '../../context/ConfigContext';
import { ShieldAlert, Ruler, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function TechnicalRulesEditor() {
  const { rules, updateRule, reloadRules, loading } = useConfig();
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">
      
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A2463]">Panel de Ingeniería</h2>
          <p className="text-gray-500 text-sm">Ajusta los límites físicos del cotizador en tiempo real.</p>
        </div>
        <button 
          onClick={reloadRules}
          className="text-gray-400 hover:text-[#0A2463] transition-colors p-2"
          title="Recargar datos"
        >
          <RefreshCw size={20}/>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TARJETA 1: REGLAS HIDRÁULICAS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert size={100} className="text-[#D4AF37]"/>
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                    <ShieldAlert size={24}/>
                </div>
                <h3 className="font-bold text-lg text-gray-800">Límites Hidráulicos</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Recorrido Máximo</label>
                        <span className="text-xs font-mono text-[#0A2463]">{rules.max_hydraulic_travel / 1000} m</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            value={rules.max_hydraulic_travel}
                            onChange={(e) => updateRule('max_hydraulic_travel', Number(e.target.value))}
                            className="w-full p-3 border border-gray-200 rounded-xl font-mono text-[#0A2463] font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                        />
                        <span className="text-sm text-gray-400 font-bold">mm</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                        Si un proyecto excede esta distancia, el sistema bloqueará la opción Hidráulica.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paradas Máx</label>
                        <input 
                            type="number"
                            value={rules.max_hydraulic_stops}
                            onChange={(e) => updateRule('max_hydraulic_stops', Number(e.target.value))}
                            className="w-full p-3 border border-gray-200 rounded-xl font-mono text-gray-700 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Velocidad Máx</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" step="0.1"
                                value={rules.hyd_speed_max}
                                onChange={(e) => updateRule('hyd_speed_max', Number(e.target.value))}
                                className="w-full p-3 border border-gray-200 rounded-xl font-mono text-gray-700 font-bold"
                            />
                            <span className="text-xs text-gray-400">m/s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* TARJETA 2: DIMENSIONES Y MRL */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ruler size={100} className="text-[#0A2463]"/>
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-[#0A2463]/10 rounded-lg text-[#0A2463]">
                    <Ruler size={24}/>
                </div>
                <h3 className="font-bold text-lg text-gray-800">Dimensiones Civiles</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Límite MRL {"->"} MR</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={rules.mrl_capacity_limit}
                            onChange={(e) => updateRule('mrl_capacity_limit', Number(e.target.value))}
                            className="w-full p-2 bg-white border border-blue-200 rounded-lg font-mono text-[#0A2463] font-bold"
                        />
                        <span className="text-sm font-bold text-blue-600">KG</span>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-2">
                        Capacidades superiores sugerirán Cuarto de Máquinas (MR).
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fosa Estándar</label>
                        <input 
                            type="number" 
                            value={rules.min_pit_std}
                            onChange={(e) => updateRule('min_pit_std', Number(e.target.value))}
                            className="w-full p-3 border border-gray-200 rounded-xl font-mono text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-red-400 uppercase mb-1">Fosa Mínima (Riesgo)</label>
                        <input 
                            type="number" 
                            value={rules.min_pit_reduced}
                            onChange={(e) => updateRule('min_pit_reduced', Number(e.target.value))}
                            className="w-full p-3 border border-red-200 bg-red-50 rounded-xl font-mono text-red-700 font-bold"
                        />
                    </div>
                </div>
            </div>
        </div>

      </div>
      
      {/* Footer Flotante de Estado */}
      <div className="fixed bottom-6 right-6 bg-[#0A2463] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold animate-slideIn">
         <Save size={18} className="text-[#D4AF37]"/>
         Cambios guardados automáticamente
      </div>
    </div>
  );
}