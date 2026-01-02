// ARCHIVO: src/features/quoter/types.ts

// 👇 ¡ESTA PALABRA 'export' ES LA CLAVE!
export type ElevatorType = 'MR' | 'MRL' | 'Hidráulico' | 'Panorámico';

export interface QuoteData {
  capacidad: string;
  personas: number;
  velocidad: string;
  paradas: number;
  recorridos: string;
  precio_base: number;
  moneda: 'USD' | 'MXN';
}

export interface ConfigItem {
  id: string | number;
  parametro: string;
  valor: string;
  observaciones?: string;
}