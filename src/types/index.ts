// ARCHIVO: src/types/index.ts

export type ElevatorModelId = 'MR' | 'MRL-L' | 'MRL-G' | 'HYD' | 'PLAT' | 'CAR';

export interface QuoteData {
  id: number | string;
  
  // Estatus ampliado
  status: 'Borrador' | 'Sincronizado' | 'Enviada' | 'Por Seguimiento' | 'Aprobada' | 'Rechazada';
  
  currentStage?: string;
  updated_at?: string; // <--- NUEVO CAMPO
  
  // 1. Contacto & Proyecto
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectRef: string;
  projectDate: string;
  
  // Campos opcionales
  contactEmail?: string; 
  type?: string;         
  machineType?: string;  
  currency?: 'MXN' | 'USD'; 

  // 2. Especificaciones Básicas
  quantity: number;
  model: ElevatorModelId;
  controlGroup: string;
  capacity: number;
  persons: number;
  speed: string;
  stops: number;
  travel: number;
  overhead: number;
  pit: number;
  traction: string;
  
  // 3. Cubo & Entradas
  entrances: string;
  shaftWidth: number;
  shaftDepth: number;
  shaftType: string;
  shaftConstructionReq: string;
  
  // 4. Puertas
  doorType: string;
  doorWidth: number;
  doorHeight: number;
  floorDoorFinish: string;
  
  // 5. Cabina & Acabados
  cabinModel: string;
  cabinFinish: string;
  cabinFloor: string;
  handrailType: string;
  lopModel: string;
  copModel: string;
  floorNomenclature: string;
  
  // 6. Normas & Seguridad
  norm: string;
  fireResistance: string;
  cwGovernor: string;
  installationReq: string;

  // 7. Costos
  installationCost?: number;
  
  // Datos Internos
  user_id?: string;

  // Campos calculados
  materials?: any; 
  price?: number; 
}

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

export interface UserProfile {
  id: string;
  full_name: string | null;
  job_title: string | null;
  department: string | null;
  avatar_url: string | null;
  role?: 'admin' | 'user'; 
  active?: boolean;        
}