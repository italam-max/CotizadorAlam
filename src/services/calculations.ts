// ARCHIVO: src/services/calculations.ts
import type { QuoteData } from '../types';
import { 
  TECHNICAL_RULES, 
  CAPACITY_PERSONS_TABLE, 
  HYDRAULIC_LIMITS, 
  SPEED_DIMENSIONS_TABLE, 
  ELEVATOR_MODELS,
  SPEEDS // Importamos el listado global de velocidades
} from '../data/constants';

const STANDARD_FLOOR_HEIGHT = 3000; 

// --- HELPER INTERNO ---
const getDimensionsBySpeed = (speed: number, modelId: string) => {
    const rule = SPEED_DIMENSIONS_TABLE.find(r => r.speed === speed && r.type === modelId) 
              || SPEED_DIMENSIONS_TABLE.find(r => r.speed === speed && r.type.includes('MRL') && modelId.includes('MRL'));
    return rule || { pit: 1200, overhead: 3500 }; 
};

// --- 1. OBTENER VALORES POR DEFECTO ---
export const getSmartDefaults = (currentData: Partial<QuoteData>): Partial<QuoteData> => {
    const updates: Partial<QuoteData> = {};
    
    // A. Recálculo de Recorrido
    if (currentData.stops && (!currentData.travel || currentData.travel === 0)) {
        updates.travel = (currentData.stops - 1) * STANDARD_FLOOR_HEIGHT;
    }
    const activeTravel = updates.travel || currentData.travel || 0;
    const activeStops = currentData.stops || 2;
    const activeCapacity = currentData.capacity || 630;

    // B. Selección Inteligente de Modelo
    if (!currentData.model) {
        if (activeTravel <= HYDRAULIC_LIMITS.maxTravel && activeStops <= HYDRAULIC_LIMITS.maxStops && activeCapacity <= 1000) {
            updates.model = 'HYD';
        } else if (activeStops > 10 || activeCapacity > 2000) {
            updates.model = 'MR'; 
        } else {
            updates.model = activeCapacity <= 450 ? 'MRL-L' : 'MRL-G';
        }
    }
    const activeModel = updates.model || currentData.model || 'MRL-G';

    // C. Sincronización Personas
    const personRule = CAPACITY_PERSONS_TABLE.find(p => p.kg === activeCapacity);
    if (personRule) updates.persons = personRule.persons;

    // D. Velocidad Recomendada (Auto-ajuste)
    // Buscamos la regla técnica para saber el límite de velocidad de este modelo/carga
    const techRule = TECHNICAL_RULES.find(r => activeCapacity >= r.minKg && activeCapacity <= r.maxKg);
    let maxSpeedAllowed = 1.0;
    
    if (activeModel === 'HYD' || activeModel === 'Home Lift') {
        maxSpeedAllowed = 0.6; // Hidráulicos típicamente lentos
    } else if (techRule) {
        maxSpeedAllowed = techRule.speedMax;
    }

    // Si la velocidad actual supera el máximo permitido, la bajamos
    const currentSpeedNum = Number(currentData.speed || updates.speed || 0);
    if (!currentData.speed || currentSpeedNum > maxSpeedAllowed) {
        updates.speed = String(maxSpeedAllowed);
    }
    const activeSpeed = Number(updates.speed || currentData.speed || 1.0);

    // E. Dimensiones de Cubo
    if (techRule) {
        if (!currentData.shaftWidth) updates.shaftWidth = techRule.minWidth;
        if (!currentData.shaftDepth) updates.shaftDepth = techRule.minDepth;
    }

    // F. Fosa y Huida
    const dims = getDimensionsBySpeed(activeSpeed, activeModel);
    if (activeModel === 'HYD' || activeModel === 'Home Lift') {
        updates.pit = HYDRAULIC_LIMITS.standardPit; 
        updates.overhead = 3400; 
    } else {
        updates.pit = dims.pit;
        updates.overhead = dims.overhead;
    }

    // G. Tracción
    if (activeModel === 'MRL-G') updates.traction = 'Bandas Planas (STM)';
    else if (activeModel === 'MRL-L') updates.traction = 'Cable de Acero';
    else if (activeModel === 'HYD') updates.traction = 'Impulsión Hidráulica';
    else if (activeModel === 'MR') updates.traction = 'Cable de Acero';

    return updates;
};

