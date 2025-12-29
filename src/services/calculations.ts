// ARCHIVO: src/services/calculations.ts
import type { QuoteData } from '../types';
import { TECHNICAL_RULES, CAPACITY_PERSONS_TABLE, HYDRAULIC_LIMITS } from '../data/constants';

// --- NUEVA FUNCIÓN: OBTENER VALORES POR DEFECTO (AUTO-CONFIGURACIÓN) ---
export const getSmartDefaults = (capacity: number, travel: number, stops: number): Partial<QuoteData> => {
    const defaults: Partial<QuoteData> = {};

    // 1. Configurar según Capacidad (Kg)
    // Busca la regla técnica (modelo y dimensiones) para esta carga
    const rule = TECHNICAL_RULES.find(r => capacity >= r.minKg && capacity <= r.maxKg);
    // Busca la regla de personas para esta carga
    const personRule = CAPACITY_PERSONS_TABLE.find(p => p.kg === capacity);

    if (rule) {
        defaults.model = rule.model;
        defaults.shaftWidth = rule.minWidth;
        defaults.shaftDepth = rule.minDepth;
        defaults.speed = rule.speedMax; // Velocidad estándar sugerida
    }

    if (personRule) {
        defaults.persons = personRule.persons;
    }

    // 2. Ajuste por Recorrido (Prioridad Hidráulico si aplica)
    // Si el recorrido es corto y pocas paradas, el sistema podría sugerir Hidráulico,
    // pero aquí respetamos la regla de carga primero. Si la carga es baja (<1000) y recorrido corto, 
    // mantenemos MRL como estándar moderno, pero el usuario puede cambiarlo y el validador lo aprobará.

    // 3. Ajuste de Tracción por defecto
    if (defaults.model === 'MRL-G') {
        defaults.traction = 'Bandas Planas (STM)'; // Default premium
    } else if (defaults.model === 'MRL-L') {
        defaults.traction = 'Cable de Acero';
    }

    return defaults;
};

