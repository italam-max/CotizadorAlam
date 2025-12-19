// ARCHIVO: api/webhook.js
import axios from 'axios';

// 1. CONFIGURA AQUÍ LOS NÚMEROS REALES DE TUS EMPLEADOS
// (A estos números les llegará la alerta de WATI)
const AGENTES = {
  facturacion: '5215585338124', // <--- CAMBIA ESTO por el celular real de Facturación
  ventas: '5215585338124'       // <--- CAMBIA ESTO por el celular real de Ventas
};

export default async function handler(req, res) {
  // --- A. VERIFICACIÓN CON META (MÉTODO GET) ---
  // Esto servirá cuando conectes el número real de Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
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
    const body = req.body;
    console.log("📨 Webhook recibido:", JSON.stringify(body, null, 2));
    console.log("DEBUG VARIABLES:", {
        hasUrl: !!process.env.WATI_API_ENDPOINT,
        hasToken: !!process.env.WATI_ACCESS_TOKEN,
        endpoint: process.env.WATI_API_ENDPOINT // Para ver si la URL está bien formada
      });

    try {
        // Verificar si es un mensaje entrante de Meta (o simulación)
        if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            
            const value = body.entry[0].changes[0].value;
            const message = value.messages[0];

            if (message.type === 'text') {
                const fromPhone = message.from; // El cliente que escribe
                const textBody = message.text.body.toLowerCase(); // Lo que escribió
                const clienteNombre = value.contacts?.[0]?.profile?.name || 'Cliente';

                console.log(`📝 Cliente (${fromPhone}) dice: ${textBody}`);

                // --- 1. LÓGICA DE CLASIFICACIÓN ---
                let targetPhone = AGENTES.ventas; // Por defecto
                let depto = "Ventas";

                if (textBody.includes('factura') || textBody.includes('cfdi') || textBody.includes('pago')) {
                    targetPhone = AGENTES.facturacion;
                    depto = "Facturación";
                } else if (textBody.includes('refaccion') || textBody.includes('parte')) {
                    targetPhone = AGENTES.ventas; 
                    depto = "Refacciones";
                }

                // --- 2. ENVIAR ALERTA USANDO WATI ---
                if (process.env.WATI_API_ENDPOINT && process.env.WATI_ACCESS_TOKEN) {
                    
                    // Preparamos el mensaje de alerta interna
                    const internalAlert = `🔔 *ALERTA ALAMEX: ${depto}*\n\n👤 *Cliente:* ${clienteNombre}\n📱 *Tel:* +${fromPhone}\n📄 *Mensaje:* "${textBody}"\n\n👉 *Da clic para atender:* https://wa.me/${fromPhone}`;

                    // NOTA: WATI tiene diferentes endpoints. 
                    // Si tu endpoint termina en /sendSessionMessage, usa este formato:
                    try {
                        const watiUrl = `${process.env.WATI_API_ENDPOINT}/api/v1/sendSessionMessage/${targetPhone}?messageText=${encodeURIComponent(internalAlert)}`;
                        
                        await axios.post(watiUrl, {}, {
                            headers: { 
                                'Authorization': `Bearer ${process.env.WATI_ACCESS_TOKEN}` 
                            }
                        });
                        console.log(`✅ Alerta enviada a ${depto} por WATI`);
                        
                    } catch (watiError) {
                        // Si falla, intentamos el formato genérico de envío de texto
                        console.log("Intentando método alternativo WATI...");
                        await axios.post(
                            process.env.WATI_API_ENDPOINT, // Usamos la URL base directa
                            {
                                "number": targetPhone,
                                "message": internalAlert
                            },
                            { 
                                headers: { 'Authorization': `Bearer ${process.env.WATI_ACCESS_TOKEN}` } 
                            }
                        );
                    }

                } else {
                    console.error("⚠️ Faltan variables WATI_API_ENDPOINT o WATI_ACCESS_TOKEN en Vercel");
                }
            }
        }
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error("Error en webhook:", e.message);
        return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}