// --- 2. OBTENER OPCIONES ESTRICTAS (Para UI) ---
export const getStrictOptions = (data: QuoteData) => {
    const estimatedTravel = (data.stops - 1) * STANDARD_FLOOR_HEIGHT;
    const effectiveTravel = data.travel > 0 ? data.travel : estimatedTravel;

    // A. Modelos Válidos
    const validModels = ELEVATOR_MODELS.filter(m => {
        if ((m.id === 'HYD' || m.id === 'Home Lift') && (effectiveTravel > HYDRAULIC_LIMITS.maxTravel || data.stops > HYDRAULIC_LIMITS.maxStops)) return false;
        if (m.id === 'MRL-L' && data.capacity > 450) return false;
        if (data.stops > 8 && (m.id === 'MRL-G' || m.id === 'MRL-L')) return false;
        if (data.capacity > 800 && (m.id === 'MRL-G' || m.id === 'MRL-L')) return false;
        return true;
    });

    // B. Velocidades Válidas (NUEVO)
    // Filtramos la lista global SPEEDS según la capacidad y modelo
    const techRule = TECHNICAL_RULES.find(r => data.capacity >= r.minKg && data.capacity <= r.maxKg);
    let maxSpeed = 1.0;

    if (data.model === 'HYD' || data.model === 'Home Lift') {
        maxSpeed = 0.6;
    } else if (techRule) {
        maxSpeed = techRule.speedMax;
    }

    // Filtramos solo las velocidades menores o iguales al máximo permitido
    const validSpeeds = SPEEDS.filter(s => parseFloat(s) <= maxSpeed);

    // C. Límites Numéricos
    const currentSpeed = parseFloat(String(data.speed));
    const dimRule = getDimensionsBySpeed(currentSpeed, data.model);
    const isHydraulic = data.model === 'HYD' || data.model === 'Home Lift';
    
    const minPit = isHydraulic ? HYDRAULIC_LIMITS.minPit : (dimRule?.pit || 1200);
    const minOverhead = isHydraulic ? 3200 : (dimRule?.overhead || 3500);
    const minShaftWidth = (techRule && !isHydraulic) ? techRule.minWidth : 1200; 
    const minShaftDepth = (techRule && !isHydraulic) ? techRule.minDepth : 1200;
    
    const personRule = CAPACITY_PERSONS_TABLE.find(p => p.kg === data.capacity);
    const strictPersons = personRule ? personRule.persons : null;

    return { 
        validModels, 
        validSpeeds, // <--- Retornamos la lista filtrada
        minPit, 
        minOverhead, 
        strictPersons, 
        minShaftWidth, 
        minShaftDepth 
    };
};

export const validateConfiguration = (data: QuoteData) => {
    const warnings: string[] = [];
    const suggestions: Partial<QuoteData> = {};
    const fieldsWithError: string[] = []; 

    const warn = (msg: string, field?: string) => {
        warnings.push(`ADVERTENCIA: ${msg}`);
        if (field) fieldsWithError.push(field);
    };

    if (data.pit < 300) warn("Fosa (Pit) peligrosamente baja. Mínimo absoluto 300mm.", 'pit');
    if (data.model === 'MRL-L' && data.capacity > 450) {
        warn("El modelo MRL-L solo soporta hasta 450kg.", 'model');
        fieldsWithError.push('capacity');
    }
    if ((data.model === 'HYD' || data.model === 'Home Lift') && data.travel > 15000) {
        warn("Recorrido excesivo para sistema Hidráulico (>15m).", 'travel');
        fieldsWithError.push('model');
    }

    const currentSpeed = Number(data.speed);
    const requiredDims = getDimensionsBySpeed(currentSpeed, data.model);
    
    if (data.model !== 'HYD' && data.pit < requiredDims.pit * 0.9) {
        warn(`Para ${currentSpeed}m/s se recomienda Fosa de ${requiredDims.pit}mm.`, 'pit');
    }
    if (data.model !== 'HYD' && data.overhead < requiredDims.overhead * 0.9) {
        warn(`Para ${currentSpeed}m/s se recomienda Huida de ${requiredDims.overhead}mm.`, 'overhead');
    }

    return { warnings, suggestions, fieldsWithError };
};

