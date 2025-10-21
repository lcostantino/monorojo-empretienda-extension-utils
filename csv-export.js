// CSV Export functionality for Correo Argentino
// Converts order data to CSV format for bulk upload
// Note: Some code in this file was generated with AI assistance

// Province code mapping (from codigos_sucursales_y_provincias_MiCorreo.xlsx)
const PROVINCE_CODES = {
  'BUENOS AIRES': 'B',
  'CABA': 'C',
  'CAPITAL FEDERAL': 'C',
  'CATAMARCA': 'K',
  'CHACO': 'H',
  'CHUBUT': 'U',
  'CORDOBA': 'X',
  'CÓRDOBA': 'X',
  'CORRIENTES': 'W',
  'ENTRE RIOS': 'E',
  'ENTRE RÍOS': 'E',
  'FORMOSA': 'P',
  'JUJUY': 'Y',
  'LA PAMPA': 'L',
  'LA RIOJA': 'F',
  'MENDOZA': 'M',
  'MISIONES': 'N',
  'NEUQUEN': 'Q',
  'NEUQUÉN': 'Q',
  'RIO NEGRO': 'R',
  'RÍO NEGRO': 'R',
  'SALTA': 'A',
  'SAN JUAN': 'J',
  'SAN LUIS': 'D',
  'SANTA CRUZ': 'Z',
  'SANTA FE': 'S',
  'SANTIAGO DEL ESTERO': 'G',
  'TIERRA DEL FUEGO': 'V',
  'TUCUMAN': 'T',
  'TUCUMÁN': 'T'
};

/**
 * Get province code from province name
 * @param {string} provinceName - Province name
 * @returns {string} Province code or empty string
 */
function getProvinceCode(provinceName) {
  if (!provinceName) return '';
  
  const normalized = provinceName.toUpperCase().trim();
  return PROVINCE_CODES[normalized] || '';
}

/**
 * Parse phone number into area code and number
 * @param {string} phone - Phone number (e.g., "543513344884")
 * @returns {Object} {areaCode, number}
 */
function parsePhoneNumber(phone) {
  if (!phone) return { areaCode: '', number: '' };
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Argentine phone format: country code (54) + area code (2-4 digits) + number
  // Remove country code if present
  let cleaned = digits;
  if (digits.startsWith('54')) {
    cleaned = digits.substring(2);
  }
  
  // Area codes in Argentina: 2-4 digits
  // Try to extract area code (typically 2-4 digits)
  if (cleaned.length >= 8) {
    // Assume area code is first 3-4 digits
    const areaCode = cleaned.substring(0, cleaned.length - 7);
    const number = cleaned.substring(cleaned.length - 7);
    return { areaCode, number };
  }
  
  return { areaCode: '', number: cleaned };
}

/**
 * Extract numeric value from currency string
 * @param {string} value - Currency string (e.g., "$44.401,00")
 * @returns {string} Numeric value with decimal point
 */
function parseCurrency(value) {
  if (!value) return '';
  
  // Remove currency symbol and spaces
  let cleaned = value.replace(/[$\s]/g, '');
  
  // Replace Argentine format (thousands: . decimal: ,) to standard (thousands: , decimal: .)
  cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  
  return cleaned;
}

/**
 * Remove accents and special characters from text based on config
 * @param {string} text - Text to sanitize
 * @param {Object} config - Sanitization configuration
 * @returns {string} Sanitized text
 */
