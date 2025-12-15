// ARCHIVO: src/App.tsx
import { useState, useEffect } from 'react'; // Quitamos 'React'
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

// Tipos y Constantes
import type { QuoteData } from './types'; // Quitamos 'AppSettings' si no se usa aquí
import { INITIAL_FORM_STATE } from './data/constants';

// Estilos globales
import './index.css'; 

export default function ElevatorQuoter() {
  const [view, setView] = useState<'dashboard' | 'quoter' | 'traffic-tool' | 'planner' | 'preview' | 'ops-calculator' | 'tracker'>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  
  const [workingQuote, setWorkingQuote] = useState<QuoteData>(INITIAL_FORM_STATE);

  useEffect(() => {
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

  const showNotify = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveQuote = async (quote: QuoteData) => {
    try {
      const savedQuote = await BackendService.saveQuote(quote);
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      setWorkingQuote(savedQuote); 
      showNotify(quote.id ? 'Cotización actualizada' : 'Cotización creada exitosamente');
    } catch (error) {
      console.error(error);
      showNotify('Error al guardar la cotización', 'error');
    }
  };

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

  const handleUpdateStatus = async (id: number | string, status: QuoteData['status']) => {
    try {
      await BackendService.updateQuoteStatus(id, status);
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      if (workingQuote.id === id) {
          setWorkingQuote(prev => ({ ...prev, status }));
      }
      showNotify(`Estatus actualizado a: ${status}`);
    } catch (error) {
      showNotify('Error al actualizar estatus', 'error');
    }
  };

  const handleUpdateStage = async (quote: QuoteData) => {
    try {
      await BackendService.saveQuote(quote); 
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      setWorkingQuote(quote);
      showNotify(`Etapa actualizada a: ${quote.currentStage}`);
    } catch (error) {
      showNotify('Error al actualizar etapa', 'error');
    }
  }

  const handleCreateNewQuote = () => {
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

  const handleTrafficQuote = (data: any) => {
    const quoteData: QuoteData = {
      ...INITIAL_FORM_STATE,
      quantity: data.elevators,
      capacity: data.capacity,
      speed: String(data.speed),
      stops: data.floors,
      travel: data.travelMeters * 1000,
      persons: data.persons,
      doorWidth: Number(data.doorType) || 800,
      projectRef: `Análisis ${data.type}`, 
      model: data.speed > 2.5 ? 'MR' : 'MRL-G',
      controlGroup: data.elevators > 1 ? (data.elevators === 2 ? 'Duplex' : `Grupo ${data.elevators}`) : 'Simplex',
    };
    setWorkingQuote(quoteData); 
    setView('quoter');
    showNotify('Datos importados al cotizador');
  };

  const handleTrackQuote = (quote: QuoteData) => {
    setWorkingQuote(quote);
    setView('tracker');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 relative">
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

      {notification && (
        <div className={`fixed top-24 right-6 z-50 animate-bounce-in bg-white border-l-4 shadow-xl px-6 py-4 rounded flex items-center gap-3 ${notification.type === 'error' ? 'border-red-500 text-red-700' : 'border-green-500 text-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold">{notification.msg}</span>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto md:p-6 gap-6 print:p-0 print:w-full print:max-w-none">
        <Sidebar 
            currentView={view} 
            setView={setView} 
            onNewQuote={handleCreateNewQuote}
            quotes={quotes}
            onSelectQuote={(q: QuoteData) => { setWorkingQuote(q); setView('quoter'); }}
        />
        
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

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        // CORRECCION: Quitamos el argumento 's' que no se usaba
        onSave={() => showNotify('Configuración guardada')} 
      />
    </div>
  );
}