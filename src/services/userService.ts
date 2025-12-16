// ARCHIVO: src/services/userService.ts
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../types';

export const UserService = {
  // 1. Obtener perfil individual (Ya lo tenías)
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

  // 2. Actualizar perfil propio (Ya lo tenías)
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

  // --- NUEVAS FUNCIONES PARA EL ADMIN PANEL ---

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
  }
};