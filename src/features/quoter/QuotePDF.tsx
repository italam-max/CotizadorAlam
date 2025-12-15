// ARCHIVO: src/features/quoter/QuotePDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { QuoteData, UserProfile } from '../../types';

// Definimos los estilos
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 0,
  },
  // --- PORTADA ---
  coverContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverHeader: {
    backgroundColor: '#1e3a8a', // Azul Alamex
    height: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    justifyContent: 'space-between'
  },
  coverLogo: {
    width: 80,
    height: 'auto',
  },
  coverTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  coverBody: {
    padding: 40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: 300,
    height: 400,
    objectFit: 'contain',
    marginBottom: 30,
  },
  projectTitle: {
    fontSize: 32,
    color: '#1e3a8a',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  coverFooter: {
    backgroundColor: '#eab308', // Amarillo Alamex
    height: 15,
  },

  // --- PÁGINA DE CONTENIDO ---
  contentContainer: {
    padding: 40,
  },
  headerSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1e3a8a',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  // Tabla
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 24,
    alignItems: 'center',
  },
  tableCellKey: {
    width: '40%',
    padding: 5,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  tableCellValue: {
    width: '60%',
    padding: 5,
    fontSize: 10,
    color: '#1e293b',
  },
  
  // Precio
  priceBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eff6ff', 
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
  },
  priceText: {
    fontSize: 12,
    color: '#1e3a8a',
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'right',
  },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  }
});

interface QuotePDFProps {
  data: QuoteData;
  userProfile?: UserProfile | null;
}

export const QuotePDFDocument = ({ data, userProfile }: QuotePDFProps) => {
  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

  return (
    <Document>
      {/* --- PÁGINA 1: PORTADA --- */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.coverContainer}>
          <View style={styles.coverHeader}>
             <Text style={styles.coverTitle}>ALAMEX</Text>
             {/* Asegúrate de tener logo-alamex.png en public/images/ */}
             <Image src="/images/logo-alamex.png" style={styles.coverLogo} /> 
          </View>

          <View style={styles.coverBody}>
            {/* Asegúrate de tener fondo-login.jpg en public/images/ */}
            <Image src="/images/fondo-login.jpg" style={styles.coverImage} />
            
            <Text style={styles.projectTitle}>
              {data.projectRef || 'PROYECTO SIN NOMBRE'}
            </Text>
            <Text style={styles.clientName}>
              Preparado para: {data.clientName || 'Cliente Estimado'}
            </Text>
            <Text style={styles.dateText}>
              Fecha: {data.projectDate}
            </Text>
          </View>

          <View style={styles.coverFooter}></View>
        </View>
      </Page>

      {/* --- PÁGINA 2: DETALLES --- */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.contentContainer}>
            <View style={styles.headerSmall}>
                <Text style={{fontSize: 10, color: '#64748b'}}>Ref: {data.projectRef}</Text>
                <Text style={{fontSize: 10, color: '#64748b'}}>Pag. 2</Text>
            </View>

            <Text style={styles.sectionTitle}>Especificaciones Técnicas</Text>

            <View style={styles.table}>
                {/* Aquí pasamos los valores. Si alguno es undefined, el componente TableRow lo manejará */}
                <TableRow label="Tipo de Equipo" value={data.type === 'new' ? 'Elevador Nuevo' : 'Modernización'} />
                <TableRow label="Modelo" value={data.model} />
                <TableRow label="Capacidad" value={`${data.capacity} kg / ${data.persons} personas`} />
                <TableRow label="Velocidad" value={`${data.speed} m/s`} />
                <TableRow label="Niveles / Paradas" value={data.stops} />
                <TableRow label="Recorrido" value={`${data.travel} mm`} />
                <TableRow label="Ancho de Puerta" value={`${data.doorWidth} mm`} />
                {/* Usamos || para enviar un string por defecto si es undefined */}
                <TableRow label="Máquina" value={data.machineType || 'No especificado'} />
            </View>

            <Text style={styles.sectionTitle}>Propuesta Económica</Text>
            
            <View style={styles.priceBox}>
                <Text style={styles.priceText}>Inversión Total por {data.quantity} equipo(s):</Text>
                <Text style={styles.totalPrice}>{formatter.format((data.price || 0) * (data.quantity || 1))}</Text>
                <Text style={{fontSize: 10, color: '#64748b', textAlign: 'right', marginTop: 5}}>+ IVA</Text>
            </View>

            <Text style={{fontSize: 10, marginTop: 20, lineHeight: 1.5}}>
                Términos y Condiciones:{"\n"}
                1. Validez de la oferta: 30 días naturales.{"\n"}
                2. Tiempo de entrega: A confirmar tras anticipo.{"\n"}
                3. Esta cotización incluye suministro e instalación según normas vigentes.
            </Text>
        </View>

        <View style={styles.footer}>
            <Text>Elevadores Alamex S.A. de C.V. | {userProfile?.full_name || 'Ventas'} | {userProfile?.job_title || ''}</Text>
        </View>
      </Page>
    </Document>
  );
};

// --- CORRECCIÓN CLAVE AQUÍ ---
// Actualizamos el tipo de 'value' para aceptar string, number o undefined.
// Si llega undefined o null, mostramos un guion '-'.
const TableRow = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <View style={styles.tableRow}>
        <Text style={styles.tableCellKey}>{label}</Text>
        <Text style={styles.tableCellValue}>{value ? String(value) : '-'}</Text>
    </View>
);