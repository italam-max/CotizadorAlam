import { useState, useEffect } from 'react'; // Agrega useEffect
import { Settings, X, MessageCircle, User, Briefcase, Save } from 'lucide-react'; // Agrega iconos
import type { AppSettings, UserProfile } from '../../types'; // Importa UserProfile
import { BackendService } from '../../services/storageService';
import { UserService } from '../../services/userService'; // Importa UserService
import { supabase } from '../../supabaseClient'; // Importa supabase
import { InputGroup } from '../../components/ui/InputGroup';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (s: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  // Agrega 'profile' a las pestañas
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'erp' | 'smtp' | 'system'>('profile');
  const [settings, setSettings] = useState<AppSettings>(BackendService.getSettings());
  
  // Estado para el perfil
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Cargar perfil al abrir
  useEffect(() => {
    if (isOpen) {
      const loadProfile = async () => {
        setLoadingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await UserService.getProfile(user.id);
          setProfile(data);
        }
        setLoadingProfile(false);
      };
      loadProfile();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    // Guardar configuraciones generales
    BackendService.saveSettings(settings);
    onSave(settings);
    
    // Guardar perfil si existe
    if (profile) {
      try {
        await UserService.updateProfile(profile.id, {
          full_name: profile.full_name,
          job_title: profile.job_title,
          department: profile.department
        });
      } catch (e) {
        console.error("Error guardando perfil", e);
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2"><Settings className="text-yellow-500"/> Configuración</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>
        
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {/* Nueva Pestaña Perfil */}
          <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 px-4 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>Mi Perfil</button>
          <button onClick={() => setActiveTab('integrations')} className={`flex-1 py-3 px-4 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'integrations' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>Integraciones</button>
          <button onClick={() => setActiveTab('erp')} className={`flex-1 py-3 px-4 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'erp' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>ERP</button>
          <button onClick={() => setActiveTab('system')} className={`flex-1 py-3 px-4 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'system' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>Sistema</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* CONTENIDO DE MI PERFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
               {loadingProfile ? (
                 <p className="text-center text-gray-500 py-4">Cargando datos...</p>
               ) : profile ? (
                 <>
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold">
                        {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={32}/>}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{profile.full_name || 'Sin Nombre'}</h4>
                        <p className="text-sm text-gray-500">{profile.job_title || 'Puesto no definido'}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputGroup label="Nombre Completo">
                        <div className="relative">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                           <input name="full_name" value={profile.full_name || ''} onChange={handleProfileChange} className="form-input pl-10" placeholder="Ej. Ing. Juan Pérez" />
                        </div>
                      </InputGroup>
                      <InputGroup label="Cargo / Puesto">
                        <div className="relative">
                           <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                           <input name="job_title" value={profile.job_title || ''} onChange={handleProfileChange} className="form-input pl-10" placeholder="Ej. Gerente Comercial" />
                        </div>
                      </InputGroup>
                      <InputGroup label="Departamento">
                        <input name="department" value={profile.department || ''} onChange={handleProfileChange} className="form-input" placeholder="Ej. Ventas Nuevas" />
                      </InputGroup>
                   </div>
                 </>
               ) : (
                 <p className="text-red-500">Error cargando perfil. Revisa tu conexión.</p>
               )}
            </div>
          )}

          {/* ... (Mantén el resto de los TABS: integrations, erp, smtp, system IGUAL que antes) ... */}
          {activeTab === 'integrations' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2"><MessageCircle size={18}/> WhatsApp API (Whapi)</h4>
                <p className="text-xs text-green-700 mb-4">Configura el token de Whapi.cloud para habilitar el envío de cotizaciones por WhatsApp.</p>
                <InputGroup label="API Token (Whapi)">
                  <input type="password" name="whapiToken" value={settings.whapiToken} onChange={handleChange} className="form-input" placeholder="whapi_..." />
                </InputGroup>
              </div>
            </div>
          )}
          {/* Asegúrate de pegar los bloques de 'erp', 'smtp' y 'system' del código anterior aquí abajo */}
           {activeTab === 'erp' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4">
                <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2">Conexión Odoo ERP</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="URL Servidor"><input name="odooUrl" value={settings.odooUrl} onChange={handleChange} className="form-input" /></InputGroup>
                  <InputGroup label="Base de Datos"><input name="odooDb" value={settings.odooDb} onChange={handleChange} className="form-input" /></InputGroup>
                  <InputGroup label="Usuario"><input name="odooUser" value={settings.odooUser} onChange={handleChange} className="form-input" /></InputGroup>
                  <InputGroup label="API Key"><input type="password" name="odooKey" value={settings.odooKey} onChange={handleChange} className="form-input" /></InputGroup>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'system' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <button className="w-full p-3 bg-red-100 text-red-700 rounded text-left hover:bg-red-200 font-bold text-sm" onClick={() => { if(confirm('¿Resetear?')) { localStorage.clear(); window.location.reload(); } }}>
                        Resetear Datos Locales
                    </button>
                </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={18}/> Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}