// ARCHIVO: src/types/index.ts

export type ElevatorModelId = 'MR' | 'MRL-L' | 'MRL-G' | 'HYD' | 'PLAT' | 'CAR';

export interface QuoteData {
  id: number | string;
  // Mantenemos tus estatus originales
  status: 'Borrador' | 'Sincronizado' | 'Enviada' | 'Por Seguimiento';
  currentStage?: string;
  
  // 1. Contacto & Proyecto
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectRef: string;
  projectDate: string;
  
  // --- AGREGADO PARA CORREGIR ERROR DE PDF ---
  contactEmail?: string; // El PDF busca esto, puede ser igual a clientEmail
  type?: string;         // 'new' (Nuevo) o 'mod' (Modernización)
  machineType?: string;  // Tipo de máquina para el PDF
  currency?: 'MXN' | 'USD'; // Moneda para el PDF
  // ------------------------------------------

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
  user_id?: string; // Importante para el sistema de usuarios

  // Campos calculados
  materials?: any; 
  price?: number; 
}

export interface AppSettings {
  // Ajustamos para incluir los campos nuevos de configuración que agregamos (SMTP)
  companyName?: string;
  ivaRate?: number;
  currency?: 'MXN' | 'USD';
  adminEmail?: string;
  
  whapiToken: string;
  
  odooUrl: string;
  odooDb: string;
  odooUser: string;
  odooKey: string;
  
  // Campos SMTP nuevos
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;

  // Mantener los que ya tenías
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