export const calculateMaterials = (data: QuoteData) => {
    const qty = data.quantity || 1;
    const stops = data.stops || 2;
    const travel = (data.travel || 3000) / 1000; 
    const totalShaftHeight = travel + ((data.overhead||0)/1000) + ((data.pit||0)/1000);
    const isHydraulic = String(data.model).includes('HYD') || String(data.model).includes('Home');
    const isMR = data.model === 'MR';

    const materials = {
      'Machine Room': { color: 'bg-blue-100 border-blue-200 text-blue-900', items: [] as any[] },
      'Pit (Fosa)': { color: 'bg-orange-100 border-orange-200 text-orange-900', items: [] as any[] },
      'Guides (Guías)': { color: 'bg-gray-100 border-gray-200 text-gray-800', items: [] as any[] },
      'Cabin (Cabina)': { color: 'bg-green-100 border-green-200 text-green-900', items: [] as any[] },
      'Counterweight': { color: 'bg-purple-100 border-purple-200 text-purple-900', items: [] as any[] },
      'Steel Wires': { color: 'bg-slate-200 border-slate-300 text-slate-800', items: [] as any[] },
      'Cube (Cubo)': { color: 'bg-indigo-100 border-indigo-200 text-indigo-900', items: [] as any[] },
      'Landing (Pisos)': { color: 'bg-teal-100 border-teal-200 text-teal-900', items: [] as any[] },
      'Varios': { color: 'bg-yellow-100 border-yellow-200 text-yellow-900', items: [] as any[] },
    };
    
    const add = (cat: keyof typeof materials, product: string, desc: string, q: number, unit: string) => {
        if (q > 0) materials[cat].items.push({ product, desc, qty: Number(q.toFixed(2)), unit });
    };
    
    add('Machine Room', 'Control', `Control Inteligente Alamex ${isHydraulic ? 'Hidráulico' : (isMR ? 'MR' : 'MRL')}, 220V`, qty, 'PZA');
    
    if (isHydraulic) {
        add('Machine Room', 'Central Hidráulica', 'Unidad de Poder', qty, 'PZA');
        add('Machine Room', 'Pistón', `Pistón Hidráulico (${travel}m)`, qty, 'PZA');
        add('Machine Room', 'Aceite', 'Tambor Aceite', qty * 2, 'PZA');
    } else {
        add('Machine Room', 'Máquina', `Motor Gearless ${data.capacity}kg`, qty, 'PZA');
        add('Machine Room', 'Regulador', `Limitador ${data.speed} m/s`, qty, 'PZA');
        if (isMR) add('Machine Room', 'Bancada', 'Bancada Acero', qty, 'PZA');
    }

    const railsQty = Math.ceil(totalShaftHeight / 5) * 2; 
    add('Guides (Guías)', 'Riel Cabina', 'Riel T89/T90', railsQty * qty, 'Tramo');
    if (!isHydraulic) add('Guides (Guías)', 'Riel CP', 'Riel T50/T70', railsQty * qty, 'Tramo');
    
    add('Cabin (Cabina)', 'Cabina', `Cabina ${data.cabinModel}`, qty, 'PZA');
    add('Cabin (Cabina)', 'Puertas', `Operador ${data.doorType}`, qty, 'PZA');
    
    if (!isHydraulic) {
        add('Steel Wires', 'Tracción', data.traction?.includes('Banda') ? 'Cinta STM' : 'Cable Acero', (totalShaftHeight + 10) * 5 * qty, 'm.');
        add('Counterweight', 'Bastidor', 'Chasis CP', 1 * qty, 'PZA');
    }

    add('Landing (Pisos)', 'Puertas Piso', `Puerta ${data.doorType}`, stops * qty, 'PZA');
    add('Cube (Cubo)', 'Viajero', 'Cable Plano', (travel + 10) * qty, 'm.');

    return materials;
};