// ARCHIVO: src/App.tsx
import React, { useState, useEffect } from 'react';
import { Box, Settings, AlertCircle, CheckCircle } from 'lucide-react';

// Importación de módulos (componentes)
import { Sidebar } from './components/layout/Sidebar';
import Dashboard from './features/dashboard/Dashboard';
import QuoteWizard from './features/quoter/QuoteWizard';
import QuotePreview from './features/quoter/QuotePreview';
import TrafficAnalyzer from './features/tools/TrafficAnalyzer';
import ProjectPlanner from './features/tools/ProjectPlanner';
import OperationalCostCalculator from './features/tools/OperationalCostCalculator';
import ProjectTracker from './features/tools/ProjectTracker';
import SettingsModal from './features/settings/SettingsModal';

// Servicios y Utilidades
import { BackendService } from './services/storageService';
import { getNextReference } from './services/utils';

// Tipos y Constantes (Nota el 'import type' para evitar errores)
import type { QuoteData, AppSettings } from './types';
import { INITIAL_FORM_STATE } from './data/constants';

// Estilos globales
import './index.css'; 

export default function ElevatorQuoter() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [view, setView] = useState<'dashboard' | 'quoter' | 'traffic-tool' | 'planner' | 'preview' | 'ops-calculator' | 'tracker'>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  
  // Estado para la cotización que se está editando o creando
  const [workingQuote, setWorkingQuote] = useState<QuoteData>(INITIAL_FORM_STATE);

  // --- EFECTOS (CARGA INICIAL) ---
  useEffect(() => {
    // Función asíncrona para cargar datos desde Supabase/LocalStorage
    const fetchQuotes = async () => {
      try {
        const data = await BackendService.getQuotes();
        setQuotes(data);
      } catch (error) {
        console.error("Error cargando cotizaciones:", error);
      }
    };
    fetchQuotes();
  }, []);

  // --- MANEJADORES (HANDLERS) ---

  const showNotify = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Guardar cotización (Crear o Editar)
  const handleSaveQuote = async (quote: QuoteData) => {
    try {
      // Guardamos en la BD
      const savedQuote = await BackendService.saveQuote(quote);
      
      // Actualizamos la lista local refrescando desde el backend para asegurar sincronía
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      
      // Actualizamos la cotización en trabajo con los datos guardados (por si se generó un ID nuevo)
      setWorkingQuote(savedQuote); 
      
      showNotify(quote.id ? 'Cotización actualizada' : 'Cotización creada exitosamente');
    } catch (error) {
      console.error(error);
      showNotify('Error al guardar la cotización', 'error');
    }
  };

  // Eliminar cotización
  const handleDeleteQuote = async (id: number | string) => {
    if (confirm('¿Estás seguro de eliminar esta cotización?')) {
      try {
        await BackendService.deleteQuote(id);
        const updatedList = await BackendService.getQuotes();
        setQuotes(updatedList);
        showNotify('Cotización eliminada', 'error');
      } catch (error) {
        showNotify('Error al eliminar', 'error');
      }
    }
  };

  // Actualizar estatus rápido (desde el Dashboard)
  const handleUpdateStatus = async (id: number | string, status: QuoteData['status']) => {
    try {
      await BackendService.updateQuoteStatus(id, status);
      const updatedList = await BackendService.getQuotes(); // Refrescar lista
      setQuotes(updatedList);
      
      // Si la cotización que estamos viendo es la que se actualizó, actualizamos su estado local
      if (workingQuote.id === id) {
          setWorkingQuote(prev => ({ ...prev, status }));
      }
      showNotify(`Estatus actualizado a: ${status}`);
    } catch (error) {
      showNotify('Error al actualizar estatus', 'error');
    }
  };

  // Actualizar etapa del proyecto (Tracker)
  const handleUpdateStage = async (quote: QuoteData) => {
    try {
      // Guardamos la cotización completa con la nueva etapa
      await BackendService.saveQuote(quote); 
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      setWorkingQuote(quote);
      showNotify(`Etapa actualizada a: ${quote.currentStage}`);
    } catch (error) {
      showNotify('Error al actualizar etapa', 'error');
    }
  }

  // Iniciar una nueva cotización
  const handleCreateNewQuote = () => {
      // Generamos una referencia temporal basada en lo que tenemos cargado
      const newRef = getNextReference(quotes);
      
      const newQuote: QuoteData = {
          ...INITIAL_FORM_STATE,
          projectRef: newRef,
          projectDate: new Date().toISOString().split('T')[0]
      };

      setWorkingQuote(newQuote);
      setView('quoter');
      showNotify(`Nueva cotización iniciada: ${newRef}`);
  };

  // Importar datos desde el Analizador de Tráfico
  const handleTrafficQuote = (data: any) => {
    const quoteData: QuoteData = {
      ...INITIAL_FORM_STATE,
      quantity: data.elevators,
      capacity: data.capacity,
      speed: String(data.speed),
      stops: data.floors,
      travel: data.travelMeters * 1000, // Convertir a mm
      persons: data.persons,
      doorWidth: Number(data.doorType) || 800,
      projectRef: `Análisis ${data.type}`, 
      model: data.speed > 2.5 ? 'MR' : 'MRL-G', // Lógica simple para sugerir modelo
      controlGroup: data.elevators > 1 ? (data.elevators === 2 ? 'Duplex' : `Grupo ${data.elevators}`) : 'Simplex',
    };
    setWorkingQuote(quoteData); 
    setView('quoter');
    showNotify('Datos importados al cotizador');
  };

  // Ir al rastreador de un proyecto
  const handleTrackQuote = (quote: QuoteData) => {
    setWorkingQuote(quote);
    setView('tracker');
  }

  // --- RENDERIZADO (VISTA) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 relative">
      {/* HEADER SUPERIOR */}
      <header className="bg-blue-900 border-b border-blue-800 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-yellow-500 text-blue-900 p-2 rounded-lg shadow-md hover:rotate-12 transition-transform">
            <Box size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase italic">ALAMEX</h1>
            <p className="text-xs text-yellow-400 font-medium tracking-wider">Cotizador Interno Alamex</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-blue-800 rounded-full text-yellow-400 transition-colors">
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* NOTIFICACIONES FLOTANTES */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 animate-bounce-in bg-white border-l-4 shadow-xl px-6 py-4 rounded flex items-center gap-3 ${notification.type === 'error' ? 'border-red-500 text-red-700' : 'border-green-500 text-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold">{notification.msg}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto md:p-6 gap-6 print:p-0 print:w-full print:max-w-none">
        {/* BARRA LATERAL (MENU) */}
        <Sidebar 
            currentView={view} 
            setView={setView} 
            onNewQuote={handleCreateNewQuote}
            quotes={quotes}
            onSelectQuote={(q: QuoteData) => { setWorkingQuote(q); setView('quoter'); }}
        />
        
        {/* AREA DE TRABAJO */}
        <main className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px] relative transition-all print:shadow-none print:border-none print:rounded-none">
          {view === 'dashboard' && (
            <Dashboard 
              quotes={quotes} 
              onEdit={(q: QuoteData) => { setWorkingQuote(q); setView('quoter'); }} 
              onDelete={handleDeleteQuote} 
              onCreate={handleCreateNewQuote} 
              onUpdateStatus={handleUpdateStatus} 
              onTrack={handleTrackQuote} 
            />
          )}
          
          {view === 'quoter' && (
            <QuoteWizard 
              initialData={workingQuote} 
              onUpdate={setWorkingQuote} 
              onSave={handleSaveQuote} 
              onExit={() => setView('dashboard')} 
              onViewPreview={() => setView('preview')} 
              onOpenOpsCalculator={() => setView('ops-calculator')} 
            />
          )}
          
          {view === 'traffic-tool' && (
            <TrafficAnalyzer onQuote={handleTrafficQuote} />
          )}
          
          {view === 'planner' && (
            <ProjectPlanner currentQuote={workingQuote} />
          )}
          
          {view === 'preview' && (
            <QuotePreview 
              data={workingQuote} 
              onBack={() => setView('quoter')} 
              onUpdateStatus={handleUpdateStatus} 
            />
          )}
          
          {view === 'ops-calculator' && (
            <OperationalCostCalculator 
              quote={workingQuote.id ? workingQuote : undefined} 
              onBack={() => setView('dashboard')} 
            />
          )}
          
          {view === 'tracker' && (
            <ProjectTracker 
              quote={workingQuote} 
              onUpdate={handleUpdateStage} 
              onBack={() => setView('dashboard')} 
            />
          )}
        </main>
      </div>

      {/* MODAL DE CONFIGURACIÓN */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        onSave={(s: AppSettings) => showNotify('Configuración guardada')} 
      />
    </div>
  );
}
