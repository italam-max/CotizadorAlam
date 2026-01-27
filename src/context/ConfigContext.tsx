import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Definimos la estructura exacta de tu tabla en Supabase
export interface TechnicalRules {
  id?: number;
  max_hydraulic_travel: number;
  max_hydraulic_stops: number;
  hyd_speed_max: number;
  mrl_capacity_limit: number;
  min_pit_std: number;
  min_pit_reduced: number;
  min_overhead_std: number;
}

const DEFAULT_RULES: TechnicalRules = {
  max_hydraulic_travel: 15000,
  max_hydraulic_stops: 5,
  hyd_speed_max: 0.6,
  mrl_capacity_limit: 800,
  min_pit_std: 1200,
  min_pit_reduced: 300,
  min_overhead_std: 3500
};

interface ConfigContextType {
  rules: TechnicalRules;
  loading: boolean;
  updateRule: (key: keyof TechnicalRules, value: number) => Promise<void>;
  reloadRules: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<TechnicalRules>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_rules')
        .select('*')
        .single();
      
      if (data) setRules(data);
      if (error) console.error('Error cargando reglas:', error);
    } catch (e) {
      console.error('Error de conexión:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const updateRule = async (key: keyof TechnicalRules, value: number) => {
    // 1. Actualización optimista (Frontend primero para velocidad)
    const newRules = { ...rules, [key]: value };
    setRules(newRules);

    // 2. Guardado en Base de Datos
    try {
      const { error } = await supabase
        .from('technical_rules')
        .update({ [key]: value })
        .eq('id', 1); // Siempre actualizamos la fila 1 (Singleton)

      if (error) throw error;
    } catch (e) {
      console.error('Error guardando regla:', e);
      // Si falla, revertimos (opcional, por ahora solo notificamos en consola)
      alert('Error al guardar la configuración en la nube.');
    }
  };

  return (
    <ConfigContext.Provider value={{ rules, loading, updateRule, reloadRules: fetchRules }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig debe usarse dentro de ConfigProvider');
  return context;
};