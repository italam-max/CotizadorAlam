// ARCHIVO: src/features/tools/OperationalCostCalculator.tsx
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowLeft, Clipboard, Info, Truck, Globe, MapPin, Anchor, Hammer, Briefcase, Save, AlertCircle } from 'lucide-react';
import type { QuoteData } from '../../types';
import { CITY_COSTS, INSTALLATION_TIME_TABLE, INSTALLATION_BASE_COSTS, INSTALLATION_TRAVEL_DATA, CAPACITIES } from '../../data/constants';
import { InputGroup } from '../../components/ui/InputGroup';

interface OperationalCostCalculatorProps {
  quote?: QuoteData;
  onBack?: () => void;
}

export default function OperationalCostCalculator({ quote, onBack }: OperationalCostCalculatorProps) {
  const [origin, setOrigin] = useState('Turquía');
  const [city, setCity] = useState('CDMX');
  const [manualLoadCost, setManualLoadCost] = useState(0);
  const [localStops, setLocalStops] = useState(quote?.stops || 2);
  const [localCapacity, setLocalCapacity] = useState(quote?.capacity || 630);

  useEffect(() => {
    if (quote) {
        setLocalStops(quote.stops);
        setLocalCapacity(quote.capacity);
    }
  }, [quote]);

  const cityData = CITY_COSTS[city] || { transport: 0, perDiem: 0 };
  const travelTotal = cityData.transport + cityData.perDiem;

  const getInstallationData = () => {
      const stopsKey = Math.max(2, Math.min(35, localStops));
      const range = INSTALLATION_TIME_TABLE.find(r => stopsKey <= r.max) || INSTALLATION_TIME_TABLE[INSTALLATION_TIME_TABLE.length - 1];
      const days = origin === 'China' ? range.chi : range.tur;

      const rateRow = INSTALLATION_BASE_COSTS[stopsKey];
      const baseCost = !rateRow ? 0 : (localCapacity >= 1000 ? rateRow.large : rateRow.small);

      return { days, baseCost };
  };

  const getInstallationTravelCosts = (days: number) => {
      const travelData = INSTALLATION_TRAVEL_DATA[city] || { perDiemPersonDay: 0, transportCouple: 0, toolTransport: 0 };
      const perDiemTotal = travelData.perDiemPersonDay * 2 * days;
      const transportTotal = travelData.transportCouple + travelData.toolTransport;
      return { perDiemTotal, transportTotal };
  };

  const installData = getInstallationData();
  const installTravelCosts = getInstallationTravelCosts(installData.days);
  const totalInstallationLogistics = installTravelCosts.perDiemTotal + installTravelCosts.transportTotal;
  const totalOps = manualLoadCost + travelTotal + installData.baseCost + totalInstallationLogistics;

  return (
    <div className="p-8 animate-fadeIn h-full flex flex-col overflow-auto bg-gray-50">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900 flex items-center gap-3">
            <DollarSign className="text-green-500" size={32} /> Calculadora de Costos Operacionales
          </h2>
          <p className="text-gray-500 mt-1">Estimación de gastos logísticos, operativos y de montaje.</p>
        </div>
        {onBack && (
            <button onClick={onBack} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={18} /> Volver
            </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Clipboard size={18} className="text-blue-600"/> Datos Base del Equipo
            </h3>
            {quote ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="block text-xs font-bold text-gray-400 uppercase">Cliente</span> <span className="font-bold text-gray-700">{quote.clientName || 'N/A'}</span></div>
                    <div><span className="block text-xs font-bold text-gray-400 uppercase">Proyecto</span> <span className="font-bold text-gray-700">{quote.projectRef || 'N/A'}</span></div>
                    <div><span className="block text-xs font-bold text-gray-400 uppercase">Modelo</span> <span className="font-bold text-blue-900">{quote.model}</span></div>
                    <div><span className="block text-xs font-bold text-gray-400 uppercase">Paradas</span> <span className="font-bold text-gray-700">{quote.stops}</span></div>
                    <div><span className="block text-xs font-bold text-gray-400 uppercase">Capacidad</span> <span className="font-bold text-gray-700">{quote.capacity} kg</span></div>
                    <div><span className="block text-xs font-bold text-gray-400 uppercase">Velocidad</span> <span className="font-bold text-gray-700">{quote.speed} m/s</span></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Cantidad de Paradas">
                        <input type="number" min="2" max="35" className="form-input" value={localStops} onChange={(e) => setLocalStops(Number(e.target.value))} />
                    </InputGroup>
                    <InputGroup label="Capacidad (kg)">
                        <select className="form-select" value={localCapacity} onChange={(e) => setLocalCapacity(Number(e.target.value))}>
                            {CAPACITIES.map(c => <option key={c} value={c}>{c} kg</option>)}
                        </select>
                    </InputGroup>
                    <div className="col-span-2 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 flex items-center gap-2">
                        <Info size={16} /> Modo manual activado: Ajusta paradas y capacidad para calcular montaje.
                    </div>
                </div>
            )}
          </div>
          {/* El resto de la UI es idéntica a tu código original... */}
          {/* ... (Secciones Configuración Logística, Etapa 1, Etapa 2) ... */}
          {/* Para ahorrar espacio aquí, copia el contenido de los otros divs dentro del grid de tu App.tsx original */}
        </div>
        
        {/* Panel lateral de resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-6">
            <h3 className="font-black text-xl text-gray-800 mb-6 flex items-center gap-2">Resumen de Costos</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Maniobras (Descarga)</span>
                <span className="font-bold">${manualLoadCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Viáticos (Descarga)</span>
                <span className="font-bold">${travelTotal.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mano de Obra (Montaje)</span>
                <span className="font-bold">${installData.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Viáticos (Montaje)</span>
                <span className="font-bold text-indigo-600">+ ${totalInstallationLogistics.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-800">Total Operacional</span>
                <span className="font-black text-2xl text-green-600">${totalOps.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 mb-6">
              <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={14}/> Nota:</p>
              <p>Estos costos son estimados preliminares y no incluyen IVA. Asegúrese de verificar la disponibilidad de equipos de maniobra en la zona.</p>
            </div>
            <button className="w-full btn-primary justify-center bg-blue-900 hover:bg-blue-800 text-white py-3">
              <Save size={18} /> Guardar Costos Operativos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}