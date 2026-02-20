// ARCHIVO: server/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import PdfPrinter from 'pdfmake';
// import axios from 'axios'; // Desactivamos axios temporalmente para ahorrar recursos

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CONFIGURACIÓN PDF ---
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
const printer = new PdfPrinter(fonts);

// --- GENERADOR DE PDF (Lógica Preservada) ---
const generatePdfBinary = (formData) => {
  return new Promise((resolve, reject) => {
    try {
        const docDefinition = {
        content: [
            { text: 'COTIZACIÓN ALAMEX ELEVADORES', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },
            { text: `Cliente: ${formData.clientName || 'N/A'}`, margin: [0, 5] },
            { text: `Proyecto: ${formData.projectRef || 'Sin Ref'}`, margin: [0, 5] },
            { text: `Fecha: ${formData.projectDate || new Date().toLocaleDateString()}`, margin: [0, 20] },
            {
            table: {
                widths: ['*', 'auto'],
                body: [
                [{ text: 'Descripción', bold: true }, { text: 'Valor', bold: true }],
                ['Modelo', formData.model || '-'],
                ['Capacidad', `${formData.capacity || 0} kg`],
                ['Paradas', (formData.stops || 0).toString()],
                ['Velocidad', `${formData.speed || 0} m/s`],
                ]
            }
            },
            { text: 'Este documento es una propuesta preliminar generada automáticamente.', margin: [0, 30], italics: true, fontSize: 10 }
        ],
        styles: {
            header: { fontSize: 18, bold: true }
        }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        let chunks = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.end();
    } catch (error) {
        reject(error);
    }
  });
};

// --- ENDPOINT ENVÍO WHATSAPP (MODO: PRÓXIMAMENTE) ---
app.post('/api/share/send', async (req, res) => {
  // Mantenemos la estructura para recibir los datos, pero no procesamos el envío externo
  const { formData, method } = req.body;

  try {
    // Aún generamos el PDF para asegurar que esa lógica no tiene errores de sintaxis
    // Esto sirve como "Test silencioso" de la generación de documentos
    await generatePdfBinary(formData);

    if (method === 'whatsapp') {
      console.log(`[INFO] Solicitud de envío recibida para: ${formData.projectRef}. Módulo en pausa.`);
      
      // Respuesta "Fake" o de Mantenimiento
      return res.json({ 
        success: false, // Marcamos false para que el frontend muestre el aviso
        message: 'El servicio de envío está deshabilitado temporalmente para mantenimiento.',
        // No devolvemos chatData simulado para no confundir al usuario
      });
    }

    res.status(400).json({ success: false, message: 'Método no soportado' });

  } catch (error) {
    console.error('Error interno (Stub):', error.message);
    res.status(500).json({ success: false, error: 'Error en el servidor de documentos.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} (Modo: Pruebas/Stub)`);
});