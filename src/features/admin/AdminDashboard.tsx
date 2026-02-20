// ARCHIVO: src/features/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Shield, 
  Search, RefreshCw, Plus, X, Lock, Mail, User, 
  Database, Crown, Headset, Zap, LayoutGrid,
  MoreHorizontal, FileKey
} from 'lucide-react';
import { UserService } from '../../services/userService';
import type { UserProfile } from '../../types';

interface AdminDashboardProps {
  onExit: () => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

// PERFILES CONFIGURADOS (Paleta Ejecutiva)
const PROFILE_TYPES = [
    { 
        id: 'sales', 
        label: 'Ejecutivo Comercial', 
        role: 'user', 
        job: 'Ventas', 
        icon: User, 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },
    { 
        id: 'admin', 
        label: 'Director / Admin', 
        role: 'admin', 
        job: 'Administrador', 
        icon: Crown, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    },
    { 
        id: 'staff', 
        label: 'Soporte Técnico', 
        role: 'user', 
        job: 'Soporte TI', 
        icon: Headset, 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    },
];

export default function AdminDashboard({ onExit, onNotify }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creating, setCreating] = useState(false);
  
  // State: Nuevo Usuario
  const [newUser, setNewUser] = useState({
      email: '',
      password: '',
      fullName: '',
      profileType: 'sales'
  });

