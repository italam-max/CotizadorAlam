// ARCHIVO: src/services/whatsappService.ts

export const WhatsappService = {
  
  /**
   * STUB: Configuración desactivada temporalmente para fase de pruebas.
   * Mantenemos la estructura para futura implementación.
   */
  getConfig: () => {
    return { token: '', url: '' };
  },

  formatPhone: (phone: string) => {
    return phone;
  },

  /**
   * Método Placeholder para envío de texto
   */
  sendMessage: async (to: string, body: string) => {
    console.log('WhatsApp Service: Módulo desactivado (Coming Soon).');
    // Simulamos una respuesta de fallo controlado para que la UI muestre el aviso
    return { 
        success: false, 
        message: 'Módulo WhatsApp en mantenimiento (Próximamente)' 
    };
  },

  /**
   * Método Placeholder para envío de PDF
   */
  sendPdf: async (to: string, base64Pdf: string, fileName: string, caption: string) => {
    console.log('WhatsApp Service: Envío de PDF desactivado.');
    
    // Retornamos una promesa resuelta con error controlado
    // Esto evita que la app se rompa si el usuario intenta enviar
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: false, 
                message: 'La integración con WhatsApp estará disponible próximamente.'
            });
        }, 500); // Pequeño delay para simular proceso
    });
  }
};