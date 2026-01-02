// ARCHIVO: src/data/constants.ts
import type { AppSettings, ProjectPhase, QuoteData } from '../types';
import { Ruler, Hammer, Truck, HardHat, CheckCircle2 } from 'lucide-react';

// Configuraciones iniciales
export const INITIAL_SETTINGS: AppSettings = {
  whapiToken: '',
  whapiUrl: 'https://gate.whapi.cloud/messages/text', 
  odooUrl: 'https://odoo.alam.mx',
  odooDb: 'alamex_prod',
  odooUser: '',
  odooKey: '',
  zeptoHost: 'smtp.zepto.mail',
  zeptoPort: '587',
  zeptoUser: '',
  zeptoPass: ''
};

// Etapas del proyecto
export const PROJECT_STAGES = [
  { id: 'ingenieria', label: 'Ingeniería y Planos', icon: Ruler, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'fabricacion', label: 'Fabricación', icon: Hammer, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'embarque', label: 'Embarque y Logística', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'instalacion', label: 'Instalación en Sitio', icon: HardHat, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { id: 'entrega', label: 'Entrega Final', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' }
];

// --- OPCIONES DE ELEVADORES (LIMPIEZA FINAL: SOLO ELEVADORES COMERCIALES) ---
export const ELEVATOR_MODELS = [
  { id: 'MR', label: 'Con cuarto de máquinas (MR)' },
  { id: 'MRL-L', label: 'Sin cuarto de máquinas (MRL-L)' },
  { id: 'MRL-G', label: 'Sin cuarto de máquinas (MRL-G)' },
  { id: 'HYD', label: 'Hidráulico (HyD)' },
  { id: 'Home Lift', label: 'Home Lift' },
];

// --- TABLA DE RELACIÓN VELOCIDAD -> DIMENSIONES (FOSA/HUIDA) ---
export const SPEED_DIMENSIONS_TABLE = [
    // 1.0 m/s
    { speed: 1.0, type: 'MRL-G', pit: 1100, overhead: 3900 },
    { speed: 1.0, type: 'MRL-L', pit: 1100, overhead: 3600 },
    { speed: 1.0, type: 'MR',    pit: 1100, overhead: 3500 },
    { speed: 1.0, type: 'HYD',   pit: 1100, overhead: 3400 },
    
    // 1.6 m/s
    { speed: 1.6, type: 'MRL-G', pit: 1300, overhead: 3800 },
    { speed: 1.6, type: 'MR',    pit: 1400, overhead: 4000 },
    
    // 2.0 m/s
    { speed: 2.0, type: 'MRL-G', pit: 1500, overhead: 4300 },
    { speed: 2.0, type: 'MR',    pit: 1650, overhead: 4500 },
    
    // 2.5 m/s
    { speed: 2.5, type: 'MRL-G', pit: 2000, overhead: 4800 },
    { speed: 2.5, type: 'MR',    pit: 2000, overhead: 4750 },
];

// --- CONSTANTES ESPECÍFICAS PARA HIDRÁULICOS ---
export const HYDRAULIC_LIMITS = {
    maxTravel: 12000,   // 12 metros
    maxStops: 3,        // 3 salidas
    standardPit: 1100,  // Estándar óptimo
    minPit: 400,        // Mínimo absoluto (con rampa)
    minDim: 1600        // 1.6m x 1.6m referencia
};

// --- TABLA DE RELACIÓN KG -> PERSONAS ---
export const CAPACITY_PERSONS_TABLE = [
    { kg: 320, persons: 4 },
    { kg: 400, persons: 5 },
    { kg: 450, persons: 6 },
    { kg: 630, persons: 8 },
    { kg: 800, persons: 10 },
    { kg: 1000, persons: 13 },
    { kg: 1250, persons: 16 },
    { kg: 1600, persons: 21 },
    { kg: 2000, persons: 26 },
    { kg: 2500, persons: 33 },
    { kg: 3000, persons: 40 },
    { kg: 4000, persons: 53 },
    { kg: 5000, persons: 66 }
];

// --- REGLAS DE INGENIERÍA ---
export const TECHNICAL_RULES = [
  // MRL-L: Hasta 400kg
  { minKg: 0, maxKg: 400, model: 'MRL-L', minWidth: 1550, minDepth: 1550, speedMax: 1.0 },
  
  // MRL-G: Más de 400kg
  { minKg: 401, maxKg: 630, model: 'MRL-G', minWidth: 1600, minDepth: 1650, speedMax: 1.6 },
  { minKg: 631, maxKg: 800, model: 'MRL-G', minWidth: 1750, minDepth: 1750, speedMax: 1.75 },
  { minKg: 801, maxKg: 1000, model: 'MRL-G', minWidth: 1800, minDepth: 2000, speedMax: 2.0 },
  
  // MR / MRL-G Reforzado
  { minKg: 1001, maxKg: 1275, model: 'MRL-G', minWidth: 2000, minDepth: 2400, speedMax: 2.5 },
  { minKg: 1276, maxKg: 1600, model: 'MR', minWidth: 2355, minDepth: 2730, speedMax: 2.5 }, 
  { minKg: 1601, maxKg: 2000, model: 'MR', minWidth: 2555, minDepth: 2800, speedMax: 2.5 },
  { minKg: 2001, maxKg: 5000, model: 'MR', minWidth: 2800, minDepth: 3000, speedMax: 2.5 }
];

export const CONTROL_GROUPS = ['Simplex', 'Duplex', 'Triplex', 'Cuadruplex', 'Mixto'];
export const SPEEDS = ['0.6', '1.0', '1.6', '1.75', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0'];
export const TRACTIONS = ['1:1', '2:1', '4:1'];
export const CAPACITIES = [320, 400, 450, 630, 800, 1000, 1250, 1600, 2000, 2500, 3000, 4000, 5000];
export const DOOR_TYPES = ['Automática Central', 'Automática Telescópica', 'Manual'];
export const SHAFT_TYPES = ['Concreto', 'Estructura Metálica'];
export const YES_NO = ['Sí', 'No'];

export const CABIN_MODELS = [
  { id: 'ASC', label: 'ASC Estándar' },
  { id: 'APNSC01', label: 'APNSC01 (1 Pared Cristal)' },
  { id: 'APNSC02', label: 'APNSC02 (2 Paredes Cristal)' },
  { id: 'APNSC03', label: 'APNSC03 (3 Paredes Cristal)' },
  { id: 'APNRC00', label: 'APNRC00 (Redonda Panorámica)' },
  { id: 'APNMC00', label: 'APNMC00 (Hexagonal Panorámica)' },
  { id: 'ACC', label: 'ACC (Carga)' },
  { id: 'CLX124', label: 'CLX124 (Hospital)' },
];

export const FLOOR_FINISHES = ['Granito', 'PVC', 'Aluminio', 'Metal', '3D Design'];
export const NORMS = ['EN 81-1', 'EN 81-2', 'NOM-053', 'ASME A17.1'];
export const DISPLAYS = ['Display Inteligente', 'Touch', 'LCD Standard', 'Matriz de Puntos'];

export const CITY_COSTS: Record<string, { transport: number; perDiem: number }> = {
  'ACAPULCO': { transport: 22100, perDiem: 15000 },
  'AGUASCALIENTES': { transport: 28900, perDiem: 15000 },
  'BAJA CALIFORNIA SUR': { transport: 69900, perDiem: 35000 },
  'CAMPECHE': { transport: 61300, perDiem: 20000 },
  'CANCUN': { transport: 86700, perDiem: 35000 },
  'CDMX': { transport: 0, perDiem: 0 },
  'CD. JUAREZ': { transport: 132400, perDiem: 35000 },
  'CD. VICTORIA': { transport: 42700, perDiem: 15000 },
  'CELAYA': { transport: 12800, perDiem: 15000 },
  'CHIHUAHUA': { transport: 85600, perDiem: 25000 },
  'COLIMA': { transport: 40700, perDiem: 25000 },
  'CUERNAVACA': { transport: 8400, perDiem: 5000 },
  'CULIACAN': { transport: 64000, perDiem: 30000 },
  'DURANGO': { transport: 57100, perDiem: 15000 },
  'EDO MEX (zona metropolitana)': { transport: 0, perDiem: 0 },
  'GUADALAJARA': { transport: 35800, perDiem: 15000 },
  'GUANAJUATO': { transport: 22000, perDiem: 15000 },
  'HERMOSILLO': { transport: 116100, perDiem: 35000 },
  'IXTAPA ZIHUATANEJO': { transport: 39200, perDiem: 15000 },
  'LEON': { transport: 22000, perDiem: 15000 },
  'LOS CABOS': { transport: 69900, perDiem: 35000 },
  'MAZATLAN': { transport: 58400, perDiem: 20000 },
  'MERIDA': { transport: 86700, perDiem: 35000 },
  'MEXICALLI': { transport: 165600, perDiem: 35000 },
  'MICHOACAN': { transport: 18600, perDiem: 15000 },
  'MONTERREY': { transport: 54400, perDiem: 20000 },
  'MORELIA': { transport: 18600, perDiem: 15000 },
  'NAYARIT': { transport: 56500, perDiem: 15000 },
  'NUEVO LAREDO': { transport: 66500, perDiem: 35000 },
  'OAXACA': { transport: 25500, perDiem: 15000 },
  'PACHUCA': { transport: 750, perDiem: 4000 },
  'PUEBLA': { transport: 8300, perDiem: 5000 },
  'PUERTO VALLARTA': { transport: 56500, perDiem: 15000 },
  'QUERETARO': { transport: 12800, perDiem: 15000 },
  'REYNOSA': { transport: 59400, perDiem: 25000 },
  'SALTILLO': { transport: 42700, perDiem: 25000 },
  'SAN JOSÉ DEL CABO': { transport: 69900, perDiem: 35000 },
  'SAN LUIS POTOSI': { transport: 25500, perDiem: 15000 },
  'TABASCO': { transport: 45100, perDiem: 19950 },
  'TEQUILA': { transport: 39200, perDiem: 15000 },
  'TEZIUTLAN': { transport: 8300, perDiem: 5000 },
  'TIJUANA': { transport: 169300, perDiem: 35000 },
  'TOLUCA': { transport: 8300, perDiem: 5000 },
  'TORREON': { transport: 57100, perDiem: 15000 },
  'TULUM': { transport: 1000, perDiem: 0 }, 
  'TUXTLA GUTIERREZ': { transport: 45100, perDiem: 19950 },
  'VERACRUZ': { transport: 18600, perDiem: 15000 },
  'ZACATECAS': { transport: 39300, perDiem: 15000 },
};

export const INSTALLATION_BASE_COSTS: Record<number, { small: number, large: number }> = {
  2: { small: 33000, large: 35000 },
  3: { small: 33000, large: 35000 },
  4: { small: 33000, large: 35000 },
  5: { small: 35000, large: 37500 },
  6: { small: 42000, large: 45000 },
  7: { small: 49000, large: 52500 },
  8: { small: 56000, large: 60000 },
  9: { small: 63000, large: 67500 },
  10: { small: 70000, large: 75000 },
  11: { small: 77000, large: 82500 },
  12: { small: 84000, large: 90000 },
  13: { small: 91000, large: 97500 },
  14: { small: 98000, large: 105000 },
  15: { small: 105000, large: 112500 },
  16: { small: 112000, large: 120000 },
  17: { small: 119000, large: 127500 },
  18: { small: 126000, large: 135000 },
  19: { small: 133000, large: 142500 },
  20: { small: 140000, large: 150000 },
  21: { small: 147000, large: 157500 },
  22: { small: 154000, large: 165000 },
  23: { small: 161000, large: 172500 },
  24: { small: 168000, large: 180000 },
  25: { small: 175000, large: 187500 },
  26: { small: 182000, large: 195000 },
  27: { small: 189000, large: 202500 },
  28: { small: 196000, large: 210000 },
  29: { small: 203000, large: 217500 },
  30: { small: 210000, large: 225000 },
  31: { small: 217000, large: 232500 },
  32: { small: 224000, large: 240000 },
  33: { small: 231000, large: 247500 },
  34: { small: 238000, large: 255000 },
  35: { small: 245000, large: 262500 },
};

export const INSTALLATION_TIME_TABLE = [
  { max: 5, tur: 5, chi: 10 },
  { max: 10, tur: 7, chi: 12 },
  { max: 15, tur: 9, chi: 14 },
  { max: 20, tur: 11, chi: 16 },
  { max: 25, tur: 13, chi: 18 },
  { max: 35, tur: 15, chi: 20 },
];

export const STANDARD_PHASES: ProjectPhase[] = [
  { id: 'p1', name: 'Firma de Contrato', baseDuration: 1, color: 'bg-blue-500' },
  { id: 'p2', name: 'Diseño Guías Mecánicas', baseDuration: 0.5, color: 'bg-blue-400' },
  { id: 'p3', name: 'Fabricación', baseDuration: 8, color: 'bg-indigo-500', isVariable: true },
  { id: 'p4', name: 'Transporte', baseDuration: 7, color: 'bg-indigo-400' },
  { id: 'p5', name: 'Importación', baseDuration: 2, color: 'bg-purple-500' },
  { id: 'p6', name: 'Verificación y Control', baseDuration: 1.5, color: 'bg-purple-400' },
  { id: 'p7', name: 'Envío a Obra', baseDuration: 0.6, color: 'bg-orange-500' },
  { id: 'p8', name: 'Instalación', baseDuration: 4, color: 'bg-yellow-500', isVariable: true }, 
  { id: 'p9', name: 'Acabados', baseDuration: 1, color: 'bg-yellow-400' },
  { id: 'p10', name: 'Verificación Pagos', baseDuration: 0.5, color: 'bg-green-500' },
  { id: 'p11', name: 'Entrega Final', baseDuration: 0.5, color: 'bg-green-600' },
];

export const INITIAL_FORM_STATE: QuoteData = {
  id: '',
  status: 'Borrador',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  projectRef: '',
  projectDate: new Date().toISOString().split('T')[0],
  
  quantity: 1,
  model: 'MRL-G',
  controlGroup: 'Simplex',
  speed: '1.6',
  traction: '2:1',
  capacity: 630, 
  persons: 8,
  stops: 6,
  travel: 18000,
  overhead: 4000,
  pit: 1300,
  price: 0,
  
  entrances: 'Simple',
  shaftWidth: 1800,
  shaftDepth: 1800,
  shaftType: 'Concreto',
  shaftConstructionReq: 'No',
  
  doorType: 'Automática Central',
  doorWidth: 1000,
  doorHeight: 2100,
  floorDoorFinish: 'Inox / Acero Inoxidable Mate 304',
  
  cabinModel: 'ASC',
  cabinFinish: 'Inox / Acero Inoxidable Mate (CLX102B) 304',
  cabinFloor: 'Granito',
  handrailType: 'Redondo',
  lopModel: 'Display Inteligente',
  copModel: 'Display Inteligente',
  floorNomenclature: 'PB, 1, 2, 3...',
  
  norm: 'EN 81-1',
  fireResistance: 'No',
  cwGovernor: 'Sí',
  installationReq: 'Sí',
  installationCost: 0,
};

export const SEED_QUOTES: QuoteData[] = [
  { ...INITIAL_FORM_STATE, id: 101, clientName: 'Desarrolladora Vertical', projectRef: 'ALAM-PROY-0001', status: 'Sincronizado', quantity: 2, model: 'MRL-G', currentStage: 'ingenieria' },
];