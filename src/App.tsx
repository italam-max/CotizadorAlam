// ARCHIVO: src/App.tsx
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, LogOut, Loader2, User, Shield, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Componentes
import LoginPage from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import Dashboard from './features/dashboard/Dashboard';
import QuoteWizard from './features/quoter/QuoteWizard';
import QuotePreview from './features/quoter/QuotePreview';
import TicketView from './features/tickets/TicketView'; 
import TrafficAnalyzer from './features/tools/TrafficAnalyzer';
import ProjectPlanner from './features/tools/ProjectPlanner';
import OperationalCostCalculator from './features/tools/OperationalCostCalculator';
import ProjectTracker from './features/tools/ProjectTracker';
import SettingsModal from './features/settings/SettingsModal';
import AdminDashboard from './features/admin/AdminDashboard';

import { BackendService } from './services/storageService';
import { UserService } from './services/userService';
import { getNextReference } from './services/utils';
import type { QuoteData, UserProfile } from './types';
import { INITIAL_FORM_STATE } from './data/constants';
import './index.css'; 

export default function ElevatorQuoter() {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Estado de navegación
  const [view, setView] = useState<'dashboard' | 'quoter' | 'quotes-list' | 'ticket' | 'traffic-tool' | 'planner' | 'preview' | 'ops-calculator' | 'tracker' | 'admin'>('dashboard');
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  // Datos
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [workingQuote, setWorkingQuote] = useState<QuoteData>(INITIAL_FORM_STATE);

  // 1. Carga Inicial de Sesión
  useEffect(() => {
    const loadProfile = async (userId: string) => {
      const profile = await UserService.getProfile(userId);
      setUserProfile(profile);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setUserProfile(null); setView('dashboard'); }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Carga de Cotizaciones
  useEffect(() => {
    if (session) {
      const fetchQuotes = async () => {
        try {
          const data = await BackendService.getQuotes();
          setQuotes(data);
        } catch (error) {
          console.error("Error:", error);
          showNotify('Error de conexión', 'error');
        }
      };
      fetchQuotes();
    }
  }, [session]);

  const handleLogout = async () => await supabase.auth.signOut();

  const showNotify = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- MANEJADORES DE ACCIONES ---

  const handleSaveQuote = async (quote: QuoteData) => {
    try {
      const savedQuote = await BackendService.saveQuote(quote);
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      setWorkingQuote(savedQuote);
      showNotify(quote.id ? 'Guardado correctamente' : 'Cotización creada');
    } catch (error) { showNotify('Error al guardar', 'error'); }
  };

  const handleDeleteQuote = async (id: number | string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await BackendService.deleteQuote(id);
        setQuotes(await BackendService.getQuotes());
        showNotify('Proyecto eliminado', 'error');
      } catch (error) { showNotify('Error al eliminar', 'error'); }
    }
  };

  const handleUpdateStatus = async (id: number | string, status: QuoteData['status']) => {
    try {
      await BackendService.updateQuoteStatus(id, status);
      const updatedList = await BackendService.getQuotes();
      setQuotes(updatedList);
      
      // Actualizar la workingQuote si es la que estamos viendo
      if (workingQuote.id === id) {
          setWorkingQuote(prev => ({ ...prev, status }));
      }
      
      showNotify(`Estado actualizado a: ${status}`);
    } catch (error) { showNotify('Error al actualizar estado', 'error'); }
  };

  const handleUpdateStage = async (quote: QuoteData) => {
    try {
      await BackendService.saveQuote(quote);
      setQuotes(await BackendService.getQuotes());
      setWorkingQuote(quote);
      showNotify(`Fase actualizada: ${quote.currentStage}`);
    } catch (error) { showNotify('Error al actualizar fase', 'error'); }
  };

  const handleCreateNewQuote = () => {
      const newRef = getNextReference(quotes);
      setWorkingQuote({ ...INITIAL_FORM_STATE, projectRef: newRef, projectDate: new Date().toISOString().split('T')[0], status: 'Borrador' });
      setView('quoter');
      showNotify(`Nuevo Folio: ${newRef}`);
  };

  // Importar desde Tráfico
  const handleTrafficQuote = (data: any) => {
    setWorkingQuote({
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
    }); 
    setView('quoter');
    showNotify('Datos de tráfico importados');
  };

  const handleTrackQuote = (quote: QuoteData) => { setWorkingQuote(quote); setView('tracker'); };
  const handleOpenTracker = () => { setWorkingQuote(INITIAL_FORM_STATE); setView('tracker'); };

  const handleSelectQuoteSmart = (quote: QuoteData) => {
    setWorkingQuote(quote);
    quote.status === 'Borrador' ? setView('quoter') : setView('ticket');
  };

  // Renderizado Condicional de Carga / Login
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]"><Loader2 size={40} className="text-[#0A2463] animate-spin mb-4" /></div>;
  if (!session) return <LoginPage />;

  return (
    <div className="h-screen bg-[#F9F7F2] flex flex-col font-sans text-[#1A1A1A] overflow-hidden relative">
      
      {/* FONDO SUTIL */}
      <div className="absolute inset-0 arabesque-pattern pointer-events-none z-0"></div>
      <div className="ambient-light-bg"></div>

      {/* HEADER PRINCIPAL (AZUL ZAFIRO) */}
      <header className="h-28 bg-gradient-to-r from-[#051338] via-[#0A2463] to-[#051338] shadow-2xl relative z-30 flex items-center px-8 shrink-0 overflow-hidden border-b border-[#D4AF37]/30">
        
        {/* Patrón sutil header */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
            backgroundImage:  'radial-gradient(#D4AF37 0.5px, transparent 0.5px), radial-gradient(#D4AF37 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
        }}></div>

        {/* Borde de luz inferior */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80 box-shadow-[0_0_15px_#D4AF37]"></div>

        <div className="max-w-[1920px] w-full mx-auto flex justify-between items-center relative z-10">
            
            {/* LOGO */}
            <div className="flex items-center gap-6 cursor-pointer group" onClick={() => setView('dashboard')}>
                <div className="relative">
                    <div className="absolute -inset-2 bg-[#D4AF37] rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl shadow-inner border border-white/10 relative transform group-hover:scale-105 transition-transform duration-300">
                        <img src="/images/logo-alamex.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-md">ALAMEX</span>
                    <span 
                        className="text-[10px] text-[#D4AF37] font-bold tracking-[0.3em] uppercase mt-1.5"
                        style={{ textShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}
                    >
                        Ascending Together
                    </span>
                </div>
            </div>

            {/* TÍTULO CENTRAL */}
            <div className="hidden xl:flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <h2 
                    className="text-2xl font-black text-white tracking-[0.15em] uppercase flex items-center gap-4 transition-all hover:scale-105"
                    style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.1)' }}
                >
                    <span className="text-[#D4AF37] opacity-80 text-xl">✦</span>
                    Cotizador Interno
                    <span className="text-[#D4AF37] opacity-80 text-xl">✦</span>
                </h2>
                <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mt-2"></div>
            </div>
            
            {/* PERFIL */}
            <div className="flex items-center gap-6">
                {userProfile?.role === 'admin' && (
                    <button onClick={() => setView('admin')} className="hidden md:flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0A2463] transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                        <Shield size={14} /> Admin
                    </button>
                )}
                
                <div className="flex items-center gap-4 pl-6 border-l border-white/10" onClick={() => setSettingsOpen(true)}>
                    <div className="text-right hidden md:block cursor-pointer">
                        <p className="text-white font-bold text-sm leading-tight">{userProfile?.full_name || 'Usuario'}</p>
                        <p className="text-[#D4AF37] text-[10px] font-medium uppercase tracking-wider opacity-80">{userProfile?.job_title || 'Ejecutivo'}</p>
                    </div>
                    
                    <div className="relative cursor-pointer group">
                        <div className="absolute -inset-1 bg-[#D4AF37] rounded-full opacity-20 blur-md group-hover:opacity-40 transition-all"></div>
                        <div className="relative w-11 h-11 rounded-full bg-black/30 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] overflow-hidden backdrop-blur-sm shadow-inner">
                            {userProfile?.avatar_url ? (
                                <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-black">{userProfile?.full_name?.charAt(0) || <User/>}</span>
                            )}
                        </div>
                    </div>

                    <button onClick={(e) => {e.stopPropagation(); handleLogout();}} className="text-white/40 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full" title="Salir">
                        <LogOut size={20}/>
                    </button>
                </div>
            </div>
        </div>
      </header>

      {/* NOTIFICACIONES REDISEÑADAS: Sólidas, Premium y Visibles */}
      {notification && (
        <div className={`fixed top-32 right-8 z-[100] animate-bounce-in px-8 py-5 rounded-2xl flex items-center gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border transition-all duration-300 min-w-[300px]
          ${notification.type === 'error' 
            ? 'bg-[#1a0505] border-red-500 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
            : 'bg-[#020A1A] border-[#D4AF37] text-white shadow-[0_0_30px_rgba(212,175,55,0.2)]'
          }`}
        >
          <div className={`p-2 rounded-full shrink-0 ${notification.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
            {notification.type === 'error' ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
          </div>
          <div className="flex-1">
             <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${notification.type === 'error' ? 'text-red-400' : 'text-[#D4AF37]'}`}>
               {notification.type === 'error' ? 'Error' : 'Éxito'}
             </p>
             <p className="font-bold text-sm leading-tight">{notification.msg}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/30 hover:text-white transition-colors">
            <X size={16}/>
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* SIDEBAR */}
        {view !== 'admin' && (
          <Sidebar 
              currentView={view} 
              setView={(v) => { v === 'tracker' ? handleOpenTracker() : setView(v); }} 
              onNewQuote={handleCreateNewQuote}
              quotes={quotes}
              onSelectQuote={handleSelectQuoteSmart} 
          />
        )}
        
        {/* AREA DE VISTAS */}
        <main className={`flex-1 bg-white/40 backdrop-blur-sm relative transition-all flex flex-col overflow-hidden ${view === 'admin' ? 'w-full' : ''}`}>
          
          {view === 'dashboard' && <Dashboard quotes={quotes} onEdit={handleSelectQuoteSmart} onDelete={handleDeleteQuote} onCreate={handleCreateNewQuote} />}
          
          {view === 'admin' && <AdminDashboard onExit={() => setView('dashboard')} onNotify={showNotify}/>}
          
          {view === 'quoter' && (
            <QuoteWizard 
                initialData={workingQuote} 
                onUpdate={setWorkingQuote} 
                onSave={handleSaveQuote} 
                onExit={() => setView('dashboard')} 
                onViewPreview={() => setView('preview')} 
                onOpenOpsCalculator={() => setView('ops-calculator')} 
                existingQuotes={quotes} 
            />
          )}
          
          {view === 'ticket' && (
            <TicketView 
                quote={workingQuote} 
                onBack={() => setView('dashboard')} 
                onUpdateStatus={handleUpdateStatus} 
                onEdit={() => setView('quoter')}  
                allQuotes={quotes}
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
          
          {view === 'traffic-tool' && <TrafficAnalyzer onQuote={handleTrafficQuote} />}
          
          {view === 'planner' && <ProjectPlanner currentQuote={workingQuote} />}
          
          {view === 'ops-calculator' && <OperationalCostCalculator quote={workingQuote.id ? workingQuote : undefined} onBack={() => setView('dashboard')} />}
          
          {view === 'tracker' && <ProjectTracker quote={workingQuote.id ? workingQuote : null} onUpdate={handleUpdateStage} onBack={() => setView('dashboard')} />}
        
        </main>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onSave={() => showNotify('Configuración guardada')} />
    </div>
  );
}