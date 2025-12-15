// ARCHIVO: src/features/tools/OperationalCostCalculator.tsx
import { useState, useEffect } from 'react'; // Quitamos React
import { DollarSign, ArrowLeft, Clipboard, Info, Globe, MapPin, Anchor, Hammer, Briefcase, Save, AlertCircle } from 'lucide-react'; // Quitamos Truck
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
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              Configuración Logística
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Origen del Equipo" helpText="País de procedencia del elevador">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="form-select pl-10" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                    <option value="Turquía">Turquía</option>
                    <option value="China">China</option>
                  </select>
                </div>
              </InputGroup>
              <InputGroup label="Ciudad de Instalación" helpText="Determina costos de viáticos y traslados">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="form-select pl-10" value={city} onChange={(e) => setCity(e.target.value)}>
                    {Object.keys(CITY_COSTS).sort().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </InputGroup>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Anchor size={18} className="text-purple-600"/> Etapa 1: Descarga en Sitio
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Maniobras de Carga y Descarga</p>
                  <p className="text-xs text-gray-500">Incluye carga, traslado local y descarga en sitio.</p>
                </div>
                <div className="w-48">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input type="number" className="form-input pl-8 text-right font-bold text-gray-800" placeholder="0.00" value={manualLoadCost || ''} onChange={(e) => setManualLoadCost(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex-1">
                  <p className="font-bold text-blue-900">Viáticos y Traslados de Personal (Descarga)</p>
                  <p className="text-xs text-blue-600">Calculado automáticamente según tabulador por ciudad ({city}).</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-blue-900">${travelTotal.toLocaleString()}</p>
                  <p className="text-[10px] text-blue-500">Traslado: ${cityData.transport.toLocaleString()} + Viáticos: ${cityData.perDiem.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Hammer size={18} className="text-indigo-600"/> Etapa 2: Montaje Mecánico y Eléctrico
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex-1">
                    <p className="font-bold text-indigo-900">Mano de Obra de Instalación (Base)</p>
                    <p className="text-xs text-indigo-700 mt-1">
                        Basado en {localStops} paradas y capacidad de {localCapacity} kg.
                        <br/>
                        <span className="font-bold">Tiempo estimado ({origin}): {installData.days} días naturales.</span>
                    </p>
                    </div>
                    <div className="text-right">
                    <p className="font-black text-2xl text-indigo-900">${installData.baseCost.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-1">
                        <p className="font-bold text-gray-800 flex items-center gap-2"><Briefcase size={16}/> Logística de Cuadrilla (2 Técnicos)</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Hospedaje y alimentos por {installData.days} días + Movilización de personal y herramienta.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-xl text-gray-800">${totalInstallationLogistics.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">Hospedaje/Alim: ${installTravelCosts.perDiemTotal.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">Movilización: ${installTravelCosts.transportTotal.toLocaleString()}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
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