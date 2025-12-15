// ARCHIVO: src/services/storageService.ts
import type { QuoteData, AppSettings } from '../types';
import { INITIAL_SETTINGS, SEED_QUOTES } from '../data/constants';
import { supabase } from '../supabaseClient';

const DB_KEYS = { SETTINGS: 'alamex_settings_v1' };

// Función auxiliar para convertir keys de camelCase (React) a snake_case (Base de Datos)
// Supabase prefiere snake_case en Postgres, pero tu app usa camelCase.
const mapToDb = (q: QuoteData) => ({
  // No enviamos 'id' si es nuevo, Supabase lo genera
  ...(q.id && typeof q.id === 'number' ? { id: q.id } : {}),
  status: q.status,
  current_stage: q.currentStage,
  client_name: q.clientName,
  client_phone: q.clientPhone,
  client_email: q.clientEmail,
  project_ref: q.projectRef,
  project_date: q.projectDate,
  quantity: q.quantity,
  model: q.model,
  control_group: q.controlGroup,
  capacity: q.capacity,
  persons: q.persons,
  speed: q.speed,
  stops: q.stops,
  travel: q.travel,
  overhead: q.overhead,
  pit: q.pit,
  traction: q.traction,
  entrances: q.entrances,
  shaft_width: q.shaftWidth,
  shaft_depth: q.shaftDepth,
  shaft_type: q.shaftType,
  shaft_construction_req: q.shaftConstructionReq,
  door_type: q.doorType,
  door_width: q.doorWidth,
  door_height: q.doorHeight,
  floor_door_finish: q.floorDoorFinish,
  cabin_model: q.cabinModel,
  cabin_finish: q.cabinFinish,
  cabin_floor: q.cabinFloor,
  handrail_type: q.handrailType,
  lop_model: q.lopModel,
  cop_model: q.copModel,
  floor_nomenclature: q.floorNomenclature,
  norm: q.norm,
  fire_resistance: q.fireResistance,
  cw_governor: q.cwGovernor,
  installation_req: q.installationReq,
  installation_cost: q.installationCost,
  price: q.price,
  materials: q.materials
});

// Función auxiliar inversa: de DB (snake_case) a App (camelCase)
const mapFromDb = (dbItem: any): QuoteData => ({
  id: dbItem.id,
  status: dbItem.status,
  currentStage: dbItem.current_stage || 'ingenieria',
  clientName: dbItem.client_name,
  clientPhone: dbItem.client_phone,
  clientEmail: dbItem.client_email,
  projectRef: dbItem.project_ref,
  projectDate: dbItem.project_date,
  quantity: dbItem.quantity,
  model: dbItem.model,
  controlGroup: dbItem.control_group,
  capacity: dbItem.capacity,
  persons: dbItem.persons,
  speed: dbItem.speed,
  stops: dbItem.stops,
  travel: dbItem.travel,
  overhead: dbItem.overhead,
  pit: dbItem.pit,
  traction: dbItem.traction,
  entrances: dbItem.entrances,
  shaftWidth: dbItem.shaft_width,
  shaftDepth: dbItem.shaft_depth,
  shaftType: dbItem.shaft_type,
  shaftConstructionReq: dbItem.shaft_construction_req,
  doorType: dbItem.door_type,
  doorWidth: dbItem.door_width,
  doorHeight: dbItem.door_height,
  floorDoorFinish: dbItem.floor_door_finish,
  cabinModel: dbItem.cabin_model,
  cabinFinish: dbItem.cabin_finish,
  cabinFloor: dbItem.cabin_floor,
  handrailType: dbItem.handrail_type,
  lopModel: dbItem.lop_model,
  copModel: dbItem.cop_model,
  floorNomenclature: dbItem.floor_nomenclature,
  norm: dbItem.norm,
  fireResistance: dbItem.fire_resistance,
  cwGovernor: dbItem.cw_governor,
  installationReq: dbItem.installation_req,
  installationCost: dbItem.installation_cost,
  price: dbItem.price,
  materials: dbItem.materials
});

export const BackendService = {
  // OBTENER TODAS LAS COTIZACIONES
  getQuotes: async (): Promise<QuoteData[]> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('id', { ascending: false }); // Las más nuevas primero

      if (error) throw error;
      
      // Si la tabla está vacía, podríamos devolver SEED_QUOTES o array vacío.
      // Para producción, mejor array vacío.
      return data ? data.map(mapFromDb) : [];
    } catch (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }
  },

  // GUARDAR (CREAR O ACTUALIZAR)
  saveQuote: async (quote: QuoteData): Promise<QuoteData> => {
    try {
      const dbPayload = mapToDb(quote);
      
      if (quote.id && typeof quote.id === 'number') {
        // ACTUALIZAR EXISTENTE
        const { data, error } = await supabase
          .from('quotes')
          .update(dbPayload)
          .eq('id', quote.id)
          .select()
          .single();
          
        if (error) throw error;
        return mapFromDb(data);
      } else {
        // CREAR NUEVA (borramos el ID temporal si existiera para que Supabase genere uno nuevo)
        const { id, ...payloadWithoutId } = dbPayload; 
        const { data, error } = await supabase
          .from('quotes')
          .insert(payloadWithoutId)
          .select()
          .single();

        if (error) throw error;
        return mapFromDb(data);
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      throw error;
    }
  },

  // BORRAR
  deleteQuote: async (id: number | string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting quote:", error);
    }
  },

  // ACTUALIZAR STATUS (Optimizado para solo enviar ese campo)
  updateQuoteStatus: async (id: number | string, status: QuoteData['status']) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: status })
        .eq('id', id);
        
      if (error) throw error;
      // Retornamos todas para refrescar la lista (o podrías optimizar el estado local)
      return BackendService.getQuotes();
    } catch (error) {
      console.error("Error updating status:", error);
      return [];
    }
  },

  // La configuración de la app (Whapi tokens, etc.) sigue siendo local por ahora
  // O puedes crear una tabla 'settings' en Supabase si quieres compartirla.
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(DB_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  },
  
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
  }
};