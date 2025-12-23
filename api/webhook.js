// ARCHIVO: api/webhook.js
import axios from 'axios';

// 1. CONFIGURACIÓN DE AGENTES (NÚMEROS REALES)
// Usa el formato 521 + 10 dígitos (ej. 5215512345678)
const AGENTES = {
  facturacion: '5215585338124', // <--- Poner celular real de Facturación
  ventas: '5215585338124'       // <--- Poner celular real de Ventas
};

export default async function handler(req, res) {
  // --- A. VERIFICACIÓN CON META (MÉTODO GET) ---
  // Esto se usa cuando configures el Webhook en el panel de Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Define esta misma contraseña en el panel de Meta al configurar
    const VERIFY_TOKEN = 'alamex_secreto_2024';

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Token incorrecto' });
      }
    }
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  // --- B. RECEPCIÓN DE MENSAJES (MÉTODO POST) ---
  if (req.method === 'POST') {
    let body = req.body;

    // 1. CORRECCIÓN CRÍTICA: Parsear si llega como texto
    // Esto soluciona el error que veías en los logs de Vercel
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("❌ Error parseando body JSON:", e);
        return res.status(400).send("Invalid JSON");
      }
    }

    console.log("📨 Webhook procesado:", JSON.stringify(body, null, 2));

    try {
      // Verificar estructura del mensaje de WhatsApp (Meta)
      if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {

        const value = body.entry[0].changes[0].value;
        const message = value.messages[0];

        // Solo procesamos mensajes de texto
        if (message.type === 'text') {
          const fromPhone = message.from; // Número del cliente
          const textBody = message.text.body.toLowerCase(); // Texto del mensaje
          const clienteNombre = value.contacts?.[0]?.profile?.name || 'Cliente';

          console.log(`📝 Cliente (${fromPhone}) dice: ${textBody}`);

          // --- 2. LÓGICA DE ENRUTAMIENTO (Tus reglas) ---
          let targetPhone = AGENTES.ventas; // Default
          let depto = "Ventas";

          if (textBody.includes('factura') || textBody.includes('cfdi') || textBody.includes('pago')) {
            targetPhone = AGENTES.facturacion;
            depto = "Facturación";
          } else if (textBody.includes('refaccion') || textBody.includes('parte') || textBody.includes('mantenimiento')) {
            targetPhone = AGENTES.ventas; // O el número de refacciones si tienes uno diferente
            depto = "Refacciones";
          }

          // --- 3. ENVIAR ALERTA INTERNA (WATI) ---
          if (process.env.WATI_API_ENDPOINT && process.env.WATI_ACCESS_TOKEN) {

            // Mensaje que le llegará al empleado
            const internalAlert = `🔔 *ALERTA ALAMEX: ${depto}*\n\n👤 *Cliente:* ${clienteNombre}\n📱 *Tel:* +${fromPhone}\n📄 *Mensaje:* "${textBody}"\n\n👉 *Da clic para atender:* https://wa.me/${fromPhone}`;

            // Limpiamos la URL por si tiene barra al final
            const baseUrl = process.env.WATI_API_ENDPOINT.replace(/\/$/, '');
            
            // Construcción de la URL de WATI
            const watiUrl = `${baseUrl}/api/v1/sendSessionMessage/${targetPhone}?messageText=${encodeURIComponent(internalAlert)}`;

            console.log(`🚀 Enviando alerta a WATI...`);

            await axios.post(watiUrl, {}, {
              headers: {
                'Authorization': `Bearer ${process.env.WATI_ACCESS_TOKEN}`
              }
            });

            console.log(`✅ Alerta enviada exitosamente a ${depto} (${targetPhone})`);

          } else {
            console.error("⚠️ Faltan variables WATI_API_ENDPOINT o WATI_ACCESS_TOKEN en Vercel");
          }
        }
      }
      
      // Siempre respondemos 200 a Meta para confirmar recepción
      return res.status(200).json({ success: true });

    } catch (e) {
      console.error("❌ Error en lógica del webhook:", e.message);
      // Respondemos 200 para que Meta no siga reintentando si fue un error nuestro
      return res.status(200).json({ error: e.message });
    }
  }

  // Método no permitido
  return res.status(405).json({ error: 'Method not allowed' });
}