// --- FUNCIÓN DE VALIDACIÓN INTELIGENTE (CEREBRO DEL COTIZADOR) ---
export const validateConfiguration = (data: QuoteData) => {
    const warnings: string[] = [];
    const suggestions: Partial<QuoteData> = {};

    // Helper para mensajes consistentes
    const warn = (msg: string) => warnings.push(`ADVERTENCIA EQUIPO FUERA DE NORMA: ${msg}`);

    // ==========================================
    // 1. LÓGICA HIDRÁULICA (Basado en Árbol de Decisiones)
    // ==========================================
    if (data.model === 'HYD' || data.model === 'Home Lift') {
        
        // A. Validar Recorrido y Paradas (Regla: Hasta 12m / 3 salidas)
        if (data.travel > HYDRAULIC_LIMITS.maxTravel) {
            warn(`Recorrido excesivo para Hidráulico (${(data.travel/1000).toFixed(1)}m > 12m). Sugerido: Tracción.`);
            suggestions.model = 'MRL-L'; // Sugerencia de cambio a Tracción Lite
        }
        if (data.stops > HYDRAULIC_LIMITS.maxStops) {
            warn(`Demasiadas paradas para Hidráulico (${data.stops}). Límite optimo: 3.`);
        }

        // B. Validar Foso (Regla: 40cm estándar o 0 con rampa)
        if (data.pit > 0 && data.pit < HYDRAULIC_LIMITS.standardPit) {
            warn(`Foso ${data.pit}mm insuficiente. Estándar hidráulico: ${HYDRAULIC_LIMITS.standardPit}mm. Para fosos menores, se requiere rampa.`);
            suggestions.pit = HYDRAULIC_LIMITS.standardPit;
        }

        // C. Validar Estructura (Regla: Suministro Alamex = Metal)
        if (data.shaftConstructionReq === 'Sí' && data.shaftType !== 'Estructura Metálica') {
            warn(`Si Alamex suministra el cubo para Hidráulico, debe ser Estructura Metálica (No Concreto).`);
            suggestions.shaftType = 'Estructura Metálica';
        }

        // D. Validar Dimensiones (Referencia 1.6 x 1.6m)
        if ((data.shaftWidth < 1600 || data.shaftDepth < 1600) && data.capacity >= 400) {
             // Solo nota informativa, no bloqueante
             // warnings.push(`ℹ️ Nota: El espacio estándar sugerido para este equipo es 1600x1600mm.`);
        }

    } 
    // ==========================================
    // 2. LÓGICA TRACCIÓN (MRL/MR)
    // ==========================================
    else {
        // Sugerencia Hidráulica inversa (Si cumple condiciones para ser hidráulico pero es tracción)
        if (data.travel <= 12000 && data.stops <= 3 && data.capacity <= 630) {
             // Es solo una sugerencia de eficiencia, no una advertencia de norma.
        }

        // Modelo L vs G por Capacidad (Del PDF: Corte en 400kg)
        if (data.capacity <= 400 && data.model === 'MRL-G') {
            warn(`Capacidad baja (${data.capacity}kg). Se recomienda modelo MRL-L para optimizar costos.`);
            suggestions.model = 'MRL-L';
        } else if (data.capacity > 400 && data.model === 'MRL-L') {
            warn(`Modelo MRL-L excedido en carga (${data.capacity}kg > 400kg). Requiere MRL-G.`);
            suggestions.model = 'MRL-G';
        }

        // Tracción Cable vs Bandas (Del PDF: Alamex -> Bandas, Cliente -> Cable)
        if (data.model === 'MRL-G') {
            const isAlamexStructure = data.shaftType === 'Estructura Metálica' && data.shaftConstructionReq === 'Sí';
            
            if (isAlamexStructure && !data.traction?.toLowerCase().includes('bandas')) {
                warn(`Estructura Alamex y modelo G requieren Bandas (STM).`);
                suggestions.traction = 'Bandas Planas (STM)';
            } else if (!isAlamexStructure && data.traction?.toLowerCase().includes('bandas')) {
                warn(`En cubo de cliente (Concreto/Metal propio), el estándar es Cable de Acero.`);
                suggestions.traction = 'Cable de Acero';
            }
        }
        
        // Validar Overhead MRL (Estándar 4000mm según diagrama)
        if ((data.model === 'MRL-G' || data.model === 'MRL-L') && data.overhead < 3600) {
             warn(`El estándar de Huida para MRL es recomendable >3600mm (Ideal 4000mm).`);
             if (data.overhead < 3000) suggestions.overhead = 4000;
        }
    }

    // ==========================================
    // 3. VALIDACIONES GENERALES (FÍSICA)
    // ==========================================
    
    // A. Coherencia Personas vs Kg (Tabla ISO)
    const standardConfig = CAPACITY_PERSONS_TABLE.find(c => c.kg === data.capacity);
    if (standardConfig && data.persons !== standardConfig.persons) {
        warn(`Incoherencia física. ${data.capacity}kg corresponden a ${standardConfig.persons} personas (Actual: ${data.persons}).`);
        suggestions.persons = standardConfig.persons;
    }

    // B. Validación dimensional técnica (Mínimos absolutos por carga)
    const rule = TECHNICAL_RULES.find(r => data.capacity >= r.minKg && data.capacity <= r.maxKg);
    if (rule) {
        // Solo aplicamos tolerancia estricta si NO es hidráulico (ya validamos 1.6x1.6 arriba)
        if (data.model !== 'HYD') {
            const tolerancia = 50;
            if (data.shaftWidth > 0 && data.shaftWidth < (rule.minWidth - tolerancia)) {
                warn(`Ancho de cubo (${data.shaftWidth}mm) insuficiente para ${data.capacity}kg. Mínimo: ${rule.minWidth}mm.`);
                suggestions.shaftWidth = rule.minWidth;
            }
            if (data.shaftDepth > 0 && data.shaftDepth < (rule.minDepth - tolerancia)) {
                warn(`Fondo de cubo (${data.shaftDepth}mm) insuficiente para ${data.capacity}kg. Mínimo: ${rule.minDepth}mm.`);
                suggestions.shaftDepth = rule.minDepth;
            }
        }
        
        // Validar velocidad máxima del modelo
        const currentSpeed = parseFloat(String(data.speed));
        if (currentSpeed > rule.speedMax) {
             warn(`Velocidad (${currentSpeed}m/s) excede límite del modelo (${rule.speedMax}m/s).`);
             suggestions.speed = rule.speedMax;
        }
    }

    // C. Validar Recorrido vs Paradas (Lógica de estimación)
    const EST_FLOOR_HEIGHT = 3000; 
    const minTravel = (data.stops - 1) * 2500;
    const maxTravel = (data.stops - 1) * 6000;
    
    if (data.travel > 0 && (data.travel < minTravel || data.travel > maxTravel)) {
        const suggestedTravel = (data.stops - 1) * EST_FLOOR_HEIGHT;
        if (data.travel === 0) {
             // Si es 0 no es advertencia de norma, es aviso de calculo
        } else {
            warn(`Recorrido de ${data.travel}mm inusual para ${data.stops} paradas. Verifique.`);
        }
        suggestions.travel = suggestedTravel;
    }

    return { warnings, suggestions };
};

