import React, { useState } from 'react';
import { X, Save, ShieldAlert, Ruler, RefreshCw, Zap } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const { rules, updateRule, reloadRules, loading } = useConfig();
  const [activeTab, setActiveTab] = useState<'hyd' | 'civil'>('hyd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Window */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0A2463] p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Zap size={20} className="text-[#D4AF37]" />
              Configuración Técnica
            </h2>
            <p className="text-blue-200 text-xs mt-1">Define las reglas de negocio globales</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button 
            onClick={() => setActiveTab('hyd')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative
              ${activeTab === 'hyd' ? 'text-[#0A2463] bg-blue-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ShieldAlert size={16} />
            Límites Hidráulicos
            {activeTab === 'hyd' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('civil')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative
              ${activeTab === 'civil' ? 'text-[#0A2463] bg-blue-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Ruler size={16} />
            Dimensiones & MRL
            {activeTab === 'civil' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Cargando reglas...</div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: HIDRÁULICOS */}
              {activeTab === 'hyd' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                    <p className="text-xs text-orange-800 leading-relaxed">
                      <strong>Nota:</strong> Estos límites determinan cuándo el cotizador bloquea la opción hidráulica y sugiere tracción.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Recorrido Máximo (mm)</label>
                      <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            value={rules.max_hydraulic_travel}
                            onChange={(e) => updateRule('max_hydraulic_travel', Number(e.target.value))}
                            className="flex-1 p-3 bg-gray-50 border-gray-200 rounded-lg font-mono text-[#0A2463] font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none"
                        />
                        <span className="text-xs font-bold text-gray-400">Legacy: 15000</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Paradas Máx</label>
                          <input 
                              type="number"
                              value={rules.max_hydraulic_stops}
                              onChange={(e) => updateRule('max_hydraulic_stops', Number(e.target.value))}
                              className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg font-mono font-bold"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Velocidad Máx (m/s)</label>
                          <input 
                              type="number" step="0.1"
                              value={rules.hyd_speed_max}
                              onChange={(e) => updateRule('hyd_speed_max', Number(e.target.value))}
                              className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg font-mono font-bold"
                          />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CIVIL & MRL */}
              {activeTab === 'civil' && (
                <div className="space-y-6 animate-fadeIn">
                  
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
                        Si la capacidad excede este valor, se sugerirá Cuarto de Máquinas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fosa Estándar (mm)</label>
                        <input 
                            type="number" 
                            value={rules.min_pit_std}
                            onChange={(e) => updateRule('min_pit_std', Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg font-mono text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-red-400 uppercase mb-1">Fosa Mínima (mm)</label>
                        <input 
                            type="number" 
                            value={rules.min_pit_reduced}
                            onChange={(e) => updateRule('min_pit_reduced', Number(e.target.value))}
                            className="w-full p-3 bg-red-50 border-red-100 rounded-lg font-mono text-red-700 font-bold"
                        />
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Huida / Overhead (mm)</label>
                     <input 
                        type="number" 
                        value={rules.min_overhead_std}
                        onChange={(e) => updateRule('min_overhead_std', Number(e.target.value))}
                        className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg font-mono text-gray-700"
                     />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <button 
            onClick={reloadRules}
            className="text-gray-400 hover:text-gray-600 text-xs font-bold flex items-center gap-1"
          >
            <RefreshCw size={14} /> Recargar Datos
          </button>

          <button 
            onClick={() => { onSave(); onClose(); }}
            className="bg-[#0A2463] hover:bg-[#1a3a8f] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
}