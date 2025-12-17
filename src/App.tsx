// ARCHIVO: src/App.tsx
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, LogOut, Loader2, User, Shield } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Importación de componentes
import LoginPage from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import Dashboard from './features/dashboard/Dashboard';
import QuoteWizard from './features/quoter/QuoteWizard';
import QuotePreview from './features/quoter/QuotePreview';

// --- CAMBIO: Usamos el nuevo TicketView ---
import TicketView from './features/tickets/TicketView'; 

import TrafficAnalyzer from './features/tools/TrafficAnalyzer';
import ProjectPlanner from './features/tools/ProjectPlanner';
import OperationalCostCalculator from './features/tools/OperationalCostCalculator';
import ProjectTracker from './features/tools/ProjectTracker';
import SettingsModal from './features/settings/SettingsModal';
import AdminDashboard from './features/admin/AdminDashboard';

// Servicios
import { BackendService } from './services/storageService';
import { UserService } from './services/userService';
import { getNextReference } from './services/utils';

// Tipos y Constantes
import type { QuoteData, UserProfile } from './types';
import { INITIAL_FORM_STATE } from './data/constants';

// Estilos
import './index.css'; 

export default function ElevatorQuoter() {
  // --- ESTADO DE SESIÓN Y USUARIO ---
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- ESTADOS DE LA APP ---
  const [view, setView] = useState<'dashboard' | 'quoter' | 'quotes-list' | 'ticket' | 'traffic-tool' | 'planner' | 'preview' | 'ops-calculator' | 'tracker' | 'admin'>('dashboard');
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [workingQuote, setWorkingQuote] = useState<QuoteData>(INITIAL_FORM_STATE);

  // --- EFECTO 1: GESTIÓN DE AUTENTICACIÓN Y PERFIL ---
  useEffect(() => {
    const loadProfile = async (userId: string) => {
      const profile = await UserService.getProfile(userId);
      setUserProfile(profile);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setUserProfile(null);
        setView('dashboard');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- EFECTO 2: CARGAR COTIZACIONES ---
  useEffect(() => {
    if (session) {
      const fetchQuotes = async () => {
        try {
          const data = await BackendService.getQuotes();
          setQuotes(data);
        } catch (error) {
          console.error("Error cargando cotizaciones:", error);
          showNotify('Error al conectar con la base de datos', 'error');
        }
      };
      fetchQuotes();
    }
  }, [session]);

  // --- MANEJADORES GLOBALES ---

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const showNotify = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- LÓGICA DE NEGOCIO ---

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
      // Si estamos trabajando en esa cotización, actualizamos el estado local también
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
  };

  const handleCreateNewQuote = () => {
      const newRef = getNextReference(quotes);
      const newQuote: QuoteData = {
          ...INITIAL_FORM_STATE,
          projectRef: newRef,
          projectDate: new Date().toISOString().split('T')[0],
          status: 'Borrador'
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
      status: 'Borrador'
    };
    setWorkingQuote(quoteData); 
    setView('quoter');
    showNotify('Datos importados al cotizador');
  };

  const handleTrackQuote = (quote: QuoteData) => {
    setWorkingQuote(quote);
    setView('tracker');
  };

  const handleOpenTracker = () => {
    setWorkingQuote(INITIAL_FORM_STATE); 
    setView('tracker');
  };

  // --- LÓGICA INTELIGENTE DE SELECCIÓN ---
  const handleSelectQuoteSmart = (quote: QuoteData) => {
    setWorkingQuote(quote);
    
    // Si sigue en borrador, vamos al cotizador para editar
    if (quote.status === 'Borrador') {
        setView('quoter');
    } else {
        // Si ya fue enviada, vamos al Nuevo Ticket de Chat
        setView('ticket');
    }
  };

  // --- RENDERIZADO ---

  if (authLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 size={48} className="text-blue-900 animate-spin mb-4" />
            <p className="text-blue-900 font-bold animate-pulse">Cargando sistema...</p>
        </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 relative">
      <header className="bg-blue-900 border-b border-blue-800 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-white p-1.5 rounded-lg shadow-md hover:rotate-6 transition-transform">
             <img src="/images/logo-alamex.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase italic">ALAMEX</h1>
            <p className="text-xs text-yellow-400 font-medium tracking-wider">Ascending Together</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {userProfile?.role === 'admin' && (
            <button 
              onClick={() => setView('admin')}
              className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors mr-4 shadow-sm border border-red-500"
            >
              <Shield size={14} /> TI Admin
            </button>
          )}
          <div className="hidden md:flex flex-col items-end mr-2 cursor-pointer" onClick={() => setSettingsOpen(true)}>
             <span className="text-sm font-bold text-white leading-none">{userProfile?.full_name || 'Usuario Alamex'}</span>
             <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wide">{userProfile?.job_title || session.user.email}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-500 text-blue-900 flex items-center justify-center font-black border-2 border-blue-800 shadow-sm cursor-pointer hover:bg-yellow-400 transition-colors" onClick={() => setSettingsOpen(true)} title="Mi Perfil">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : <User size={20}/>}
          </div>
          <div className="w-px h-6 bg-blue-800 mx-1"></div>
          <button onClick={handleLogout} title="Cerrar Sesión" className="p-2 hover:bg-red-900/30 rounded-full text-red-400 transition-colors">
            <LogOut size={24} />
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
        
        {view !== 'admin' && (
          <Sidebar 
              currentView={view} 
              setView={(v) => {
                  if (v === 'tracker') handleOpenTracker();
                  else setView(v);
              }} 
              onNewQuote={handleCreateNewQuote}
              quotes={quotes}
              onSelectQuote={handleSelectQuoteSmart} 
          />
        )}
        
        <main className={`flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px] relative transition-all print:shadow-none print:border-none print:rounded-none ${view === 'admin' ? 'w-full max-w-none' : ''}`}>
          
          {view === 'dashboard' && (
            <Dashboard 
              quotes={quotes} 
              onEdit={handleSelectQuoteSmart} 
              onDelete={handleDeleteQuote} 
              onCreate={handleCreateNewQuote} 
              onUpdateStatus={handleUpdateStatus} 
              onTrack={handleTrackQuote} 
            />
          )}

          {view === 'admin' && (
            <AdminDashboard 
                onExit={() => setView('dashboard')} 
                onNotify={showNotify}
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

          {/* VISTA TICKET ACTUALIZADA (CHAT/WHAPI) */}
          {view === 'ticket' && (
            <TicketView 
                quote={workingQuote} 
                onBack={() => setView('dashboard')}
                onUpdateStatus={handleUpdateStatus}
            />
          )}
          
          {view === 'preview' && (
            <QuotePreview 
              data={workingQuote} 
              onBack={() => workingQuote.status === 'Borrador' ? setView('quoter') : setView('ticket')} 
              onUpdateStatus={handleUpdateStatus} 
              onGoToTicket={() => setView('ticket')} 
            />
          )}
          
          {view === 'traffic-tool' && (
            <TrafficAnalyzer onQuote={handleTrafficQuote} />
          )}
          
          {view === 'planner' && (
            <ProjectPlanner currentQuote={workingQuote} />
          )}
          
          {view === 'ops-calculator' && (
            <OperationalCostCalculator 
              quote={workingQuote.id ? workingQuote : undefined} 
              onBack={() => setView('dashboard')} 
            />
          )}
          
          {view === 'tracker' && (
            <ProjectTracker 
              quote={workingQuote.id ? workingQuote : null} 
              onUpdate={handleUpdateStage} 
              onBack={() => setView('dashboard')} 
            />
          )}
        </main>
      </div>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        onSave={() => showNotify('Configuración guardada')} 
      />
    </div>
  );
}