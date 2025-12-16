// ARCHIVO: src/features/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Shield, Ban, CheckCircle, 
  Search, RefreshCw, Mail, MessageCircle, Send, AlertTriangle
} from 'lucide-react';
// 1. ELIMINAMOS EL IMPORT DE SUPABASE QUE NO SE USA
import { UserService } from '../../services/userService';
import { WhatsappService } from '../../services/whatsappService';
import type { UserProfile } from '../../types';

interface AdminDashboardProps {
  onExit: () => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export default function AdminDashboard({ onExit, onNotify }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para prueba de WhatsApp
  const [testPhone, setTestPhone] = useState('');
  const [sendingWa, setSendingWa] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
        const allProfiles = await UserService.getAllProfiles();
        setUsers(allProfiles);
    } catch (error) {
        console.error(error);
        onNotify('Error cargando usuarios', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      if (!confirm(`¿Cambiar rol de usuario a ${newRole.toUpperCase()}?`)) return;

      const success = await UserService.updateRole(userId, newRole as 'admin'|'user');
      if (success) {
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin'|'user' } : u));
          onNotify(`Rol actualizado a ${newRole}`, 'success');
      } else {
          onNotify('Error al actualizar rol', 'error');
      }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;
      const action = newStatus ? 'Reactivar' : 'Banear';
      
      if (!confirm(`¿Estás seguro de ${action} a este usuario?`)) return;

      const success = await UserService.toggleActive(userId, newStatus);
      if (success) {
          setUsers(users.map(u => u.id === userId ? { ...u, active: newStatus } : u));
          onNotify(`Usuario ${newStatus ? 'activado' : 'baneado'}`, 'success');
      } else {
          onNotify('Error al cambiar estatus', 'error');
      }
  };

  // --- FUNCIÓN DE PRUEBA DE WHATSAPP ---
  const handleTestWhatsapp = async () => {
      if (!testPhone) return alert("Por favor escribe un número telefónico (Ej: 52155...)");
      
      setSendingWa(true);
      try {
          // Limpiamos el número
          const cleanPhone = WhatsappService.formatPhone(testPhone);
          const msg = "🔔 Hola! Esta es una prueba de conexión exitosa desde el Sistema de Cotización Alamex.";
          
          await WhatsappService.sendMessage(cleanPhone, msg);
          
          onNotify("✅ Mensaje enviado con éxito a Whapi", 'success');
          setTestPhone(''); 
      } catch (error: any) {
          console.error("Error Whapi:", error);
          onNotify(`Error de envío: ${error.message}`, 'error');
      } finally {
          setSendingWa(false);
      }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn overflow-auto">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Shield className="text-red-500"/> Panel de Administración TI
                    </h1>
                    <p className="text-slate-400 text-sm">Gestión de Accesos y Servicios</p>
                </div>
            </div>
            <button onClick={loadUsers} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-colors text-sm">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Actualizar Lista
            </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        
        {/* KPIS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase">Total Usuarios</p><h3 className="text-2xl font-black">{users.length}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Shield size={24}/></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase">Admins</p><h3 className="text-2xl font-black">{users.filter(u=>u.role==='admin').length}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Ban size={24}/></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase">Inactivos</p><h3 className="text-2xl font-black">{users.filter(u=>!u.active).length}</h3></div>
            </div>
        </div>

        {/* --- SECCIÓN DE INTEGRACIONES (WHATSAPP) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-lg">
                <MessageCircle className="text-green-600"/> Integración Whapi (WhatsApp)
            </h3>
            <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Número de Prueba (con código de país)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ej: 5215512345678" 
                            className="form-input pl-10"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                        />
                        <MessageCircle className="absolute left-3 top-3 text-slate-400" size={18}/>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <AlertTriangle size={10}/> Asegúrate de haber guardado tu Token en Ajustes {'>'} Integraciones.
                    </p>
                </div>
                <button 
                    onClick={handleTestWhatsapp}
                    disabled={sendingWa}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all active:scale-95 w-full md:w-auto justify-center"
                >
                    <Send size={18} className={sendingWa ? 'animate-ping' : ''} /> 
                    {sendingWa ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
                </button>
            </div>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <Search size={18} className="text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar usuario por nombre o departamento..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-600 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Estatus</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Cargando usuarios...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">No se encontraron usuarios</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">
                                                {user.full_name ? user.full_name.charAt(0) : <Mail size={16}/>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.full_name || 'Sin nombre'}</p>
                                                <p className="text-xs text-slate-500">{user.job_title || 'Sin cargo'} • {user.department || 'General'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex w-fit items-center gap-1 ${user.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.active !== false ? <CheckCircle size={12}/> : <Ban size={12}/>}
                                            {user.active !== false ? 'Activo' : 'Baneado'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                            onClick={() => handleRoleChange(user.id, user.role || 'user')}
                                            className="px-3 py-1 text-xs font-bold border rounded hover:bg-slate-100 transition-colors"
                                        >
                                            Cambiar Rol
                                        </button>
                                        <button 
                                            onClick={() => handleToggleActive(user.id, user.active !== false)}
                                            className={`px-3 py-1 text-xs font-bold border rounded transition-colors ${
                                                user.active !== false 
                                                ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                                : 'border-green-200 text-green-600 hover:bg-green-50'
                                            }`}
                                        >
                                            {user.active !== false ? 'Banear' : 'Reactivar'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}