// ARCHIVO: src/data/constants.ts
import type { AppSettings, ProjectPhase, QuoteData } from '../types';
import { Ruler, Hammer, Truck, HardHat, CheckCircle2 } from 'lucide-react';

// Configuraciones iniciales
export const INITIAL_SETTINGS: AppSettings = {
  whapiToken: '',
  whapiUrl: 'https://gate.whapi.cloud/messages/text', // <--- URL POR DEFECTO
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

// Opciones de Elevadores
export const ELEVATOR_MODELS = [
  { id: 'MR', label: 'Con cuarto de máquinas (MR)' },
  { id: 'MRL-L', label: 'Sin cuarto de máquinas (MRL-L)' },
  { id: 'MRL-G', label: 'Sin cuarto de máquinas (MRL-G)' },
  { id: 'HYD', label: 'Hidráulico (HyD)' },
  { id: 'PLAT', label: 'Plataforma' },
  { id: 'CAR', label: 'Apila Autos' },
];

export const CONTROL_GROUPS = ['Simplex', 'Duplex', 'Triplex', 'Cuadruplex', 'Mixto'];
export const SPEEDS = ['0.6', '1.0', '1.6', '1.75', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0'];
export const TRACTIONS = ['1:1', '2:1', '4:1'];
export const CAPACITIES = [100, 320, 450, 630, 800, 1000, 1250, 1600, 2000, 2500, 3000, 4000, 5000];
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

// Datos Geográficos y Costos
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
  'PACHUCA': { transport: 8400, perDiem: 5000 },
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

export const INSTALLATION_TRAVEL_DATA: Record<string, { perDiemPersonDay: number; transportCouple: number; toolTransport: number }> = {
  'ACAPULCO': { perDiemPersonDay: 850, transportCouple: 5500, toolTransport: 8500 },
  'AGUASCALIENTES': { perDiemPersonDay: 850, transportCouple: 5500, toolTransport: 8500 },
  'BAJA CALIFORNIA SUR': { perDiemPersonDay: 850, transportCouple: 22000, toolTransport: 27000 },
  'CAMPECHE': { perDiemPersonDay: 1100, transportCouple: 12100, toolTransport: 16000 },
  'CANCUN': { perDiemPersonDay: 1100, transportCouple: 19800, toolTransport: 5500 },
  'CDMX': { perDiemPersonDay: 0, transportCouple: 0, toolTransport: 0 },
  'CD. JUAREZ': { perDiemPersonDay: 1050, transportCouple: 22000, toolTransport: 26000 },
  'CD. VICTORIA': { perDiemPersonDay: 950, transportCouple: 7700, toolTransport: 10000 },
  'CELAYA': { perDiemPersonDay: 1000, transportCouple: 5500, toolTransport: 8500 },
  'CHIHUAHUA': { perDiemPersonDay: 1050, transportCouple: 22000, toolTransport: 26000 },
  'COLIMA': { perDiemPersonDay: 900, transportCouple: 2500, toolTransport: 10000 },
  'CUERNAVACA': { perDiemPersonDay: 800, transportCouple: 1800, toolTransport: 4000 },
  'CULIACAN': { perDiemPersonDay: 1200, transportCouple: 15400, toolTransport: 26000 },
  'DURANGO': { perDiemPersonDay: 1050, transportCouple: 11000, toolTransport: 26000 },
  'EDO MEX (zona metropolitana)': { perDiemPersonDay: 0, transportCouple: 0, toolTransport: 0 },
  'GUADALAJARA': { perDiemPersonDay: 750, transportCouple: 15000, toolTransport: 15000 },
  'GUANAJUATO': { perDiemPersonDay: 1000, transportCouple: 5500, toolTransport: 8500 },
  'HERMOSILLO': { perDiemPersonDay: 1050, transportCouple: 22000, toolTransport: 26000 },
  'IXTAPA ZIHUATANEJO': { perDiemPersonDay: 900, transportCouple: 6000, toolTransport: 9000 },
  'LEON': { perDiemPersonDay: 900, transportCouple: 3300, toolTransport: 8500 },
  'LOS CABOS': { perDiemPersonDay: 1200, transportCouple: 25520, toolTransport: 29000 },
  'MAZATLAN': { perDiemPersonDay: 1100, transportCouple: 17490, toolTransport: 15000 },
  'MERIDA': { perDiemPersonDay: 1100, transportCouple: 12100, toolTransport: 16000 },
  'MEXICALLI': { perDiemPersonDay: 1100, transportCouple: 18700, toolTransport: 29000 },
  'MICHOACAN': { perDiemPersonDay: 900, transportCouple: 1650, toolTransport: 8500 },
  'MONTERREY': { perDiemPersonDay: 950, transportCouple: 7700, toolTransport: 10000 },
  'MORELIA': { perDiemPersonDay: 900, transportCouple: 1650, toolTransport: 8500 },
  'NAYARIT': { perDiemPersonDay: 1100, transportCouple: 8800, toolTransport: 11000 },
  'NUEVO LAREDO': { perDiemPersonDay: 1100, transportCouple: 18700, toolTransport: 29000 },
  'OAXACA': { perDiemPersonDay: 1000, transportCouple: 6600, toolTransport: 10000 },
  'PACHUCA': { perDiemPersonDay: 750, transportCouple: 1650, toolTransport: 4000 },
  'PUEBLA': { perDiemPersonDay: 850, transportCouple: 1540, toolTransport: 3000 },
  'PUERTO VALLARTA': { perDiemPersonDay: 1100, transportCouple: 11000, toolTransport: 15000 },
  'QUERETARO': { perDiemPersonDay: 800, transportCouple: 2750, toolTransport: 5500 },
  'REYNOSA': { perDiemPersonDay: 950, transportCouple: 7700, toolTransport: 10000 },
  'SALTILLO': { perDiemPersonDay: 850, transportCouple: 1100, toolTransport: 15000 },
  'SAN JOSÉ DEL CABO': { perDiemPersonDay: 1200, transportCouple: 25520, toolTransport: 29000 },
  'SAN LUIS POTOSI': { perDiemPersonDay: 850, transportCouple: 5500, toolTransport: 8500 },
  'TABASCO': { perDiemPersonDay: 950, transportCouple: 11000, toolTransport: 1000 },
  'TEQUILA': { perDiemPersonDay: 750, transportCouple: 15000, toolTransport: 15000 },
  'TEZIUTLAN': { perDiemPersonDay: 850, transportCouple: 220, toolTransport: 6000 },
  'TIJUANA': { perDiemPersonDay: 1100, transportCouple: 18700, toolTransport: 29000 },
  'TOLUCA': { perDiemPersonDay: 800, transportCouple: 1800, toolTransport: 4000 },
  'TORREON': { perDiemPersonDay: 1050, transportCouple: 11000, toolTransport: 26000 },
  'TULUM': { perDiemPersonDay: 1000, transportCouple: 11550, toolTransport: 5500 },
  'TUXTLA GUTIERREZ': { perDiemPersonDay: 950, transportCouple: 11000, toolTransport: 1000 },
  'VERACRUZ': { perDiemPersonDay: 1000, transportCouple: 6600, toolTransport: 10000 },
  'ZACATECAS': { perDiemPersonDay: 900, transportCouple: 15000, toolTransport: 18000 },
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
  capacity: 1000,
  persons: 13,
  stops: 6,
  travel: 18000,
  overhead: 5000,
  pit: 1200,
  price: 0, // <--- CORRECCIÓN AQUI: Se agregó el precio inicial
  
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