function sanitizeText(text, config = {}) {
  if (!text) return '';
  
  // Convert to string
  text = String(text);
  
  // Remove accents/tildes (default: true)
  if (config.removeAccents !== false) {
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  
  // Replace ñ with n (default: false - keep ñ)
  if (config.replaceEnie === true) {
    text = text.replace(/ñ/g, 'n');
    text = text.replace(/Ñ/g, 'N');
  }
  
  // Replace ü with u (default: false)
  if (config.replaceUmlaut === true) {
    text = text.replace(/ü/g, 'u');
    text = text.replace(/Ü/g, 'U');
  }
  
  // Remove parentheses (default: true)
  if (config.removeParentheses !== false) {
    text = text.replace(/[()]/g, '');
  }
  
  // Remove special characters (default: true)
  if (config.removeSpecialChars !== false) {
    text = text.replace(/[""'']/g, ''); // Remove quotes
    text = text.replace(/[<>]/g, ''); // Remove angle brackets
    text = text.replace(/[|]/g, ''); // Remove pipe
    text = text.replace(/[{}]/g, ''); // Remove braces
    text = text.replace(/[[\]]/g, ''); // Remove brackets
  }
  
  // Keep only safe characters
  // Allow: letters (including ñ if not replaced), numbers, spaces, hyphens, periods, commas, @, #, /
  const allowedPattern = config.replaceEnie === true 
    ? /[^a-zA-Z0-9\s\-.,@#/]/g 
    : /[^a-zA-ZñÑ0-9\s\-.,@#/]/g;
  
  text = text.replace(allowedPattern, '');
  
  // Clean up multiple spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Format field using template
 * @param {Object} addr - Address object
 * @param {string} template - Format template with variables
 * @param {Object} config - Sanitization configuration
 * @returns {string} Formatted value
 */
function formatField(addr, template, config = {}) {
  if (!template) {
    return '';
  }
  
  let formatted = template;
  
  // Replace variables with actual values (sanitized)
  formatted = formatted.replace(/\$street/g, sanitizeText(addr.street, config) || '');
  formatted = formatted.replace(/\$number/g, sanitizeText(addr.number, config) || '');
  formatted = formatted.replace(/\$floor/g, sanitizeText(addr.floor, config) || '');
  formatted = formatted.replace(/\$apt/g, sanitizeText(addr.apartment, config) || '');
  formatted = formatted.replace(/\$city/g, sanitizeText(addr.city, config) || '');
  formatted = formatted.replace(/\$province/g, sanitizeText(addr.province, config) || '');
  formatted = formatted.replace(/\$postalCode/g, sanitizeText(addr.postalCode, config) || '');
  
  // Clean up extra spaces and empty parentheses
  formatted = formatted.replace(/\s+/g, ' ').trim();
  formatted = formatted.replace(/\(\s*\)/g, '').trim();
  formatted = formatted.replace(/\s+([,.])/g, '$1');
  
  return formatted;
}

/**
 * Convert order data to CSV row for Correo Argentino
 * @param {Object} order - Order data from extraction
 * @param {Object} config - Configuration with defaults and format template
 * @returns {Object} CSV row data
 */
function orderToCSVRow(order, config = {}) {
  const si = order.shippingInfo || {};
  const addr = si.address || {};
  const recipient = si.recipient || {};
  
  // Parse phone number
  const phone = parsePhoneNumber(recipient.phone);
  
  // Get province code
  const provinceCode = getProvinceCode(addr.province);
  
  // Parse weight (remove "kg" suffix if present)
  const weight = si.weight ? si.weight.replace(/kg/i, '').trim().replace(',', '.') : '';
  
  // Parse shipping cost as content value (fallback to order total)
  const contentValue = parseCurrency(si.cost || order.shippingCost || order.totalAmount || '0');
  
  // Format address fields using templates (with defaults)
  const calleDestino = formatField(addr, config.calleDestinoTemplate || '$street', config);
  const alturaDestino = formatField(addr, config.alturaDestinoTemplate || '$number', config);
  const piso = formatField(addr, config.pisoTemplate || '$floor', config);
  const dpto = formatField(addr, config.dptoTemplate || '$apt', config);
  
  return {
    tipo_producto: 'CP', // Default: PAQ.AR CLASICO (can be CP, EP, UP)
    largo: config.defaultLargo || '30',
    ancho: config.defaultAncho || '20',
    altura: config.defaultAltura || '10',
    peso: weight || '0.15', // Default weight if not available
    valor_del_contenido: contentValue,
    provincia_destino: provinceCode,
    sucursal_destino: '', // Leave empty for home delivery
    localidad_destino: sanitizeText(addr.city, config) || '',
    calle_destino: calleDestino,
    altura_destino: alturaDestino,
    piso: piso,
    dpto: dpto,
    codpostal_destino: addr.postalCode || '',
    destino_nombre: sanitizeText(recipient.name || order.customerName, config) || '',
    destino_email: (recipient.email || order.email || '').toLowerCase(),
    cod_area_tel: '', // Leave empty, use cel
    tel: '', // Leave empty, use cel
    cod_area_cel: phone.areaCode,
    cel: phone.number,
    numero_orden: sanitizeText(order.orderNumber, config) || ''
  };
}

/**
 * Convert array of orders to CSV string
 * @param {Array} orders - Array of order objects
 * @param {Object} config - Configuration with defaults and format template
 * @returns {string} CSV content
 */
function ordersToCSV(orders, config = {}) {
  // CSV headers (semicolon-separated as per template)
  const headers = [
    'tipo_producto(obligatorio)',
    'largo(obligatorio en CM)',
    'ancho(obligatorio en CM)',
    'altura(obligatorio en CM)',
    'peso(obligatorio en KG)',
    'valor_del_contenido(obligatorio en pesos argentinos)',
    'provincia_destino(obligatorio)',
    'sucursal_destino(obligatorio solo en caso de no ingresar localidad de destino)',
    'localidad_destino(obligatorio solo en caso de no ingresar sucursal de destino)',
    'calle_destino(obligatorio solo en caso de no ingresar sucursal de destino)',
    'altura_destino(obligatorio solo en caso de no ingresar sucursal de destino)',
    'piso(opcional solo en caso de no ingresar sucursal de destino)',
    'dpto(opcional solo en caso de no ingresar sucursal de destino)',
    'codpostal_destino(obligatorio solo en caso de no ingresar sucursal de destino)',
    'destino_nombre(obligatorio)',
    'destino_email(obligatorio, debe ser un email valido)',
    'cod_area_tel(opcional)',
    'tel(opcional)',
    'cod_area_cel(opcional)',
    'cel(opcional)',
    'numero_orden(opcional)'
  ];
  
  // Start with headers
  let csv = headers.join(';') + '\n';
  
  // Add each order as a row
  orders.forEach(order => {
    const row = orderToCSVRow(order, config);
    
    const values = [
      row.tipo_producto,
      row.largo,
      row.ancho,
      row.altura,
      row.peso,
      row.valor_del_contenido,
      row.provincia_destino,
      row.sucursal_destino,
      row.localidad_destino,
      row.calle_destino,
      row.altura_destino,
      row.piso,
      row.dpto,
      row.codpostal_destino,
      row.destino_nombre,
      row.destino_email,
      row.cod_area_tel,
      row.tel,
      row.cod_area_cel,
      row.cel,
      row.numero_orden
    ];
    
    csv += values.join(';') + '\n';
  });
  
  return csv;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
function downloadCSV(csvContent, filename = 'correo_argentino_carga_masiva.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export all stored orders to Correo Argentino CSV format
 */
async function exportToCorreoArgentinoCSV() {
  return new Promise((resolve, reject) => {
    // Get both orders and config
    chrome.storage.local.get(['orders'], (localResult) => {
      const orders = localResult.orders || [];
      
      if (orders.length === 0) {
        reject(new Error('No orders to export'));
        return;
      }
      
      // Get CSV export settings
      chrome.storage.sync.get(['csvExportSettings'], (syncResult) => {
        const config = syncResult.csvExportSettings || {};
        
        // Filter orders that have shipping info
        const validOrders = orders.filter(order => 
          order.shippingInfo && 
          order.shippingInfo.recipient && 
          order.shippingInfo.address
        );
        
        if (validOrders.length === 0) {
          reject(new Error('No orders with shipping information found'));
          return;
        }
        
        const csvContent = ordersToCSV(validOrders, config);
        const filename = `correo_argentino_${new Date().toISOString().split('T')[0]}.csv`;
        
        downloadCSV(csvContent, filename);
        resolve({ count: validOrders.length, total: orders.length });
      });
    });
  });
}
