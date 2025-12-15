// ARCHIVO: src/features/settings/SettingsModal.tsx
import { useState } from 'react';
import { Settings, X, MessageCircle } from 'lucide-react'; // Quitamos Database, Mail, Trash2
import type { AppSettings } from '../../types';
import { BackendService } from '../../services/storageService';
import { InputGroup } from '../../components/ui/InputGroup';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (s: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'integrations' | 'erp' | 'smtp' | 'system'>('integrations');
  const [settings, setSettings] = useState<AppSettings>(BackendService.getSettings());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    BackendService.saveSettings(settings);
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2"><Settings className="text-yellow-500"/> Configuración del Sistema</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>
        
        <div className="flex border-b border-gray-100">
          <button onClick={() => setActiveTab('integrations')} className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'integrations' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>Integraciones</button>
          <button onClick={() => setActiveTab('erp')} className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'erp' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>ERP (Odoo)</button>
          <button onClick={() => setActiveTab('smtp')} className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'smtp' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>SMTP (Zepto)</button>
          <button onClick={() => setActiveTab('system')} className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'system' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600'}`}>Sistema</button>
        </div>

        <div className="p-6 overflow-y-auto">
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
          
          {activeTab === 'erp' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4">
                <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2">Conexión Odoo ERP</h4>
                <p className="text-xs text-purple-700 mb-4">Credenciales para sincronizar clientes y proyectos con Odoo vía XML-RPC.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="URL Servidor">
                    <input name="odooUrl" value={settings.odooUrl} onChange={handleChange} className="form-input" placeholder="https://odoo.midominio.com" />
                  </InputGroup>
                  <InputGroup label="Base de Datos">
                    <input name="odooDb" value={settings.odooDb} onChange={handleChange} className="form-input" />
                  </InputGroup>
                  <InputGroup label="Usuario (Email)">
                    <input name="odooUser" value={settings.odooUser} onChange={handleChange} className="form-input" />
                  </InputGroup>
                  <InputGroup label="API Key / Contraseña">
                    <input type="password" name="odooKey" value={settings.odooKey} onChange={handleChange} className="form-input" />
                  </InputGroup>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">SMTP (ZeptoMail)</h4>
                <p className="text-xs text-orange-700 mb-4">Configuración para envío transaccional de correos.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Host SMTP">
                    <input name="zeptoHost" value={settings.zeptoHost} onChange={handleChange} className="form-input" placeholder="smtp.zepto.mail" />
                  </InputGroup>
                  <InputGroup label="Puerto">
                    <input name="zeptoPort" value={settings.zeptoPort} onChange={handleChange} className="form-input" placeholder="587" />
                  </InputGroup>
                  <InputGroup label="Usuario SMTP">
                    <input name="zeptoUser" value={settings.zeptoUser} onChange={handleChange} className="form-input" />
                  </InputGroup>
                  <InputGroup label="Contraseña SMTP">
                    <input type="password" name="zeptoPass" value={settings.zeptoPass} onChange={handleChange} className="form-input" />
                  </InputGroup>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">Mantenimiento de Datos</h4>
                    <p className="text-sm text-gray-600 mb-4">Acciones destructivas para limpiar la caché local de la aplicación.</p>
                    <button className="w-full p-3 bg-red-100 text-red-700 rounded text-left hover:bg-red-200 font-bold text-sm flex items-center gap-2 transition-colors" onClick={() => { if(confirm('¿Estás seguro? Se borrarán todas las cotizaciones locales.')) { localStorage.clear(); window.location.reload(); } }}>
                        Resetear Todos los Datos Locales
                    </button>
                </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}