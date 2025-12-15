// ARCHIVO: src/features/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Shield, Users, Activity, FileText, DollarSign, 
  Trash2, UserCheck, UserX, BarChart3, ArrowLeft,
  UserPlus, X, Save, Loader2
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import type { UserProfile, QuoteData } from '../../types';
import { InputGroup } from '../../components/ui/InputGroup';

interface AdminDashboardProps {
  onExit: () => void;
}

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Crear Usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', jobTitle: '', role: 'user' });

  // Función para recargar datos
  const refreshData = async () => {
      // Nota: Aquí asumimos que tienes políticas RLS que permiten al admin ver todo
      const { data: profilesData } = await supabase.from('profiles').select('*').order('full_name');
      const { data: quotesData } = await supabase.from('quotes').select('*');
      
      if (profilesData) setUsers(profilesData);
      if (quotesData) setQuotes(quotesData as any);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- LÓGICA PARA CREAR USUARIO ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al crear usuario');

      alert(`Usuario ${newUser.fullName} creado exitosamente.`);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', fullName: '', jobTitle: '', role: 'user' }); 
      await refreshData(); 

    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  // --- LÓGICA MEJORADA PARA CAMBIAR ESTADO (ARCHIVAR/REACTIVAR) ---
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    // 1. Definir qué acción estamos haciendo para el mensaje
    const action = currentStatus ? 'desactivar (archivar)' : 'reactivar';
    
    // 2. Confirmación explícita
    if(!confirm(`¿Estás seguro de que deseas ${action} a este usuario? \n\n${currentStatus ? 'No podrá acceder al sistema, pero sus cotizaciones se conservarán.' : 'El usuario podrá volver a entrar con su contraseña actual.'}`)) {
        return; // Si dice que no, cancelamos
    }

    // 3. Intento de actualización en Base de Datos
    const { error } = await supabase
        .from('profiles')
        .update({ active: !currentStatus })
        .eq('id', userId);

    // 4. Manejo de respuesta
    if (error) {
        console.error("Error BD:", error);
        alert("No se pudo actualizar el estado. Verifica que tengas permisos de Admin en la base de datos.");
    } else {
        // Solo si la BD respondió OK, actualizamos la vista local
        setUsers(users.map(u => u.id === userId ? {...u, active: !currentStatus} : u));
    }
  };


  // --- CÁLCULOS DE ESTADÍSTICAS ---
  const totalUsers = users.length;
  const totalQuotes = quotes.length;
  const totalSent = quotes.filter(q => q.status === 'Enviada').length;
  const totalValue = quotes.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);

  const getUserStats = (userId: string) => {
    const userQuotes = quotes.filter(q => (q as any).user_id === userId);
    return { count: userQuotes.length, sent: userQuotes.filter(q => q.status === 'Enviada').length };
  };


  if (loading) return (
    <div className="min-h-full flex flex-col items-center justify-center p-10">
        <Loader2 className="animate-spin mb-4 text-blue-900" size={32}/>
        <p className="animate-pulse font-bold text-slate-400">Cargando datos confidenciales...</p>
    </div>
  );

  return (
    <div className="p-8 animate-fadeIn h-full flex flex-col overflow-auto bg-slate-50 relative">
      <div className="mb-8 border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Shield className="text-red-600" size={32} /> Portal de Administración TI
          </h2>
          <p className="text-slate-500 mt-1">Gestión de usuarios, permisos y métricas globales.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-red-200">
                <Activity size={16}/> Modo Super-Admin
            </div>
            <button onClick={onExit} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
                <ArrowLeft size={16}/> Volver al App
            </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Usuarios</p><h3 className="text-3xl font-black text-slate-800">{totalUsers}</h3></div><Users className="text-blue-600"/></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Cotizaciones</p><h3 className="text-3xl font-black text-slate-800">{totalQuotes}</h3></div><FileText className="text-yellow-600"/></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Enviadas</p><h3 className="text-3xl font-black text-slate-800">{totalSent}</h3></div><BarChart3 className="text-green-600"/></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Valor Pipeline</p><h3 className="text-2xl font-black text-slate-800">${(totalValue/1000000).toFixed(1)}M</h3></div><DollarSign className="text-purple-600"/></div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-blue-600"/> Directorio</h3>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                <UserPlus size={16} /> Crear Nuevo Usuario
            </button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4 text-center">Cots.</th>
                        <th className="px-6 py-4 text-right">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                        <tr key={user.id} className={`transition-colors ${user.active === false ? 'bg-gray-50' : 'hover:bg-slate-50'}`}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.active === false ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className={`font-bold ${user.active === false ? 'text-gray-400 line-through' : 'text-slate-800'}`}>
                                            {user.full_name || 'Sin nombre'}
                                        </p>
                                        <p className="text-[10px] text-slate-500">{user.job_title}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{user.role || 'user'}</span></td>
                            <td className="px-6 py-4 text-center font-bold text-slate-700">{getUserStats(user.id).count}</td>
                            
                            {/* Estado con color */}
                            <td className="px-6 py-4 text-right">
                                <span className={`text-xs font-bold flex justify-end items-center gap-1 ${user.active !== false ? 'text-green-600' : 'text-red-400'}`}>
                                    {user.active !== false ? <UserCheck size={14}/> : <UserX size={14}/>}
                                    {user.active !== false ? 'Activo' : 'Archivado'}
                                </span>
                            </td>

                            {/* Botón de Acción Mejorado */}
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => toggleUserStatus(user.id, user.active !== false)} 
                                    className={`p-2 rounded transition-colors ${
                                        user.active !== false 
                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                                        : 'text-red-500 bg-red-50 hover:bg-green-100 hover:text-green-600'
                                    }`}
                                    title={user.active !== false ? "Archivar Usuario" : "Reactivar Usuario"}
                                >
                                    {user.active !== false ? <Trash2 size={16}/> : <UserCheck size={16}/>}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL DE CREACIÓN DE USUARIO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2"><UserPlus size={20}/> Alta de Usuario</h3>
                    <button onClick={() => setShowCreateModal(false)}><X size={20} className="hover:text-red-400"/></button>
                </div>
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Nombre Completo">
                            <input required value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="form-input" placeholder="Ej. Juan Pérez" />
                        </InputGroup>
                        <InputGroup label="Cargo / Puesto">
                            <input required value={newUser.job_title} onChange={e => setNewUser({...newUser, jobTitle: e.target.value})} className="form-input" placeholder="Ej. Ventas" />
                        </InputGroup>
                    </div>
                    <InputGroup label="Correo Electrónico (Login)">
                        <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="form-input" placeholder="usuario@alamex.mx" />
                    </InputGroup>
                    <InputGroup label="Contraseña Temporal">
                        <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="form-input" placeholder="Mínimo 6 caracteres" minLength={6} />
                    </InputGroup>
                    <InputGroup label="Nivel de Acceso">
                        <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option value="user">Usuario (Vendedor)</option>
                            <option value="admin">Administrador TI</option>
                        </select>
                    </InputGroup>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancelar</button>
                        <button type="submit" disabled={creating} className="flex-1 btn-primary bg-slate-900 hover:bg-slate-800 flex justify-center items-center gap-2">
                            {creating ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Crear Usuario</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}