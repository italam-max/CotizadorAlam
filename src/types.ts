// ARCHIVO: src/types.ts

// Perfil de Usuario (Supabase)
export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: 'admin' | 'user'; // Rol para permisos
    job_title?: string;     // Ej: "Ejecutivo de Ventas"
  }
  
  // --- NUEVA INTERFAZ: Condiciones Comerciales ---
  // Estos son los campos editables para el contrato/PDF
  export interface CommercialTerms {
    paymentMethod: string;    // Ej: "50% Anticipo - 50% Contra Entrega"
    deliveryTime: string;     // Ej: "10-12 Semanas hábiles"
    warranty: string;         // Ej: "12 Meses en partes"
    validity: string;         // Ej: "30 días naturales"
    currency: string;         // Ej: "MXN"
    generalConditions: string; // Texto largo para obra civil, permisos, etc.
  }
  
  // Datos de la Cotización Principal
  export interface QuoteData {
    id: number | string;      // ID único (number para DB, string para temporales)
    projectRef: string;       // Nombre del Proyecto / Referencia
    clientName: string;       // Nombre del Cliente
    projectDate: string;      // Fecha de creación (YYYY-MM-DD)
    
    // Estados del Flujo de Venta
    status: 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada' | 'Sincronizado' | 'Por Seguimiento';
    
    // Especificaciones Técnicas Básicas
    model: string;            // Ej: "MRL-G", "Home Lift"
    quantity: number;         // Cantidad de equipos
    stops: number;            // Paradas / Niveles
    capacity: number;         // Carga en Kg
    speed: number | string;   // Velocidad en m/s
    price: number;            // Precio Unitario
    
    // Especificaciones Adicionales (Opcionales)
    travel?: number;          // Recorrido en mm
    doorWidth?: number;       // Ancho de puerta (800, 900, etc.)
    persons?: number;         // Capacidad personas
    controlGroup?: string;    // Simplex, Duplex, etc.
    
    // Campos de Sistema
    currentStage?: number;    // Para el ProjectTracker (1-5)
    updated_at?: string;      // Timestamp de última modificación
  
    // --- CAMPO NUEVO ---
    // Objeto con las condiciones comerciales personalizadas
    commercialTerms?: CommercialTerms;
  }

  // ARCHIVO: src/types.ts

// ... (UserProfile y CommercialTerms se mantienen igual) ...

export interface CommercialTerms {
    paymentMethod: string;
    deliveryTime: string;
    warranty: string;
    validity: string;
    currency: string;
    generalConditions: string;
  }
  
  export interface QuoteData {
    id: number | string;
    status: 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada' | 'Sincronizado' | 'Por Seguimiento';
    
    // 1. GENERALES
    projectRef: string;
    clientName: string;
    contactEmail?: string; // Nuevo
    contactPhone?: string; // Nuevo
    projectDate: string;
    
    // 2. MÁQUINA Y DESEMPEÑO
    model: string;
    quantity: number;
    capacity: number;       // kg
    persons?: number;       // Pasajeros
    speed: number | string; // m/s
    traction?: string;      // Nuevo: "1:1", "2:1", "4:1"
    price: number;
  
    // 3. CUBO Y RECORRIDO
    stops: number;
    travel?: number;        // mm
    pit?: number;           // Nuevo: Fosa (mm)
    overhead?: number;      // Nuevo: Huida (mm)
    shaftWidth?: number;    // Nuevo: Ancho Cubo
    shaftDepth?: number;    // Nuevo: Fondo Cubo
    shaftType?: string;     // Nuevo: "Concreto", "Estructura"
    constructionReq?: boolean; // Nuevo: Obra civil requerida
  
    // 4. CABINA Y PUERTAS
    cabinModel?: string;    // Nuevo: "ASC Estándar", etc.
    cabinFinish?: string;   // Nuevo: "Inox", "Epoxy"
    cabinFloor?: string;    // Nuevo: "Granito", "Goma"
    doorType?: string;      // Nuevo: "Automática Central", "Telescópica"
    doorWidth?: number;     // mm
    doorHeight?: number;    // Nuevo: mm (2000, 2100)
    doorFinish?: string;    // Nuevo: Acabado puertas
  
    // 5. NORMATIVA Y ACCESORIOS
    norm?: string;          // Nuevo: "EN 81-20", "EN 81-1"
    fireRating?: boolean;   // Nuevo: Resistente al fuego
    lop?: string;           // Nuevo: Botonera Pasillo
    cop?: string;           // Nuevo: Botonera Cabina
    installation?: boolean; // Nuevo: Incluye instalación
    counterweightPos?: string; // Nuevo: "Fondo", "Lateral"
    handrail?: string;      // Nuevo: Tipo de pasamanos
    nomenclature?: string;  // Nuevo: PB, 1, 2...
  
    currentStage?: number;
    updated_at?: string;
    commercialTerms?: CommercialTerms;
  }