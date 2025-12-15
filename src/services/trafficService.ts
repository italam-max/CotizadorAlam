// ARCHIVO: src/services/trafficService.ts

export const TRAFFIC_PRESETS = {
  Residencial: { intervalStandard: 60, intervalExcellent: 40, hcStandard: 5, hcExcellent: 8, occupancyDefault: 3.5 },
  Oficinas: { intervalStandard: 45, intervalExcellent: 25, hcStandard: 11, hcExcellent: 15, densityDefault: 10 },
  Hotel: { intervalStandard: 60, intervalExcellent: 40, hcStandard: 8, hcExcellent: 12, occupancyDefault: 2 },
  Hospital: { intervalStandard: 50, intervalExcellent: 35, hcStandard: 10, hcExcellent: 14, occupancyDefault: 2 }
};

export const calculateTrafficAnalysis = (inputs: any) => {
  const { type, floors, travelMeters, areaPerFloor, unitsPerFloor, occupantsPerUnit } = inputs;
  let totalPopulation = 0;
  
  // CORRECCIÓN: TypeScript seguro con type assertion
  const targets = TRAFFIC_PRESETS[type as keyof typeof TRAFFIC_PRESETS];
  
  if (type === 'Oficinas') {
    // Usamos 'as any' para acceder a densityDefault que solo existe en Oficinas
    totalPopulation = Math.ceil((areaPerFloor * floors) / (TRAFFIC_PRESETS.Oficinas as any).densityDefault);
  } else {
    // Usamos 'as any' para acceder a occupancyDefault de forma segura
    const occ = occupantsPerUnit || (targets as any).occupancyDefault;
    totalPopulation = Math.ceil(unitsPerFloor * occ * floors);
  }

  if (totalPopulation === 0) return null;

  const simulate = (elevCount: number, speed: number, capacityKg: number) => {
    const capacityPers = Math.floor(capacityKg / 75);
    const probStops = floors * 0.7; 
    const tFlight = (2 * travelMeters) / speed;
    const tStops = probStops * (3.0 + (speed < 1.5 ? 2 : 1.5)); 
    const tTransfer = 1.2 * capacityPers * 0.8; 
    const RTT = tFlight + tStops + tTransfer + (totalPopulation * 0.01);
    
    const interval = RTT / elevCount;
    const HC_5min = (300 * capacityPers * 0.8 * elevCount) / RTT;
    const HC_Percent = (HC_5min / totalPopulation) * 100;

    return {
      elevators: elevCount,
      speed,
      capacity: capacityKg,
      persons: capacityPers,
      interval: parseFloat(interval.toFixed(1)),
      hcPercent: parseFloat(HC_Percent.toFixed(1)),
      rtt: parseFloat(RTT.toFixed(1))
    };
  };

  const commonSpeeds = [1.0, 1.6, 1.75, 2.0, 2.5];
  const commonCaps = [630, 800, 1000, 1250, 1600];

  let standard: any = null;
  let excellent: any = null;

  for (let n = 1; n <= 8; n++) {
    for (let s of commonSpeeds) {
      for (let c of commonCaps) {
        const res = simulate(n, s, c);
        
        // CORRECCIÓN: Acceso seguro a las propiedades del target
        if (!standard && res.interval <= (targets as any).intervalStandard) {
           standard = { 
               ...res, 
               label: 'NIVEL ESTÁNDAR', 
               color: 'orange', 
               pros: ['Inversión inicial baja', 'Cumple normativa básica'],
               cons: ['Mayor tiempo de espera en hora pico', 'Posible saturación rápida', 'Menor confort de viaje']
           };
        }
        
        if (!excellent && res.interval <= (targets as any).intervalExcellent && res.hcPercent >= (targets as any).hcExcellent) {
           excellent = { 
               ...res, 
               label: 'NIVEL EXCELENTE', 
               color: 'green',
               pros: ['Tráfico fluido garantizado', 'Mínimo tiempo de espera', 'Mayor vida útil del equipo', 'Ahorro energético optimizado'],
               cons: ['Inversión inicial mayor']
           };
        }

        if (standard && excellent && (standard.elevators !== excellent.elevators || standard.speed !== excellent.speed)) break;
      }
      if (standard && excellent && (standard.elevators !== excellent.elevators || standard.speed !== excellent.speed)) break;
    }
    if (standard && excellent && (standard.elevators !== excellent.elevators || standard.speed !== excellent.speed)) break;
  }
  
  if (!standard) standard = { ...simulate(2, 1.0, 630), label: 'INSUFICIENTE', color: 'red', pros:[], cons:['No cumple criterios mínimos'] };
  if (excellent && standard && excellent.elevators === standard.elevators && excellent.speed === standard.speed) {
      const betterRes = simulate(standard.elevators + 1, standard.speed, standard.capacity);
      excellent = { ...betterRes, label: 'NIVEL EXCELENTE', color: 'green', pros: ['Cero esperas', 'Redundancia operativa'], cons: [] };
  }

  return { population: totalPopulation, standard, excellent };
};