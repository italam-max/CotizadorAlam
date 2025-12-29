// ARCHIVO: src/types.ts

// --- 1. ENUMS Y TIPOS SIMPLES ---
export type ElevatorModelId = 'MR' | 'MRL-L' | 'MRL-G' | 'HYD' | 'PLAT' | 'CAR';

// --- 2. INTERFACES AUXILIARES ---

// Perfil de Usuario (Supabase)
export interface UserProfile {
  id: string;
  email?: string;
  full_name: string | null;
  job_title: string | null;
  department?: string | null;
  avatar_url: string | null;
  role?: 'admin' | 'user';
  active?: boolean;
}

// Condiciones Comerciales (Para el contrato)
export interface CommercialTerms {
  paymentMethod: string;
  deliveryTime: string;
  warranty: string;
  validity: string;
  currency: string;
  generalConditions: string;
}

// Configuración de la App (Faltaba exportar esto)
export interface AppSettings {
  companyName?: string;
  ivaRate?: number;
  currency?: 'MXN' | 'USD';
  adminEmail?: string;
  whapiToken: string;
  whapiUrl: string;
  odooUrl: string;
  odooDb: string;
  odooUser: string;
  odooKey: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  zeptoHost?: string;
  zeptoPort?: string;
  zeptoUser?: string;
  zeptoPass?: string;
}

// Fases del Proyecto (Faltaba exportar esto)
export interface ProjectPhase {
  id: string;
  name: string;
  baseDuration: number;
  color: string;
  isVariable?: boolean;
  duration?: number;
  finalDuration?: number;
  startStr?: string;
  endStr?: string;
  startWeeks?: number;
  endWeeks?: number;
}

// --- 3. INTERFAZ PRINCIPAL: QuoteData ---
export interface QuoteData {
  id: number | string;
  
  // Estatus
  status: 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada' | 'Sincronizado' | 'Por Seguimiento';
  
  // Fase actual (Corregido a string para aceptar 'Ingeniería', 'Manufactura', etc.)
  currentStage?: string; 
  updated_at?: string;
  user_id?: string;

  // --- 1. GENERALES ---
  projectRef: string;
  clientName: string;
  projectDate: string;
  
  // Campos de contacto (Unificados para compatibilidad)
  clientPhone: string;    // Requerido por constants.ts
  clientEmail: string;    // Requerido por constants.ts
  contactEmail?: string;  // Usado en ManualQuoter
  contactPhone?: string;  // Usado en ManualQuoter

  // --- 2. MÁQUINA Y DESEMPEÑO ---
  model: string | ElevatorModelId; // Permite string general o el tipo específico
  quantity: number;
  capacity: number;
  persons: number;
  speed: number | string;
  price: number;
  currency?: 'MXN' | 'USD';
  
  // Opcionales técnicos
  traction?: string;
  controlGroup?: string;
  type?: string;
  machineType?: string;

  // --- 3. CUBO Y RECORRIDO ---
  stops: number;
  travel: number;
  overhead: number;
  pit: number;
  
  // Dimensiones y Tipo de Cubo
  shaftWidth: number;
  shaftDepth: number;
  shaftType: string;
  entrances?: string; // Ej: 'Simple', 'Doble'
  
  // Obra Civil (Compatibilidad entre componentes)
  shaftConstructionReq?: string; // Usado en constants.ts ('Sí'/'No')
  constructionReq?: boolean;     // Usado en SelectionAssistant

  // --- 4. PUERTAS Y CABINA ---
  doorType: string;
  doorWidth: number;
  doorHeight: number;
  
  // Acabados
  floorDoorFinish?: string; // constants.ts
  doorFinish?: string;      // ManualQuoter
  
  cabinModel?: string;
  cabinFinish?: string;
  cabinFloor?: string;
  
  // --- 5. COMPONENTES Y ACCESORIOS ---
  handrailType?: string;
  handrail?: string;
  
  lopModel?: string;
  copModel?: string;
  lop?: string;
  cop?: string;
  
  floorNomenclature?: string;
  nomenclature?: string;

  // --- 6. NORMATIVA Y SEGURIDAD ---
  norm: string;
  cwGovernor?: string;
  counterweightPos?: string;
  
  // Fuego (Compatibilidad string/boolean)
  fireResistance: string; // constants.ts usa string
  fireRating?: boolean;   // ManualQuoter usa boolean

  // Instalación (Compatibilidad string/boolean)
  installationReq: string; // constants.ts usa string
  installation?: boolean;  // ManualQuoter usa boolean
  installationCost?: number;

  // --- 7. EXTRAS ---
  materials?: any; 
  commercialTerms?: CommercialTerms;
}