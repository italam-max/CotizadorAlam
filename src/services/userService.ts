// ARCHIVO: src/services/userService.ts
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../types';

export const UserService = {
  // 1. Obtener perfil individual
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  // 2. Actualizar perfil propio
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    return data;
  },

  // --- FUNCIONES DE ADMINISTRACIÓN ---

  // 3. Obtener TODOS los usuarios
  getAllProfiles: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
    return data as UserProfile[];
  },

  // 4. Cambiar Rol (Admin/User)
  updateRole: async (userId: string, role: 'admin' | 'user'): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return false;
    }
    return true;
  },

  // 5. Banear/Activar usuario
  toggleActive: async (userId: string, active: boolean): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .update({ active })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling active status:', error);
      return false;
    }
    return true;
  },

  // 6. Crear Usuario Nuevo (Usando Supabase Edge Functions)
  createUser: async (userData: { email: string; password: string; fullName: string; jobTitle: string; role: string }) => {
    try {
      // Llamada directa a la nube de Supabase
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData
      });

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      return data;
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      throw new Error(error.message || 'Error al conectar con el servidor');
    }
  }
};