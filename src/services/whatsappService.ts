// ARCHIVO: src/services/whatsappService.ts

export const WhatsappService = {
  
    /**
     * Obtiene la configuración (Token y URL) directamente del localStorage
     * para asegurar que siempre use los datos más recientes guardados por el usuario.
     */
    getConfig: () => {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings);
          return {
              token: parsed.whapiToken || '',
              // Si el usuario borró la URL o es antigua, usamos la default por seguridad
              url: parsed.whapiUrl || 'https://gate.whapi.cloud/messages/text'
          };
        } catch (e) {
          // En caso de error de lectura, retornamos valores vacíos
          return { token: '', url: '' };
        }
      }
      return { token: '', url: '' };
    },
  
    /**
     * Limpia y formatea el número telefónico para WhatsApp.
     * Regla principal: Solo números.
     * Regla México: Si son 10 dígitos (ej. 5512345678), agrega 521 al inicio.
     */
    formatPhone: (phone: string) => {
      // Quitamos todo lo que no sea número (guiones, paréntesis, espacios)
      let clean = phone.replace(/\D/g, '');
      
      // Ajuste para números de México (10 dígitos)
      // Whapi requiere formato internacional. Para México celular es 52 + 1 + 10 dígitos
      if (clean.length === 10) {
          return `521${clean}`;
      }
      
      // Si el número ya trae código de país (ej. 5255...) o es de otro lado, lo dejamos igual
      return clean;
    },
  
    /**
     * Envía un mensaje de texto simple a través de la API de Whapi.
     */
    sendMessage: async (to: string, body: string) => {
      // 1. Obtenemos credenciales frescas
      const { token, url } = WhatsappService.getConfig();
      
      // 2. Validaciones básicas antes de intentar enviar
      if (!token) {
        throw new Error("Falta el Token de Whapi. Ve a Configuración > Integraciones.");
      }
      if (!url) {
          throw new Error("Falta la URL de Whapi. Ve a Configuración > Integraciones.");
      }
  
      // 3. Preparamos el número
      const formattedTo = WhatsappService.formatPhone(to);
  
      // 4. Configuración del Request
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          typing_time: 0,
          to: formattedTo,
          body: body
        })
      };
  
      try {
        // 5. Ejecutamos la petición
        const response = await fetch(url, options);
        
        // 6. Manejo de errores de la API (401, 400, 500)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Intentamos obtener el mensaje de error de Whapi, o ponemos uno genérico
          throw new Error(errorData.message || `Error Whapi (Status: ${response.status})`);
        }
  
        // 7. Retornamos éxito
        return await response.json();
  
      } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        throw error; // Re-lanzamos el error para que el componente (UI) lo muestre
      }
    }
  };