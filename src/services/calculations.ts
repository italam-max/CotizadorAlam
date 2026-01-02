// ARCHIVO: src/services/calculations.ts
import type { QuoteData } from '../types';
import { TECHNICAL_RULES, CAPACITY_PERSONS_TABLE, HYDRAULIC_LIMITS, SPEED_DIMENSIONS_TABLE, ELEVATOR_MODELS } from '../data/constants';

const STANDARD_FLOOR_HEIGHT = 3000; // 3 metros por piso estándar

// --- 1. OBTENER VALORES POR DEFECTO (AUTO-CONFIGURACIÓN) ---
export const getSmartDefaults = (capacity: number, travel: number, stops: number): Partial<QuoteData> => {
    const defaults: Partial<QuoteData> = {};

    // A. Cálculo Automático de Recorrido basado en Paradas
    if (stops > 1) {
        defaults.travel = (stops - 1) * STANDARD_FLOOR_HEIGHT;
    }

    // B. Configurar según Capacidad (Kg) -> Define Modelo base y Dimensiones Cubo
    const rule = TECHNICAL_RULES.find(r => capacity >= r.minKg && capacity <= r.maxKg);
    const personRule = CAPACITY_PERSONS_TABLE.find(p => p.kg === capacity);

    if (rule) {
        defaults.model = rule.model;
        defaults.shaftWidth = rule.minWidth;
        defaults.shaftDepth = rule.minDepth;
        defaults.speed = rule.speedMax; 
    }

    if (personRule) {
        defaults.persons = personRule.persons;
    }

    const currentTravel = defaults.travel || travel;

    // C. Ajuste de Modelo por Recorrido y Carga
    // 1. Prioridad Hidráulico (Bajo recorrido, pocas paradas, carga media)
    if (currentTravel > 0 && currentTravel <= HYDRAULIC_LIMITS.maxTravel && stops <= HYDRAULIC_LIMITS.maxStops && capacity <= 1250) {
        defaults.model = 'HYD';
        defaults.pit = HYDRAULIC_LIMITS.standardPit;
        defaults.overhead = 3400;
    } 
    // 2. Prioridad MR (Cuarto de Máquinas) para Alturas o Cargas > 800kg
    else if (stops > 8 || capacity > 800) { 
        defaults.model = 'MR';
    }

    // D. Ajuste de Tracción y Componentes según el Modelo Resultante
    const currentModel = defaults.model || 'MRL-G'; 
    
    if (currentModel === 'MRL-G') {
        defaults.traction = 'Bandas Planas (STM)';
    } else if (currentModel === 'MRL-L') {
        defaults.traction = 'Cable de Acero';
    } else if (currentModel === 'HYD') {
        defaults.traction = 'Impulsión Hidráulica';
    } else if (currentModel === 'MR') {
        defaults.traction = 'Cable de Acero'; 
    }

    // E. Configurar Fosa y Sobrepaso exactos según tabla de velocidades
    const targetSpeed = Number(defaults.speed) || 1.0;
    
    // Buscamos la regla dimensional específica
    const dimensionRule = SPEED_DIMENSIONS_TABLE.find(d => 
        d.speed === targetSpeed && 
        (d.type === currentModel || (currentModel.includes('MRL') && d.type === 'MRL'))
    );

    if (dimensionRule) {
        defaults.pit = dimensionRule.pit;
        defaults.overhead = dimensionRule.overhead;
    }

    return defaults;
};

