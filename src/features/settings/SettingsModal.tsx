// ARCHIVO: src/features/settings/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, Save, Building, Globe, Mail, 
  MessageCircle, Server, DollarSign, Database
} from 'lucide-react';
import { INITIAL_SETTINGS } from '../../data/constants';
import type { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'email'>('general');

  // Cargar configuración al abrir
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('appSettings');
      if (stored) {
        try {
            // Fusionamos con INITIAL_SETTINGS para asegurar que existan los campos nuevos (como whapiUrl)
            const parsed = JSON.parse(stored);
            setSettings({ ...INITIAL_SETTINGS, ...parsed });
        } catch (e) {
            setSettings(INITIAL_SETTINGS);
        }
      } else {
        setSettings(INITIAL_SETTINGS);
      }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end transition-opacity animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slideLeft">
        
        {/* HEADER */}
        <div className="bg-blue-900 text-white p-6 flex justify-between items-center shrink-0">
           <div>
              <h2 className="text-xl font-black">Configuración</h2>
              <p className="text-blue-200 text-xs">Sistema de Cotización Alamex</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
           </button>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex border-b border-slate-200 shrink-0">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center gap-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Building size={16}/> General
            </button>
            <button 
                onClick={() => setActiveTab('api')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center gap-2 ${activeTab === 'api' ? 'border-green-600 text-green-800 bg-green-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Globe size={16}/> APIs
            </button>
            <button 
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center gap-2 ${activeTab === 'email' ? 'border-purple-600 text-purple-800 bg-purple-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Mail size={16}/> Correo
            </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* --- TAB GENERAL --- */}
            {activeTab === 'general' && (
                <div className="space-y-5 animate-fadeIn">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Empresa</label>
                        <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-100 transition-all">
                            <Building size={18} className="text-slate-400"/>
                            <input name="companyName" value={settings.companyName} onChange={handleChange} className="w-full outline-none text-sm font-medium" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">IVA (Decimal)</label>
                            <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
                                <span className="font-bold text-slate-400">%</span>
                                <input name="ivaRate" type="number" step="0.01" value={settings.ivaRate} onChange={handleChange} className="w-full outline-none text-sm font-medium" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Moneda Base</label>
                            <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
                                <DollarSign size={18} className="text-slate-400"/>
                                <select name="currency" value={settings.currency} onChange={handleChange} className="w-full outline-none text-sm font-medium bg-transparent">
                                    <option value="MXN">MXN - Pesos</option>
                                    <option value="USD">USD - Dólares</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Administrativo</label>
                        <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
                            <Mail size={18} className="text-slate-400"/>
                            <input name="adminEmail" value={settings.adminEmail} onChange={handleChange} className="w-full outline-none text-sm font-medium" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB INTEGRACIONES (APIS) --- */}
            {activeTab === 'api' && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* WHATSAPP / WHAPI */}
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-green-800 text-sm flex items-center gap-2 border-b border-green-200 pb-2">
                            <MessageCircle size={18}/> WhatsApp Gateway (Whapi)
                        </h4>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-green-700 uppercase">API Endpoint URL</label>
                            <input 
                                type="text" 
                                name="whapiUrl"
                                value={settings.whapiUrl}
                                onChange={handleChange}
                                placeholder="Ej: https://gate.whapi.cloud/messages/text"
                                className="w-full p-2 border border-green-200 rounded text-sm focus:border-green-500 outline-none"
                            />
                            <p className="text-[10px] text-green-600/70">La URL base de tu instancia de Whapi.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-green-700 uppercase">API Token</label>
                            <input 
                                type="password" 
                                name="whapiToken"
                                value={settings.whapiToken}
                                onChange={handleChange}
                                placeholder="Pegar token aquí..."
                                className="w-full p-2 border border-green-200 rounded text-sm focus:border-green-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* ODOO ERP */}
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 shadow-sm space-y-4">
                         <h4 className="font-bold text-purple-800 text-sm flex items-center gap-2 border-b border-purple-200 pb-2">
                            <Database size={18}/> Odoo ERP
                        </h4>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-purple-700 uppercase">URL Servidor</label>
                            <input name="odooUrl" value={settings.odooUrl} onChange={handleChange} className="form-input text-xs" placeholder="https://odoo.alamex.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-purple-700 uppercase">Base de Datos</label>
                                <input name="odooDb" value={settings.odooDb} onChange={handleChange} className="form-input text-xs" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-purple-700 uppercase">Usuario</label>
                                <input name="odooUser" value={settings.odooUser} onChange={handleChange} className="form-input text-xs" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-purple-700 uppercase">API Key / Contraseña</label>
                            <input type="password" name="odooKey" value={settings.odooKey} onChange={handleChange} className="form-input text-xs" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB EMAIL --- */}
            {activeTab === 'email' && (
                <div className="space-y-6 animate-fadeIn">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                            <Server size={18}/> SMTP / ZeptoMail
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Host</label>
                                <input name="smtpHost" value={settings.smtpHost} onChange={handleChange} className="form-input text-xs" placeholder="smtp.zeptomail.com" />
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Puerto</label>
                                <input name="smtpPort" type="number" value={settings.smtpPort} onChange={handleChange} className="form-input text-xs" placeholder="587" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Usuario SMTP</label>
                            <input name="smtpUser" value={settings.smtpUser} onChange={handleChange} className="form-input text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Contraseña</label>
                            <input type="password" name="smtpPass" value={settings.smtpPass} onChange={handleChange} className="form-input text-xs" />
                        </div>
                     </div>
                </div>
            )}

        </div>

        {/* FOOTER ACCIONES */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-4 shrink-0">
            <button 
                onClick={onClose}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
                <Save size={18}/> Guardar Cambios
            </button>
        </div>

      </div>
    </div>
  );
}