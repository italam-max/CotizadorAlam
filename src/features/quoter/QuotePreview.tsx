// ARCHIVO: src/features/quoter/QuotePreview.tsx
import { useMemo } from 'react'; // Quitamos React
import { ArrowLeft, CheckSquare, Clock, Share2, Mail, Printer } from 'lucide-react';
import type { QuoteData } from '../../types';
import { ELEVATOR_MODELS } from '../../data/constants';
import { generateQuoteDescription } from '../../services/utils';

interface QuotePreviewProps {
  data: QuoteData;
  onBack: () => void;
  onUpdateStatus: (id: string | number, status: QuoteData['status']) => void;
}

export default function QuotePreview({ data, onBack, onUpdateStatus }: QuotePreviewProps) {
  // ... (El resto del código es igual, solo cambiaron los imports)
  const description = useMemo(() => generateQuoteDescription(data), [data]);
  const estimatedPrice = 1110000;
  const totalPrice = (estimatedPrice * data.quantity) + (data.installationCost || 0);

  const handlePrint = () => window.print();

  const handleShare = (method: 'whatsapp' | 'email') => {
    let msg = `Hola, adjunto cotización para el proyecto ${data.projectRef}.\n\nTotal: $${totalPrice.toLocaleString()}\n\nAtte. Alamex`;
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.location.href = `mailto:?subject=Cotización Alamex - ${data.projectRef}&body=${encodeURIComponent(msg)}`;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-blue-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Volver al Editor
        </button>
        <div className="flex gap-2">
            <button onClick={() => onUpdateStatus(data.id, 'Enviada')} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition-colors text-sm">
                <CheckSquare size={18} /> Marcar Enviada
            </button>
            <button onClick={() => onUpdateStatus(data.id, 'Por Seguimiento')} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-orange-600 transition-colors text-sm">
                <Clock size={18} /> Por Seguimiento
            </button>
            <div className="w-px bg-gray-300 mx-2"></div>
            <button onClick={() => handleShare('whatsapp')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow" title="Enviar por WhatsApp"><Share2 size={20} /></button>
            <button onClick={() => handleShare('email')} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow" title="Enviar por Correo"><Mail size={20} /></button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition-transform hover:scale-105">
            <Printer size={20} /> Imprimir PDF
            </button>
        </div>
      </div>

      <div className="bg-white w-full max-w-4xl shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0">
        <div className="p-8 border-b-4 border-blue-900 flex justify-between items-end bg-slate-50 print:bg-white">
          <div>
            <h1 className="text-4xl font-black text-slate-300 tracking-widest uppercase mb-1">ALAMEX</h1>
            <p className="text-sm font-bold text-yellow-600 tracking-wide uppercase">Ascending Together</p>
            <p className="text-xs text-gray-400 mt-1">www.alam.mx</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-900">COTIZACIÓN DE PROYECTO</h2>
            <p className="text-sm text-gray-500">Ref: {data.projectRef}</p>
            <p className="text-sm text-gray-500">Fecha: {data.projectDate}</p>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <section>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 print:bg-transparent print:border-gray-200">
              <h3 className="font-bold text-blue-900 mb-2 uppercase text-sm border-b border-blue-200 pb-1">Información del Cliente</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold text-gray-600">Cliente:</span> {data.clientName}</div>
                <div><span className="font-bold text-gray-600">Teléfono:</span> {data.clientPhone}</div>
                <div><span className="font-bold text-gray-600">Email:</span> {data.clientEmail}</div>
                <div><span className="font-bold text-gray-600">Ubicación:</span> CIUDAD DE MÉXICO</div>
              </div>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-3 text-left w-3/5">Descripción</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-right">Precio Unitario</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 align-top">
                    <p className="font-bold text-gray-800 mb-1">{description}</p>
                    <p className="text-xs text-gray-500">Incluye suministro, instalación y puesta en marcha.</p>
                  </td>
                  <td className="p-4 text-center align-top font-bold">{data.quantity}</td>
                  <td className="p-4 text-right align-top text-gray-600">${estimatedPrice.toLocaleString()}</td>
                  <td className="p-4 text-right align-top font-bold text-blue-900">${(estimatedPrice * data.quantity).toLocaleString()}</td>
                </tr>
                {data.installationCost ? (
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="p-4 font-medium text-gray-700">Servicio de Mano de Obra (Instalación)</td>
                    <td className="p-4 text-center">1</td>
                    <td className="p-4 text-right text-gray-600">${data.installationCost.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-blue-900">${data.installationCost.toLocaleString()}</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan={3} className="p-3 text-right font-bold text-gray-700 uppercase">Total Propuesta (MXN)</td>
                  <td className="p-3 text-right font-black text-xl text-blue-900">${totalPrice.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="break-inside-avoid">
            <h3 className="font-black text-lg text-blue-900 mb-4 border-b-2 border-yellow-400 pb-1 inline-block uppercase">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Tipo de Equipo</span>
                <span className="font-medium">{ELEVATOR_MODELS.find(m => m.id === data.model)?.label}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Capacidad</span>
                <span className="font-medium">{data.capacity} kg ({data.persons} personas)</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Velocidad</span>
                <span className="font-medium">{data.speed} m/s</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Paradas / Niveles</span>
                <span className="font-medium">{data.stops}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Recorrido</span>
                <span className="font-medium">{data.travel / 1000} metros</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Dimensiones Cubo</span>
                <span className="font-medium">{data.shaftWidth} x {data.shaftDepth} mm</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Foso / Overhead</span>
                <span className="font-medium">{data.pit} mm / {data.overhead} mm</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Control</span>
                <span className="font-medium">Inteligente {data.controlGroup}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Sistema Tracción</span>
                <span className="font-medium">{data.traction}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-bold text-gray-600">Normativa</span>
                <span className="font-medium">{data.norm}</span>
              </div>
            </div>
          </section>

          <section className="break-inside-avoid">
            <h3 className="font-black text-lg text-blue-900 mb-4 border-b-2 border-yellow-400 pb-1 inline-block uppercase">Acabados y Estética</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Cabina</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-bold text-gray-600">Modelo:</span> {data.cabinModel}</p>
                  <p><span className="font-bold text-gray-600">Acabado Muros:</span> {data.cabinFinish}</p>
                  <p><span className="font-bold text-gray-600">Piso:</span> {data.cabinFloor}</p>
                  <p><span className="font-bold text-gray-600">Pasamanos:</span> {data.handrailType}</p>
                  <p><span className="font-bold text-gray-600">Botonera (COP):</span> {data.copModel}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Puertas</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-bold text-gray-600">Tipo:</span> {data.doorType}</p>
                  <p><span className="font-bold text-gray-600">Medidas:</span> {data.doorWidth} x {data.doorHeight} mm</p>
                  <p><span className="font-bold text-gray-600">Acabado Piso:</span> {data.floorDoorFinish}</p>
                  <p><span className="font-bold text-gray-600">Seguridad:</span> Cortina Infrarroja 64 LEDs</p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-xs text-gray-600 space-y-2 pt-6 border-t border-gray-300 break-inside-avoid">
            <h4 className="font-bold text-gray-800 uppercase">Condiciones Comerciales Generales:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Tiempo de Entrega:</strong> Variable, sujeto a firma de contrato y aprobación de planos.</li>
              <li><strong>Garantía:</strong> 12 meses contra defectos de fabricación, sujeta a mantenimiento autorizado.</li>
              <li><strong>Mantenimiento:</strong> Se incluyen 3 meses de servicio preventivo gratuito post-entrega.</li>
              <li><strong>Vigencia:</strong> Esta propuesta tiene una validez de 30 días hábiles.</li>
            </ul>
            <div className="mt-8 pt-8 text-center">
              <p className="font-bold text-blue-900">ELEVADORES ALAMEX S.A. DE C.V.</p>
              <p>www.alam.mx</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}