// --- 2. OBTENER OPCIONES ESTRICTAS (CANDADOS DE SEGURIDAD) ---
export const getStrictOptions = (data: QuoteData) => {
    const estimatedTravel = (data.stops - 1) * STANDARD_FLOOR_HEIGHT;
    const effectiveTravel = data.travel > 0 ? data.travel : estimatedTravel;

    // A. Filtrar Modelos Válidos (El menú desplegable solo mostrará lo posible)
    const validModels = ELEVATOR_MODELS.filter(m => {
        // 1. Regla Hidráulica: Límite 12m o 3 paradas
        if ((m.id === 'HYD' || m.id === 'Home Lift') && (effectiveTravel > HYDRAULIC_LIMITS.maxTravel || data.stops > HYDRAULIC_LIMITS.maxStops)) {
            return false;
        }
        
        // 2. Regla MRL-L: Solo hasta 400kg
        if (m.id === 'MRL-L' && data.capacity > 400) return false;

        // 3. Regla Límite de Paradas para MRL (>8 requiere MR)
        if (data.stops > 8 && (m.id === 'MRL-G' || m.id === 'MRL-L')) {
            return false;
        }

        // 4. Regla Límite de Carga para MRL (>800kg requiere MR)
        if (data.capacity > 800 && (m.id === 'MRL-G' || m.id === 'MRL-L')) {
            return false;
        }
        
        return true;
    });

    // B. Obtener Dimensiones Mínimas Permitidas
    const currentSpeed = parseFloat(String(data.speed));
    const dimRule = SPEED_DIMENSIONS_TABLE.find(d => 
        d.speed === currentSpeed && 
        (d.type === data.model || (data.model.includes('MRL') && d.type.includes('MRL')))
    );
    
    const isHydraulic = data.model === 'HYD' || data.model === 'Home Lift';
    // Si es hidráulico usa sus mínimos, si es tracción usa la tabla por velocidad
    const minPit = isHydraulic ? HYDRAULIC_LIMITS.minPit : (dimRule?.pit || 1200);
    const minOverhead = isHydraulic ? 3400 : (dimRule?.overhead || 3500);

    // C. Personas Exactas (Candado)
    const personRule = CAPACITY_PERSONS_TABLE.find(p => p.kg === data.capacity);
    const strictPersons = personRule ? personRule.persons : null;

    // D. Dimensiones Mínimas de Cubo
    const techRule = TECHNICAL_RULES.find(r => data.capacity >= r.minKg && data.capacity <= r.maxKg);
    const minShaftWidth = (techRule && !isHydraulic) ? techRule.minWidth : 1200; 
    const minShaftDepth = (techRule && !isHydraulic) ? techRule.minDepth : 1200;

    return { 
        validModels, 
        minPit, 
        minOverhead, 
        strictPersons, 
        minShaftWidth, 
        minShaftDepth 
    };
};

// --- 3. VALIDACIÓN INTELIGENTE (RETORNA ERRORES VISUALES) ---
export const validateConfiguration = (data: QuoteData) => {
    const warnings: string[] = [];
    const suggestions: Partial<QuoteData> = {};
    const fieldsWithError: string[] = []; 

    const warn = (msg: string, field?: string) => {
        warnings.push(`ADVERTENCIA: ${msg}`);
        if (field) fieldsWithError.push(field);
    };

    // VALIDACIÓN DIMENSIONAL (Fosa y Huida)
    const currentSpeed = parseFloat(String(data.speed));
    const dimensionRule = SPEED_DIMENSIONS_TABLE.find(d => 
        d.speed === currentSpeed && 
        (d.type === data.model || (data.model.includes('MRL') && d.type.includes('MRL')))
    );

    if (dimensionRule) {
        if (data.pit < dimensionRule.pit) {
            if (!(data.model === 'HYD' && data.pit >= 400)) {
                warn(`Fosa insuficiente (${data.pit}mm). Requiere ${dimensionRule.pit}mm.`, 'pit');
                suggestions.pit = dimensionRule.pit;
            }
        }
        if (data.overhead < dimensionRule.overhead) {
            warn(`Sobrepaso insuficiente (${data.overhead}mm). Requiere ${dimensionRule.overhead}mm.`, 'overhead');
            suggestions.overhead = dimensionRule.overhead;
        }
    }

    // VALIDACIÓN DE MODELO OBLIGATORIO (MR vs MRL)
    if (data.model === 'MRL-G' || data.model === 'MRL-L') {
        if (data.stops > 8) {
            warn(`Para ${data.stops} paradas se requiere Cuarto de Máquinas (MR).`, 'model');
            suggestions.model = 'MR';
        }
        if (data.capacity > 800) {
            warn(`Para ${data.capacity}kg se requiere Cuarto de Máquinas (MR).`, 'model');
            suggestions.model = 'MR';
        }
    }

    // LÓGICA HIDRÁULICA
    if (data.model === 'HYD' || data.model === 'Home Lift') {
        if (data.travel > HYDRAULIC_LIMITS.maxTravel) {
            warn(`Recorrido excesivo para Hidráulico (${(data.travel/1000).toFixed(1)}m). Límite 12m.`, 'travel');
            suggestions.model = 'MRL-L';
        }
    } else {
        // Validación MRL-L (Lite)
        if (data.capacity <= 400 && data.model === 'MRL-G' && data.stops <= 8) {
            warn(`Para ${data.capacity}kg se recomienda modelo MRL-L (Lite).`, 'model');
            suggestions.model = 'MRL-L';
        } else if (data.capacity > 400 && data.model === 'MRL-L') {
            warn(`MRL-L no soporta ${data.capacity}kg. Cambia a MRL-G.`, 'model');
            suggestions.model = 'MRL-G';
        }
    }

    // Validación Ancho/Fondo Cubo
    const techRule = TECHNICAL_RULES.find(r => data.capacity >= r.minKg && data.capacity <= r.maxKg);
    if (techRule && data.model !== 'HYD') {
        if (data.shaftWidth < techRule.minWidth) warn(`Ancho de cubo insuficiente para ${data.capacity}kg.`, 'shaftWidth');
        if (data.shaftDepth < techRule.minDepth) warn(`Fondo de cubo insuficiente para ${data.capacity}kg.`, 'shaftDepth');
    }

    return { warnings, suggestions, fieldsWithError };
};

