// ARCHIVO: src/features/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Shield, Ban, CheckCircle, 
  Search, RefreshCw, MessageCircle, Send, AlertTriangle,
  Plus, X, Save, Lock, Mail, User, Briefcase
} from 'lucide-react';
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
  
  // Estados para WhatsApp
  const [testPhone, setTestPhone] = useState('');
  const [sendingWa, setSendingWa] = useState(false);

  // --- NUEVOS ESTADOS PARA CREAR USUARIO ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
      email: '',
      password: '',
      fullName: '',
      jobTitle: '',
      role: 'user'
  });

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

  // --- LÓGICA DE CREACIÓN DE USUARIO ---
  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if(newUser.password.length < 6) return onNotify('La contraseña debe tener 6 caracteres', 'error');
      
      setCreating(true);
      try {
          await UserService.createUser(newUser);
          onNotify('Usuario creado exitosamente', 'success');
          setShowCreateModal(false);
          setNewUser({ email: '', password: '', fullName: '', jobTitle: '', role: 'user' }); // Reset
          loadUsers(); // Recargar lista
      } catch (error: any) {
          onNotify(error.message, 'error');
      } finally {
          setCreating(false);
      }
  };

  // ... (Tus funciones existentes handleRoleChange, handleToggleActive, handleTestWhatsapp se mantienen igual)
  const handleRoleChange = async (userId: string, currentRole: string) => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      if (!confirm(`¿Cambiar rol a ${newRole.toUpperCase()}?`)) return;
      const success = await UserService.updateRole(userId, newRole as 'admin'|'user');
      if (success) {
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin'|'user' } : u));
          onNotify(`Rol actualizado`, 'success');
      }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;
      const success = await UserService.toggleActive(userId, newStatus);
      if (success) {
          setUsers(users.map(u => u.id === userId ? { ...u, active: newStatus } : u));
          onNotify(`Usuario ${newStatus ? 'activado' : 'baneado'}`, 'success');
      }
  };

  const handleTestWhatsapp = async () => {
      if (!testPhone) return alert("Escribe un número");
      setSendingWa(true);
      try {
          await WhatsappService.sendMessage(WhatsappService.formatPhone(testPhone), "🔔 Prueba de conexión Alamex.");
          onNotify("Mensaje enviado", 'success');
          setTestPhone(''); 
      } catch (error: any) {
          onNotify(`Error: ${error.message}`, 'error');
      } finally {
          setSendingWa(false);
      }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.job_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn overflow-auto relative">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-black flex items-center gap-2">
                    <Shield className="text-red-500"/> Panel TI
                </h1>
                <p className="text-slate-400 text-sm">Administración del Sistema</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={loadUsers} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Recargar">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            {/* BOTÓN NUEVO USUARIO */}
            <button 
                onClick={() => setShowCreateModal(true)} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-lg hover:shadow-blue-500/20"
            >
                <Plus size={20} /> Nuevo Usuario
            </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        
        {/* KPIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard icon={<Users/>} label="Total Usuarios" value={users.length} color="blue" />
            <KpiCard icon={<Shield/>} label="Administradores" value={users.filter(u=>u.role==='admin').length} color="green" />
            <KpiCard icon={<Ban/>} label="Inactivos" value={users.filter(u=>!u.active).length} color="red" />
        </div>

        {/* INTEGRACIONES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-lg">
                <MessageCircle className="text-green-600"/> Test Whapi
            </h3>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    placeholder="521..." 
                    className="form-input flex-1"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                />
                <button 
                    onClick={handleTestWhatsapp}
                    disabled={sendingWa}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                    <Send size={18} className={sendingWa ? 'animate-ping' : ''} /> Probar
                </button>
            </div>
        </div>

        {/* TABLA USUARIOS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <Search size={18} className="text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar usuario..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
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
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.full_name}</p>
                                            <p className="text-xs text-slate-500">{user.job_title || 'Sin cargo'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4"><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{user.role}</span></td>
                                <td className="p-4">
                                    {user.active !== false 
                                        ? <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> Activo</span>
                                        : <span className="text-red-600 font-bold text-xs flex items-center gap-1"><Ban size={12}/> Baneado</span>
                                    }
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleRoleChange(user.id, user.role||'user')} className="text-blue-600 hover:underline text-xs font-bold">Rol</button>
                                    <button onClick={() => handleToggleActive(user.id, user.active !== false)} className="text-red-600 hover:underline text-xs font-bold">
                                        {user.active !== false ? 'Banear' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* --- MODAL PARA CREAR USUARIO --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Plus/> Nuevo Usuario</h3>
                    <button onClick={() => setShowCreateModal(false)} className="hover:bg-white/20 p-1 rounded transition"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50">
                            <User size={18} className="text-slate-400"/>
                            <input required className="bg-transparent outline-none w-full text-sm" placeholder="Ej: Juan Pérez"
                                value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50">
                            <Mail size={18} className="text-slate-400"/>
                            <input required type="email" className="bg-transparent outline-none w-full text-sm" placeholder="juan@alamex.mx"
                                value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Cargo / Puesto</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50">
                            <Briefcase size={18} className="text-slate-400"/>
                            <input required className="bg-transparent outline-none w-full text-sm" placeholder="Ej: Ventas Jr."
                                value={newUser.jobTitle} onChange={e => setNewUser({...newUser, jobTitle: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50">
                                <Lock size={18} className="text-slate-400"/>
                                <input required type="password" className="bg-transparent outline-none w-full text-sm" placeholder="******"
                                    value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Rol</label>
                            <select className="w-full border rounded-lg px-3 py-2 bg-slate-50 text-sm outline-none"
                                value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                            >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 border rounded-lg font-bold text-slate-500 hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={creating} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg disabled:opacity-50 flex justify-center gap-2">
                            {creating ? <RefreshCw className="animate-spin"/> : <Save size={18}/>} Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// Componente visual pequeño
const KpiCard = ({ icon, label, value, color }: any) => {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        red: 'text-red-600 bg-red-50'
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    );
};