  // State: Edición
  const [editForm, setEditForm] = useState<{ fullName: string; profileType: string; newPassword?: string }>({ 
      fullName: '', 
      profileType: 'sales' 
  });

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    if (selectedUser) {
        let currentType = 'sales';
        if (selectedUser.role === 'admin') currentType = 'admin';
        else if (selectedUser.job_title?.toLowerCase().includes('soporte')) currentType = 'staff';

        setEditForm({
            fullName: selectedUser.full_name || '',
            profileType: currentType,
            newPassword: ''
        });
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setLoading(true);
    try {
        const allProfiles = await UserService.getAllProfiles();
        setUsers(allProfiles);
    } catch (error) {
        onNotify('Error de conexión', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if(newUser.password.length < 6) return onNotify('Contraseña insegura (mínimo 6)', 'error');
      
      setCreating(true);
      try {
          const selectedProfile = PROFILE_TYPES.find(p => p.id === newUser.profileType) || PROFILE_TYPES[0];
          await UserService.createUser({
              email: newUser.email,
              password: newUser.password,
              fullName: newUser.fullName,
              jobTitle: selectedProfile.job,
              role: selectedProfile.role
          });
          onNotify('Usuario creado exitosamente', 'success');
          setShowCreateModal(false);
          setNewUser({ email: '', password: '', fullName: '', profileType: 'sales' });
          loadUsers();
      } catch (error: any) {
          onNotify(error.message, 'error');
      } finally {
          setCreating(false);
      }
  };

  const handleUpdateUser = async () => {
      if (!selectedUser) return;
      try {
          const selectedProfile = PROFILE_TYPES.find(p => p.id === editForm.profileType) || PROFILE_TYPES[0];
          await UserService.updateProfile(selectedUser.id, {
              full_name: editForm.fullName,
              job_title: selectedProfile.job
          });
          if (selectedUser.role !== selectedProfile.role) {
              await UserService.updateRole(selectedUser.id, selectedProfile.role as 'admin'|'user');
          }
          onNotify('Perfil actualizado correctamente', 'success');
          loadUsers();
          setSelectedUser(null);
      } catch (error) {
          onNotify('Error en la actualización', 'error');
      }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;
      const success = await UserService.toggleActive(userId, newStatus);
      if (success) {
          setUsers(users.map(u => u.id === userId ? { ...u, active: newStatus } : u));
          if (selectedUser?.id === userId) setSelectedUser({...selectedUser, active: newStatus});
          onNotify(newStatus ? 'Acceso habilitado' : 'Acceso bloqueado', 'success');
      }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    // FONDO: Obsidian Dark (Elegante y Profundo)
    <div className="h-full flex flex-col bg-[#030712] animate-fadeIn overflow-hidden relative text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* Luces Ambientales Profesionales */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[10%] w-[1000px] h-[600px] bg-[#0A2463]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[0%] w-[800px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
          {/* Malla sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* HEADER EJECUTIVO */}
      <div className="px-8 py-5 flex items-center justify-between sticky top-0 z-30 border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#030712]/60">
        <div className="flex items-center gap-6">
            <button 
                onClick={onExit} 
                className="group w-9 h-9 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all duration-300"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform"/>
            </button>
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-indigo-600 to-blue-700 shadow-lg shadow-indigo-500/20">
                        <LayoutGrid size={16} className="text-white"/>
                    </div>
                    <h1 className="text-lg font-semibold text-white tracking-wide">
                        Centro de Control
                    </h1>
                </div>
            </div>
        </div>

        <div className="flex gap-3">
            <div className="h-9 px-4 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                Sistema Operativo
            </div>
            <div className="w-px h-9 bg-white/10 mx-2"></div>
            <button 
                onClick={loadUsers} 
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
                title="Actualizar"
            >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
                onClick={() => setShowCreateModal(true)} 
                className="flex items-center gap-2 px-5 h-9 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
            >
                <Plus size={14} strokeWidth={3}/> Crear Usuario
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto w-full space-y-8">
            
            {/* 1. ESTADÍSTICAS REFINADAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <ProStatCard 
                    icon={Users} 
                    label="Usuarios Activos" 
                    value={users.length} 
                    color="text-blue-400"
                    gradient="from-blue-500/10 to-transparent"
                />
                <ProStatCard 
                    icon={Shield} 
                    label="Administradores" 
                    value={users.filter(u=>u.role==='admin').length} 
                    color="text-amber-400"
                    gradient="from-amber-500/10 to-transparent"
                />
                <ProStatCard 
                    icon={Database} 
                    label="Estado del Sistema" 
                    value="Conectado" 
                    color="text-emerald-400"
                    gradient="from-emerald-500/10 to-transparent"
                />
            </div>

            {/* 2. TABLA PROFESIONAL */}
            <div className="bg-[#0a0a0c]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
                {/* Search Header */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center gap-4">
                    <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                        <Users size={16} className="text-slate-500"/> Directorio
                    </h3>
                    
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors duration-300" size={14}/>
                        <input 
                            type="text" 
                            placeholder="Filtrar por nombre, correo o cargo..." 
                            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-black/40 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-slate-500 font-medium text-[11px] uppercase tracking-wider bg-white/[0.02]">
                            <tr>
                                <th className="p-5 pl-6 font-medium border-b border-white/[0.06]">Identidad</th>
                                <th className="p-5 font-medium border-b border-white/[0.06]">Rol & Permisos</th>
                                <th className="p-5 font-medium border-b border-white/[0.06]">Estado</th>
                                <th className="p-5 text-right pr-6 font-medium border-b border-white/[0.06]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredUsers.map(user => (
                                <tr 
                                    key={user.id} 
                                    onClick={() => setSelectedUser(user)} 
                                    className="hover:bg-white/[0.03] transition-all duration-200 cursor-pointer group"
                                >
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] flex items-center justify-center text-white text-sm font-semibold shadow-inner group-hover:border-white/20 transition-colors">
                                                {user.full_name?.charAt(0) || <User size={16}/>}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium group-hover:text-indigo-300 transition-colors">{user.full_name}</p>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${user.role === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-blue-500/5 border-blue-500/10 text-slate-400'}`}>
                                                {user.role === 'admin' && <Crown size={10}/>}
                                                {user.job_title || (user.role === 'admin' ? 'Super Admin' : 'Usuario')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.active !== false 
                                            ? <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]"></div> Activo</span>
                                            : <span className="text-[11px] text-red-400 font-medium flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_6px_#f87171]"></div> Inactivo</span>
                                        }
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="p-2 rounded-lg hover:bg-white/5 inline-flex text-slate-600 group-hover:text-white transition-colors">
                                            <MoreHorizontal size={16}/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* --- PANEL LATERAL (SLIDE-OVER PRO) --- */}
      {selectedUser && (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500" onClick={() => setSelectedUser(null)}></div>
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0c]/95 border-l border-white/[0.08] shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col backdrop-blur-3xl">
                
                {/* Header Panel */}
                <div className="px-8 pt-8 pb-6 border-b border-white/[0.06] flex justify-between items-start bg-white/[0.01]">
                    <div className="flex gap-5 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-2xl font-light text-white shadow-2xl ring-1 ring-white/5">
                            {selectedUser.full_name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{selectedUser.full_name}</h2>
                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">{selectedUser.job_title || 'Usuario'}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <X size={18}/>
                    </button>
                </div>

                {/* Body Panel */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    
                    {/* Sección 1: Configuración */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileKey size={14}/> Datos de Cuenta
                        </h3>
                        
                        <ProInput 
                            label="Nombre Completo" 
                            value={editForm.fullName} 
                            onChange={v => setEditForm({...editForm, fullName: v})}
                            icon={User}
                        />
                        
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Rol y Permisos</label>
                            <div className="grid gap-3">
                                {PROFILE_TYPES.map((profile) => (
                                    <button
                                        key={profile.id}
                                        onClick={() => setEditForm({...editForm, profileType: profile.id})}
                                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                                            editForm.profileType === profile.id 
                                            ? `bg-white/[0.06] border-white/20 shadow-lg`
                                            : 'bg-transparent border-white/5 text-slate-500 hover:bg-white/[0.02] hover:border-white/10'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg bg-black/40 ${profile.color} border border-white/5`}>
                                            <profile.icon size={18}/>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${editForm.profileType === profile.id ? 'text-white' : 'text-slate-400'}`}>{profile.label}</p>
                                        </div>
                                        {editForm.profileType === profile.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Seguridad */}
                    <div className="space-y-6 pt-6 border-t border-white/5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Lock size={14}/> Acceso y Seguridad
                        </h3>
                        
                        <ProInput 
                            label="Nueva Contraseña" 
                            type="password" 
                            placeholder="••••••" 
                            value={editForm.newPassword || ''}
                            onChange={v => setEditForm({...editForm, newPassword: v})}
                            icon={Lock}
                        />

                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => handleToggleActive(selectedUser.id, selectedUser.active !== false)}
                                className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                                    selectedUser.active !== false
                                    ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                                    : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                            >
                                {selectedUser.active !== false ? 'Desactivar' : 'Activar'}
                            </button>
                            
                            <button 
                                onClick={handleUpdateUser}
                                className="flex-[2] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

      {/* --- MODAL CREAR (Estilo Clean) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#09090b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-slideUp">
                
                <div className="p-8 pb-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div>
                        <h3 className="text-xl font-bold text-white">Nuevo Usuario</h3>
                        <p className="text-xs text-slate-500 mt-1">Ingresa los datos para el alta en sistema.</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"><X size={18}/></button>
                </div>
                
                <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <ProInput label="Nombre" value={newUser.fullName} onChange={v => setNewUser({...newUser, fullName: v})} icon={User} placeholder="Juan Pérez"/>
                        <ProInput label="Email" type="email" value={newUser.email} onChange={v => setNewUser({...newUser, email: v})} icon={Mail} placeholder="email@dominio.com"/>
                        <ProInput label="Contraseña" type="password" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} icon={Lock} placeholder="••••••"/>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Perfil</label>
                        <div className="flex gap-2">
                            {PROFILE_TYPES.map((profile) => (
                                <button
                                    key={profile.id}
                                    type="button"
                                    onClick={() => setNewUser({...newUser, profileType: profile.id})}
                                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border rounded-xl transition-all ${
                                        newUser.profileType === profile.id 
                                        ? 'bg-white text-black border-white shadow-lg' 
                                        : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    {profile.job}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={creating} className="w-full py-4 mt-2 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center gap-2 items-center active:scale-95 disabled:opacity-50">
                        {creating ? <RefreshCw className="animate-spin" size={18}/> : <Zap size={18} fill="black"/>} Crear Usuario
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// --- COMPONENTES VISUALES ---

interface ProInputProps {
    label: string;
    icon: any;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

const ProStatCard = ({ icon: Icon, label, value, color, gradient }: any) => (
    <div className={`relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md flex items-center justify-between group overflow-hidden transition-all hover:bg-white/[0.04]`}>
        {/* Luz Ambiental */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-3xl bg-gradient-to-br ${gradient}`}></div>
        
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-3xl font-light text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white shadow-inner ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const ProInput = ({ label, icon: Icon, type="text", placeholder, value, onChange }: ProInputProps) => (
    <div className="space-y-1.5 group">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 transition-colors group-focus-within:text-white">{label}</label>
        <div className="flex items-center gap-3 bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3.5 transition-all group-focus-within:border-white/30 group-focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Icon size={16} className="text-slate-500 group-focus-within:text-white transition-colors"/>
            <input 
                required 
                type={type} 
                className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder-slate-700" 
                placeholder={placeholder}
                value={value} 
                onChange={e => onChange(e.target.value)}
            />
        </div>
    </div>
);