// ARCHIVO: src/services/calculations.ts
// CORRECCIÓN: Agregamos 'type'
import type { QuoteData } from '../types';

export const calculateMaterials = (data: QuoteData) => {
    const qty = data.quantity || 1;
    const stops = data.stops || 6;
    const travel = (data.travel || 18000) / 1000; 
    const totalShaftHeight = travel + ((data.overhead||0)/1000) + ((data.pit||0)/1000);
    
    const isHydraulic = String(data.model).includes('HYD');
    
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
        materials[cat].items.push({ product, desc, qty: Number(q.toFixed(2)), unit });
    };

    // 1. MACHINE ROOM
    add('Machine Room', 'Control', `Control Inteligente Alamex MRL, 220V 45A 11KW - Grupo: ${data.controlGroup}`, qty, 'PZA');
    
    if (isHydraulic) {
        add('Machine Room', 'Central Hidráulica', 'Unidad de Poder Hidráulica con Válvula Electrónica', qty, 'PZA');
        add('Machine Room', 'Pistón', 'Pistón Hidráulico (Según recorrido)', qty, 'PZA');
    } else {
        add('Machine Room', 'Pistón', 'NO APLICA', 0, 'PZA');
        add('Machine Room', 'Bancada', 'Incluido en el Kit de Chasis MRL-G', qty, 'PZA');
        add('Machine Room', 'Cable Tablero/máquina', '[CM4x10] Cable de Motor Multi Conducto 4x10 + 4x1.5 + 7x0.5 mm', 7 * qty, 'm.');
        add('Machine Room', 'Regulador de Velocidad', `[04-REG-POB-1.6/30] Regulador De Velocidad MRL ${data.speed} m/s. - 30 cm. Polea Abajo`, qty, 'PZA');
    }

    // 2. PIT / FOSA
    add('Pit (Fosa)', 'Amortiguador de Fosa', '[02-AMO-ALAM-001-00] Amortiguador ALAM 01', 2 * qty, 'PZA');
    add('Pit (Fosa)', 'Bancada Amortiguador', '[ARMB-AA] Bancada Ajustable para Amortiguador de Pozo', 2 * qty, 'PZA');
    add('Pit (Fosa)', 'Recolector de aceite', '[02-REC-ACE-0001] Recolector De Aceite', 4 * qty, 'PZA');
    add('Pit (Fosa)', 'Escalera', '[ARME-F] Escalera para Fosa', 1 * qty, 'PZA');
    add('Pit (Fosa)', 'Stop de Fosa', '[04-BOT-STP-MEC-00001] Botón Stop Con Seguro Mecánico con caja', 1 * qty, 'PZA');

    // 3. GUIDES / GUÍAS
    const railsQty = Math.ceil(totalShaftHeight / 5) * 2; 
    add('Guides (Guías)', 'Kit de riel de cabina', '[ARMK-R16] Kit De Riel 16 mm 90x75x16 mm T90', railsQty * qty, 'PZA');
    add('Guides (Guías)', 'Kit de riel de contrapeso', '[ARMK-R5] Kit de Riel 5 mm 50x50x5 mm T50', railsQty * qty, 'PZA');
    
    const bracketsQty = Math.ceil(totalShaftHeight / 1.5) * 2 * 2; 
    add('Guides (Guías)', 'Grapas Cabina', '[02-GPR-M03-0016] Grapas Modelo 3 Para 16 mm', bracketsQty * qty, 'PZA');
    add('Guides (Guías)', 'Grapas Contrapeso', '[02-GRP-M01-0005] Grapas Modelo 1 Para 5 mm', bracketsQty * qty, 'PZA');
    add('Guides (Guías)', 'Soporte Cabina', '[ARMS-2000] Soporte 2000 Contra Peso Alado Grande con Grapas', (Math.ceil(totalShaftHeight/1.5)) * qty, 'PZA');
    add('Guides (Guías)', 'Soporte Contra Peso', 'Incluído en el Kit de soportes', 0, 'PZA');

    // 4. CABIN / CABINA
    add('Cabin (Cabina)', 'Cabina', `[04-ASC-CLX102B-${data.doorWidth}-2CC] Cabina Estándar Inox 304 mate, 1000 Kg, ${data.doorWidth}x${data.doorHeight}mm`, qty, 'PZA');
    add('Cabin (Cabina)', 'Chasis de cabina', 'Kit MRL/G 2 Alamex ajustable 1000 Kg.', qty, 'PZA');
    add('Cabin (Cabina)', 'COP', `[01-COP-CCAI] COP Serial para Control Alamex Inteligente`, qty, 'PZA');
    add('Cabin (Cabina)', 'Cable COP', 'Cable cop 10 m. incluido', 1 * qty, 'PZA');
    add('Cabin (Cabina)', 'Operador de puerta', `[04-2CC-CLX101-${data.doorWidth}x${data.doorHeight}] Puerta de Cabina Inox Mate, 2 hojas, central`, qty, 'PZA');
    add('Cabin (Cabina)', 'Cortina de luz', '[01-COR-LUZ-0001] Cortina De Luz 110 a 220v.ac /24 v.dc', qty, 'PZA');
    add('Cabin (Cabina)', 'Aceiteras', '[07-ACE-BASE-0001] Aceitera Con Base', 4 * qty, 'PZA');
    add('Cabin (Cabina)', 'Zapatas', 'INCLUIDO EN EL KIT DE CHASIS MRL-G', 0, 'PZA');
    add('Cabin (Cabina)', 'Sensor de carga', '[04-BAS-BDEC-350-22] Báscula debajo de la Cabina 3200 Kg', qty, 'PZA');
    add('Cabin (Cabina)', 'Paracaídas', '[02-PAR-PRA-0916] Paracaídas Progresivo 2500 Kg Ajustable', qty, 'PZA');
    add('Cabin (Cabina)', 'Caja de inspección', '[01-CAJ-INSP-ALA-IN] Caja de inspección para control Alamex inteligente', qty, 'PZA');
    add('Cabin (Cabina)', 'Anclas Cabina', '[02-ANC-NEG-0013] Anclas 13 mm Cable 12-13', 10 * qty, 'PZA');

    // 5. CONTRAPESO
    add('Counterweight', 'Anclas contra peso', '[02-ANC-NEG-0013] Anclas 13 mm Cable 12-13', 10 * qty, 'PZA');
    add('Counterweight', 'Marco de contra peso', 'Marco Chasis De Contra Peso MRLG Alamex', 1 * qty, 'PZA');
    add('Counterweight', 'Contra pesos', '[02-120-0155-760-50] Pieza de Contrapeso 120x155x760mm - 50Kg', 30 * qty, 'PZA');

    // 6. CABLES DE ACERO
    const tractionRopes = (totalShaftHeight + 10) * 5 * (data.traction === '2:1' ? 2 : (data.traction === '4:1' ? 4 : 1));
    add('Steel Wires', 'Cables de Acero', '[02-CBL-ACE-0013] Cable de Acero de 13 mm con Núcleo de Fibra Natural SISAL', tractionRopes * qty, 'm.');
    add('Steel Wires', 'Cable para regulador', '[02-CBL-ACE-0006] Cable De Acero de 6 mm Para Regulador con Núcleo de Fibra Natural SISAL', (totalShaftHeight * 2 + 5) * qty, 'm.');
    add('Steel Wires', 'Pernos', '[ARMP-HCA1/2] Perro de Hierro para Cable de Acero de 1/2', 60 * qty, 'PZA');
    add('Steel Wires', 'Pernos Regulador', '[AMRP-HCA1/4] Perro de Hierro para Cable de Acero de 1/4', 6 * qty, 'PZA');

    // 7. CUBE / CUBO
    add('Cube (Cubo)', 'Cable viajero', '[03-CBL-V40-75MM] Cable Viajero 40 x 0.75 mm. Plano', (travel + 15) * qty, 'm.');
    add('Cube (Cubo)', 'Cargador Cable viajero', '[02-BSE-CBL-VIAJ] Cargador De Cable Viajero', 4 * qty, 'PZA');
    add('Cube (Cubo)', 'Cable de cobre #20 AWG', '[03-CBL-C20-AZUL] Cable de Cobre Calibre 20 AWG azul', 100 * qty, 'm.');
    add('Cube (Cubo)', 'Sensor sismico', '[01-SEN-SDS-S3EJ] Sensor Detector Sísmico-Soporte 3Ejes', 0, 'PZA');
    add('Cube (Cubo)', 'Arnés de piso (Inter)', '[02-CBL-ECEP-04M-00] Cable de arnés con enchufes para chapas entre pisos 4 metros', (stops - 1) * qty, 'PZA');
    add('Cube (Cubo)', 'Arnés de piso (Final)', '[02-CBL-ECEP-10M-00] Cable de arnés con enchufes para chapas entre pisos 10 metros', 1 * qty, 'PZA');

    // 8. LANDING / PISOS
    add('Landing (Pisos)', 'Puertas de piso', `[04-2LC-CLX101-${data.doorWidth}x${data.doorHeight}] Puerta de Piso Acero Inoxidable Mate, 2 hojas`, stops * qty, 'PZA');
    add('Landing (Pisos)', 'LOP 1 botón', '[01-BOT-LOPS-INT-B1] LOP Serial Para Control Alamex Inteligente con Display Bajada', 2 * qty, 'PZA');
    add('Landing (Pisos)', 'LOP 2 botones', '[01-BOT-LOPS-INT-2B] LOP Serial Para Control Alamex Inteligente con Display 2 Botones', (stops - 2) * qty, 'PZA');
    add('Landing (Pisos)', 'Cable LOP 3.5 m.', '[03-CBL-SERI-LOP-06] Cable Serial LOP Para Control Alamex Inteligente LOP-LOP 6m', (stops - 1) * qty, 'PZA');
    add('Landing (Pisos)', 'Cable LOP 10 m.', '[03-CBL-SERI-LOP-10] Cable Serial LOP Para Control Alamex Inteligente LOP 10m', 1 * qty, 'PZA');
    add('Landing (Pisos)', 'Alarma contra incendio', '[04-ALA-INCE-110-00] Alarma de incendios', 1 * qty, 'PZA');

    // 9. MAGNET / IMANES
    add('Magnet (Imanes)', 'Imán Rectangular 10cm', '[ARMI-R10] Imán Rectangular 10 cm', 0, 'PZA');
    add('Magnet (Imanes)', 'Imán Rectangular 30cm', '[ARMI-R30] Imán Rectangular 30 cm', stops * qty, 'PZA');
    add('Magnet (Imanes)', 'Imán Redondo', '[ARMI-R] Imán Redondo', 4 * qty, 'PZA');

    // 10. VARIOS
    add('Varios', 'Taquetes', 'Kit taquete Taquete 12.7 mm (1/2) Plateado', (stops * 11) * qty, 'PZA');
    add('Varios', 'Micros', '[ARElS-SP-LLG] Switch Sobre Paso Llanta Grande', 2 * qty, 'PZA');
    add('Varios', 'Puertas Manuales', '[ARElC-T110] Cam Tractil 110 VDC 60X11X6', 0, 'PZA');
    add('Varios', 'Gomas de cabina', '[ARMG-DTC] Goma Doble Tornillo Para Cabina', 8 * qty, 'PZA');
    add('Varios', 'Aire acondicionado', '[04-AIR-ACO-220V] Aire Acondicionado Para Elevadores -220V', 0, 'PZA');

    return materials;
};