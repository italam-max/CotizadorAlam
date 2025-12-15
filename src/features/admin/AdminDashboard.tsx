// ARCHIVO: src/features/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Shield, Users, Activity, FileText, DollarSign, 
  Trash2, UserCheck, BarChart3, ArrowLeft // <--- Agregamos ArrowLeft
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import type { UserProfile, QuoteData } from '../../types';

// Definimos que este componente espera recibir una función 'onExit'
interface AdminDashboardProps {
  onExit: () => void;
}

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*');

      if (profilesData) setUsers(profilesData);
      if (quotesData) setQuotes(quotesData as any);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalUsers = users.length;
  const totalQuotes = quotes.length;
  const totalSent = quotes.filter(q => q.status === 'Enviada').length;
  const totalValue = quotes.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);

  const getUserStats = (userId: string) => {
    const userQuotes = quotes.filter(q => (q as any).user_id === userId);
    return {
      count: userQuotes.length,
      sent: userQuotes.filter(q => q.status === 'Enviada').length,
    };
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if(confirm(`¿Deseas ${currentStatus ? 'desactivar' : 'activar'} a este usuario?`)) {
        await supabase.from('profiles').update({ active: !currentStatus }).eq('id', userId);
        setUsers(users.map(u => u.id === userId ? {...u, active: !currentStatus} : u));
    }
  }

  if (loading) return (
    <div className="min-h-full flex flex-col items-center justify-center p-10">
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
            {/* Indicador visual */}
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-red-200">
                <Activity size={16}/> Modo Super-Admin
            </div>
            
            {/* --- BOTÓN DE SALIDA NUEVO --- */}
            <button 
                onClick={onExit}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
                <ArrowLeft size={16}/> Volver al App
            </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* ... (Las tarjetas siguen igual que antes, solo las resumo para ahorrar espacio) ... */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div><p className="text-xs font-bold text-slate-400 uppercase">Usuarios</p><h3 className="text-3xl font-black text-slate-800 mt-1">{totalUsers}</h3></div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div><p className="text-xs font-bold text-slate-400 uppercase">Cotizaciones</p><h3 className="text-3xl font-black text-slate-800 mt-1">{totalQuotes}</h3></div>
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><FileText size={24}/></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div><p className="text-xs font-bold text-slate-400 uppercase">Efectividad</p><h3 className="text-3xl font-black text-slate-800 mt-1">{((totalSent / totalQuotes) * 100 || 0).toFixed(0)}%</h3></div>
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><BarChart3 size={24}/></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div><p className="text-xs font-bold text-slate-400 uppercase">Pipeline Est.</p><h3 className="text-2xl font-black text-slate-800 mt-1">${(totalValue/1000000).toFixed(1)}M</h3></div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><DollarSign size={24}/></div>
            </div>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-blue-600"/> Directorio
            </h3>
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
                    {users.map(user => {
                        const stats = getUserStats(user.id);
                        return (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                            {user.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.full_name || 'Sin nombre'}</p>
                                            <p className="text-[10px] text-slate-500">{user.job_title}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-700">{stats.count}</td>
                                <td className="px-6 py-4 text-right">
                                     <span className={`text-xs font-bold ${user.active !== false ? 'text-green-600' : 'text-slate-400'}`}>
                                        {user.active !== false ? 'Activo' : 'Inactivo'}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => toggleUserStatus(user.id, user.active !== false)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                        {user.active !== false ? <Trash2 size={16}/> : <UserCheck size={16}/>}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}