// --- CALCULADORA DE MATERIALES (ADAPTADA) ---
export const calculateMaterials = (data: QuoteData) => {
    const qty = data.quantity || 1;
    const stops = data.stops || 6;
    const travel = (data.travel || 18000) / 1000; 
    const totalShaftHeight = travel + ((data.overhead||0)/1000) + ((data.pit||0)/1000);
    
    const isHydraulic = String(data.model).includes('HYD') || String(data.model).includes('Home');
    
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
        if (q > 0) { // Solo agregamos si la cantidad es positiva
            materials[cat].items.push({ product, desc, qty: Number(q.toFixed(2)), unit });
        }
    };

    // 1. MACHINE ROOM
    add('Machine Room', 'Control', `Control Inteligente Alamex ${isHydraulic ? 'Hidráulico' : 'MRL'}, 220V`, qty, 'PZA');
    
    if (isHydraulic) {
        add('Machine Room', 'Central Hidráulica', 'Unidad de Poder Hidráulica con Válvula Electrónica', qty, 'PZA');
        add('Machine Room', 'Pistón', 'Pistón Hidráulico (Según recorrido)', qty, 'PZA');
        add('Machine Room', 'Bomba Hidráulica', 'Bomba compatible con pistón seleccionado', qty, 'PZA');
        add('Machine Room', 'Aceite Hidráulico', 'Tambor de Aceite Hidráulico', qty * 2, 'PZA'); 
    } else {
        add('Machine Room', 'Bancada', 'Incluido en el Kit de Chasis MRL-G', qty, 'PZA');
        add('Machine Room', 'Cable Tablero/máquina', '[CM4x10] Cable de Motor Multi Conducto', 7 * qty, 'm.');
        add('Machine Room', 'Regulador de Velocidad', `Regulador De Velocidad MRL ${data.speed} m/s`, qty, 'PZA');
        add('Machine Room', 'Máquina de Tracción', `Máquina Gearless ${data.capacity}kg`, qty, 'PZA');
    }

    // 2. PIT / FOSA
    add('Pit (Fosa)', 'Amortiguador de Fosa', '[02-AMO-ALAM-001-00] Amortiguador ALAM 01', 2 * qty, 'PZA');
    if (!isHydraulic) {
        // En hidráulico a veces no lleva bancada de amortiguador de contrapeso
        add('Pit (Fosa)', 'Bancada Amortiguador', 'Bancada Ajustable', 2 * qty, 'PZA');
    }
    add('Pit (Fosa)', 'Recolector de aceite', 'Recolector De Aceite', isHydraulic ? 1 * qty : 2 * qty, 'PZA');
    add('Pit (Fosa)', 'Escalera', '[ARME-F] Escalera para Fosa', 1 * qty, 'PZA');
    add('Pit (Fosa)', 'Stop de Fosa', 'Botón Stop Con Seguro Mecánico', 1 * qty, 'PZA');

    // 3. GUIDES / GUÍAS
    const railsQty = Math.ceil(totalShaftHeight / 5) * 2; 
    add('Guides (Guías)', 'Kit de riel de cabina', '[ARMK-R16] Kit De Riel 16 mm', railsQty * qty, 'PZA');
    
    if (!isHydraulic) {
        add('Guides (Guías)', 'Kit de riel de contrapeso', '[ARMK-R5] Kit de Riel 5 mm', railsQty * qty, 'PZA');
    }
    
    const bracketsQty = Math.ceil(totalShaftHeight / 1.5) * 2 * (isHydraulic ? 1 : 2); 
    add('Guides (Guías)', 'Grapas Cabina', 'Grapas Modelo 3 Para 16 mm', bracketsQty * qty, 'PZA');
    if (!isHydraulic) {
        add('Guides (Guías)', 'Grapas Contrapeso', 'Grapas Modelo 1 Para 5 mm', bracketsQty * qty, 'PZA');
    }
    
    add('Guides (Guías)', 'Soporte Cabina', 'Soporte de Riel', (Math.ceil(totalShaftHeight/1.5)) * qty, 'PZA');

    // 4. CABIN / CABINA
    add('Cabin (Cabina)', 'Cabina', `Cabina ${data.cabinModel} ${data.capacity}kg`, qty, 'PZA');
    add('Cabin (Cabina)', 'Chasis de cabina', isHydraulic ? 'Chasis Hidráulico Tipo Mochila' : 'Kit MRL/G 2 Alamex ajustable', qty, 'PZA');
    add('Cabin (Cabina)', 'COP', `[01-COP-CCAI] Botonera Cabina`, qty, 'PZA');
    add('Cabin (Cabina)', 'Cable COP', 'Cable de maniobra', 1 * qty, 'PZA');
    add('Cabin (Cabina)', 'Operador de puerta', `Operador ${data.doorType}`, qty, 'PZA');
    add('Cabin (Cabina)', 'Cortina de luz', 'Sensor de barrera infrarroja', qty, 'PZA');
    add('Cabin (Cabina)', 'Aceiteras', 'Aceitera Con Base', 4 * qty, 'PZA');
    add('Cabin (Cabina)', 'Sensor de carga', 'Báscula de pesaje', qty, 'PZA');
    
    if (!isHydraulic) {
        add('Cabin (Cabina)', 'Paracaídas', 'Paracaídas Progresivo', qty, 'PZA');
    } else {
        add('Cabin (Cabina)', 'Válvula Paracaídas', 'Válvula de ruptura (Rupture Valve)', qty, 'PZA');
    }

    // 5. CONTRAPESO (Solo tracción)
    if (!isHydraulic) {
        add('Counterweight', 'Anclas contra peso', 'Anclas de sujeción', 10 * qty, 'PZA');
        add('Counterweight', 'Marco de contra peso', 'Marco Chasis De Contra Peso', 1 * qty, 'PZA');
        add('Counterweight', 'Contra pesos', 'Bloques de hierro/concreto', 30 * qty, 'PZA');
    } else {
        add('Counterweight', 'Sistema Hidráulico', 'Sin contrapeso (Impulsión directa/indirecta)', 0, 'PZA');
    }

    // 6. CABLES DE ACERO (Solo tracción)
    if (!isHydraulic) {
        const tractionRopes = (totalShaftHeight + 10) * 5 * (data.traction === '2:1' ? 2 : 1);
        add('Steel Wires', 'Cables de Acero', `Cable ${data.traction === 'Bandas Planas (STM)' ? 'STM' : 'Acero'}`, tractionRopes * qty, 'm.');
        add('Steel Wires', 'Cable para regulador', 'Cable De Acero 6mm', (totalShaftHeight * 2 + 5) * qty, 'm.');
        add('Steel Wires', 'Pernos', 'Sujetadores de cable', 12 * qty, 'PZA');
    }

    // 7. CUBE / CUBO
    add('Cube (Cubo)', 'Cable viajero', 'Cable Viajero Plano', (travel + 15) * qty, 'm.');
    add('Cube (Cubo)', 'Cargador Cable viajero', 'Soporte de cable viajero', 2 * qty, 'PZA');
    add('Cube (Cubo)', 'Canaletas', 'Canaleta plástica', (totalShaftHeight) * qty, 'm.');

    // 8. LANDING / PISOS
    add('Landing (Pisos)', 'Puertas de piso', `Puerta ${data.doorType} ${data.doorWidth}x${data.doorHeight}`, stops * qty, 'PZA');
    add('Landing (Pisos)', 'LOP (Botonera)', 'Botonera de Pasillo', stops * qty, 'PZA');
    
    // 9. VARIOS
    add('Varios', 'Taquetes', 'Kit taquete expansivo', (stops * 8) * qty, 'PZA');
    add('Varios', 'Aceite Guías', 'Lubricante para rieles', 2 * qty, 'L.');

    return materials;
};