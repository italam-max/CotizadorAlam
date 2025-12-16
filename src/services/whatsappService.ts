// ARCHIVO: src/services/whatsappService.ts

export const WhatsappService = {
  
    getConfig: () => {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings);
          let url = parsed.whapiUrl || 'https://gate.whapi.cloud/messages/text';
          
          // Limpieza de URL
          url = url.trim();
          if (url.endsWith('/')) url = url.slice(0, -1);
          
          return {
              token: parsed.whapiToken || '',
              url: url
          };
        } catch (e) {
          return { token: '', url: '' };
        }
      }
      return { token: '', url: '' };
    },
  
    formatPhone: (phone: string) => {
      let clean = phone.replace(/\D/g, '');
      if (clean.length === 10) return `521${clean}`;
      return clean;
    },
  
    /**
     * Envía SOLO TEXTO
     */
    sendMessage: async (to: string, body: string) => {
      const { token, url } = WhatsappService.getConfig();
      if (!token || !url) throw new Error("Falta configuración de Whapi.");
  
      const formattedTo = WhatsappService.formatPhone(to);
  
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
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error Whapi (${response.status})`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        throw error;
      }
    },
  
    /**
     * NUEVO: Envía DOCUMENTO PDF (Base64)
     */
    sendPdf: async (to: string, base64Pdf: string, fileName: string, caption: string) => {
      const { token, url } = WhatsappService.getConfig();
      if (!token || !url) throw new Error("Falta configuración de Whapi.");
  
      // TRUCO: Cambiamos el endpoint de /text a /document automáticamente
      // Si la URL configurada es .../messages/text, la pasamos a .../messages/document
      const docUrl = url.replace('/messages/text', '/messages/document');
  
      const formattedTo = WhatsappService.formatPhone(to);
  
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          to: formattedTo,
          media: `data:application/pdf;base64,${base64Pdf}`, // Whapi necesita el prefijo data URI
          filename: fileName,
          caption: caption // El texto va junto con el archivo
        })
      };
  
      try {
        console.log(`📡 Enviando PDF a: ${docUrl}`);
        const response = await fetch(docUrl, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error Whapi Doc (${response.status})`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error enviando PDF WhatsApp:', error);
        throw error;
      }
    }
  };