// --- 4. CALCULADORA DE MATERIALES (BOM) ---
export const calculateMaterials = (data: QuoteData) => {
    const qty = data.quantity || 1;
    const stops = data.stops || 6;
    const travel = (data.travel || 18000) / 1000; 
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
      'Magnet (Imanes)': { color: 'bg-red-100 border-red-200 text-red-900', items: [] as any[] },
      'Varios': { color: 'bg-yellow-100 border-yellow-200 text-yellow-900', items: [] as any[] },
    };
    
    const add = (cat: keyof typeof materials, product: string, desc: string, q: number, unit: string) => {
        if (q > 0) materials[cat].items.push({ product, desc, qty: Number(q.toFixed(2)), unit });
    };
    
    // 1. MACHINE ROOM
    add('Machine Room', 'Control', `Control Inteligente Alamex ${isHydraulic ? 'Hidráulico' : (isMR ? 'MR' : 'MRL')}, 220V`, qty, 'PZA');
    if (isHydraulic) {
        add('Machine Room', 'Central Hidráulica', 'Unidad de Poder Hidráulica', qty, 'PZA');
        add('Machine Room', 'Pistón', 'Pistón Hidráulico', qty, 'PZA');
        add('Machine Room', 'Bomba Hidráulica', 'Bomba compatible', qty, 'PZA');
        add('Machine Room', 'Aceite Hidráulico', 'Tambor de Aceite', qty * 2, 'PZA'); 
    } else {
        add('Machine Room', 'Bancada', isMR ? 'Bancada Máquina MR' : 'Kit Chasis MRL-G', qty, 'PZA');
        add('Machine Room', 'Cable Tablero/máquina', 'Cable Motor Multi Conducto', 7 * qty, 'm.');
        add('Machine Room', 'Regulador', `Regulador ${isMR ? 'MR' : 'MRL'} ${data.speed} m/s`, qty, 'PZA');
        add('Machine Room', 'Máquina', `Gearless ${data.capacity}kg`, qty, 'PZA');
        if (isMR) {
             add('Machine Room', 'Deflector', 'Polea Deflectora MR', qty, 'PZA');
        }
    }
    // 2. PIT / FOSA
    add('Pit (Fosa)', 'Amortiguador', 'Amortiguador ALAM 01', 2 * qty, 'PZA');
    if (!isHydraulic) add('Pit (Fosa)', 'Bancada Amortiguador', 'Bancada Ajustable', 2 * qty, 'PZA');
    add('Pit (Fosa)', 'Recolector', 'Recolector De Aceite', isHydraulic ? 1 * qty : 2 * qty, 'PZA');
    add('Pit (Fosa)', 'Escalera', 'Escalera Fosa', 1 * qty, 'PZA');
    add('Pit (Fosa)', 'Stop', 'Botón Stop', 1 * qty, 'PZA');
    // 3. GUIDES / GUÍAS
    const railsQty = Math.ceil(totalShaftHeight / 5) * 2; 
    add('Guides (Guías)', 'Riel Cabina', 'Riel 16 mm', railsQty * qty, 'PZA');
    if (!isHydraulic) add('Guides (Guías)', 'Riel Contrapeso', 'Riel 5 mm', railsQty * qty, 'PZA');
    const bracketsQty = Math.ceil(totalShaftHeight / 1.5) * 2 * (isHydraulic ? 1 : 2); 
    add('Guides (Guías)', 'Grapas Cabina', 'Grapas 16 mm', bracketsQty * qty, 'PZA');
    if (!isHydraulic) add('Guides (Guías)', 'Grapas Contrapeso', 'Grapas 5 mm', bracketsQty * qty, 'PZA');
    add('Guides (Guías)', 'Soporte', 'Soporte Riel', (Math.ceil(totalShaftHeight/1.5)) * qty, 'PZA');
    // 4. CABIN / CABINA
    add('Cabin (Cabina)', 'Cabina', `Cabina ${data.cabinModel}`, qty, 'PZA');
    add('Cabin (Cabina)', 'Chasis', isHydraulic ? 'Chasis Mochila' : 'Chasis MRL', qty, 'PZA');
    add('Cabin (Cabina)', 'COP', 'Botonera Cabina', qty, 'PZA');
    add('Cabin (Cabina)', 'Cable COP', 'Cable viajero', 1 * qty, 'PZA');
    add('Cabin (Cabina)', 'Operador', `Operador ${data.doorType}`, qty, 'PZA');
    add('Cabin (Cabina)', 'Cortina', 'Sensor Infrarrojo', qty, 'PZA');
    add('Cabin (Cabina)', 'Pesaje', 'Sensor Carga', qty, 'PZA');
    if (!isHydraulic) add('Cabin (Cabina)', 'Paracaídas', 'Progresivo', qty, 'PZA');
    else add('Cabin (Cabina)', 'Válvula', 'Rupture Valve', qty, 'PZA');
    // 5. CONTRAPESO
    if (!isHydraulic) {
        add('Counterweight', 'Marco Contrapeso', 'Chasis Contrapeso', 1 * qty, 'PZA');
        add('Counterweight', 'Pesas', 'Bloques Hierro', 30 * qty, 'PZA');
    }
    // 6. CABLES
    if (!isHydraulic) {
        const tractionRopes = (totalShaftHeight + 10) * 5;
        add('Steel Wires', 'Tracción', `Cable ${data.traction}`, tractionRopes * qty, 'm.');
        add('Steel Wires', 'Regulador', 'Cable 6mm', (totalShaftHeight * 2 + 5) * qty, 'm.');
        add('Steel Wires', 'Sujeción', 'Pernos', 12 * qty, 'PZA');
    }
    // 7. CUBE
    add('Cube (Cubo)', 'Viajero', 'Cable Plano', (travel + 15) * qty, 'm.');
    add('Cube (Cubo)', 'Canaleta', 'Canaleta', totalShaftHeight * qty, 'm.');
    // 8. LANDING
    add('Landing (Pisos)', 'Puertas', `Puerta ${data.doorType}`, stops * qty, 'PZA');
    add('Landing (Pisos)', 'LOP', 'Botonera Piso', stops * qty, 'PZA');
    // 9. VARIOS
    add('Varios', 'Taquetes', 'Kit Expansivo', (stops * 8) * qty, 'PZA');
    add('Varios', 'Aceite', 'Lubricante', 2 * qty, 'L.');
    return materials;
};