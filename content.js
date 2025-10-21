// Content script for order extraction
// Note: Some code in this file was generated with AI assistance
console.log('Order Reader Extension: Content script loaded');

function extractOrderData() {
  const orderData = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    orderNumber: null,
    orderDate: null,
    totalAmount: null,
    items: [],
    shippingAddress: null,
    billingInfo: null,
    status: null,
    trackingNumber: null
  };

  // Detect the site and use appropriate selectors
  const hostname = window.location.hostname;

  
  // Check for Material-UI Spanish order page (custom e-commerce platform)
  const isMuiOrderPage = window.location.pathname.includes('listado-de-ventas/orden');

  if (isMuiOrderPage) {
    // Extract order number from h1 tag
    const orderH1 = document.querySelector('h1.MuiTypography-root');
    if (orderH1) {
      const match = orderH1.textContent.match(/Orden\s*#?\s*(\d+)/i);
      if (match) orderData.orderNumber = match[1];
    }
    
    // Extract date from the timestamp display
    const dateElement = document.querySelector('.css-1glyw5k, span.MuiTypography-root[class*="css-"]');
    if (dateElement && dateElement.textContent.match(/\d{2}\/\d{2}\/\d{2}/)) {
      orderData.orderDate = dateElement.textContent.trim();
    }
    
    // Extract customer name (first occurrence in jss70 or similar)
    const customerNameEl = document.querySelector('p.jss70, p.MuiTypography-root:first-of-type');
    if (customerNameEl && customerNameEl.textContent && !customerNameEl.textContent.includes(':')) {
      orderData.customerName = customerNameEl.textContent.trim();
    }
    
    // Extract total (look for strong tag with $ in list items)
    const totalElements = Array.from(document.querySelectorAll('p.MuiTypography-body1 strong, .css-mwh6pl strong'));
    for (const el of totalElements) {
      if (el.textContent.includes('$') && !el.parentElement.textContent.toLowerCase().includes('subtotal')) {
        orderData.totalAmount = el.textContent.trim();
        break;
      }
    }
    
    // Extract items from the order list
    orderData.items = extractMuiOrderItems();
    
    // Extract payment and shipping status
    const statusTexts = Array.from(document.querySelectorAll('p.css-4yyjhl, p.css-1qwitqn'));
    for (const el of statusTexts) {
      const text = el.textContent;
      if (text.includes('Estado del pago')) {
        orderData.paymentStatus = text.replace(/Estado del pago:\s*/i, '').trim();
      }
      if (text.includes('Estado del envío') || text.includes('Estado del env')) {
        orderData.shippingStatus = text.replace(/Estado del env[ií]o:\s*/i, '').trim();
      }
    }
    
    // Extract contact info (email, phone)
    const contactFields = Array.from(document.querySelectorAll('p.jss71, p.jss86, p.jss94'));
    for (const field of contactFields) {
      const text = field.textContent;
      if (text.includes('Email:')) {
        orderData.email = text.replace(/.*Email:\s*/i, '').trim();
      }
      if (text.includes('Teléfono:') || text.includes('Telefono:')) {
        orderData.phone = text.replace(/.*Tel[eé]fono:\s*/i, '').trim();
      }
    }
    
    // Extract shipping cost
    const shippingElements = Array.from(document.querySelectorAll('.MuiListItemText-primary'));
    for (let i = 0; i < shippingElements.length; i++) {
      if (shippingElements[i].textContent.includes('Envío') || shippingElements[i].textContent.includes('Envio')) {
        const priceEl = shippingElements[i].closest('li, div')?.querySelector('.css-mwh6pl, p.MuiTypography-body1');
        if (priceEl && priceEl.textContent.includes('$')) {
          orderData.shippingCost = priceEl.textContent.trim();
        }
      }
    }
    
    // Extract comprehensive shipping information (Información de envío)
    orderData.shippingInfo = extractShippingInfo();
  }
 

  return orderData;
}

function extractText(selectors) {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    } catch (e) {
      // Selector might not be valid, continue
    }
  }
  return null;
}

function extractAmazonItems() {
  const items = [];
  const itemElements = document.querySelectorAll('[data-test-id="order-item"], .shipment-item, .a-fixed-left-grid');
  
  itemElements.forEach(item => {
    const name = item.querySelector('.product-title, [data-test-id="item-title"], a.a-link-normal')?.textContent.trim();
    const price = item.querySelector('.product-price, [data-test-id="item-price"], .a-color-price')?.textContent.trim();
    const quantity = item.querySelector('[name="quantity"], .quantity')?.textContent.trim();
    
    if (name) {
      items.push({ name, price, quantity });
    }
  });
  
  return items;
}

function extractMuiOrderItems() {
  const items = [];
  
  // Look for list items with avatar images (product items)
  const itemElements = document.querySelectorAll('li.MuiListItem-container .MuiListItemAvatar-root');
  
  itemElements.forEach(itemEl => {
    const listItem = itemEl.closest('li');
    if (!listItem) return;
    
    // Extract product name from MuiListItemText-primary
    const nameEl = listItem.querySelector('.MuiListItemText-primary');
    if (!nameEl) return;
    
    let name = nameEl.textContent.trim();
    
    // Extract quantity from the name (e.g., "1 x Sushi Time" -> quantity: 1, name: "Sushi Time")
    const qtyMatch = name.match(/^(\d+)\s*x\s*(.+)$/i);
    let quantity = '1';
    if (qtyMatch) {
      quantity = qtyMatch[1];
      name = qtyMatch[2].trim();
    }
    
    // Extract price from secondary action
    const priceEl = listItem.querySelector('.MuiListItemSecondaryAction-root .MuiTypography-body1, .css-mwh6pl');
    const price = priceEl ? priceEl.textContent.trim() : 'N/A';
    
    // Extract additional details (size, SKU, etc.)
    const secondaryText = listItem.querySelector('.MuiListItemText-secondary');
    let details = '';
    if (secondaryText) {
      details = secondaryText.textContent.trim();
    }
    
    if (name && name.length > 2) {
      const item = { name, price, quantity };
      if (details) item.details = details;
      items.push(item);
    }
  });
  
  return items;
}

function extractShippingInfo() {
  const shippingInfo = {
    method: null,
    status: null,
    cost: null,
    weight: null,
    address: {
      street: null,
      number: null,
      floor: null,
      apartment: null,
      city: null,
      province: null,
      postalCode: null
    },
    recipient: {
      name: null,
      phone: null,
      email: null,
      dni: null
    }
  };
  
  // Find the shipping card by looking for "Información de envío" header
  const headers = Array.from(document.querySelectorAll('.MuiCardHeader-title'));
  let shippingCard = null;
  
  for (const header of headers) {
    if (header.textContent.includes('Información de envío') || header.textContent.includes('Informacion de envio')) {
      shippingCard = header.closest('.MuiCard-root');
      break;
    }
  }
  
  if (!shippingCard) return shippingInfo;
  
  // Extract all paragraphs within the shipping card
  const allParagraphs = Array.from(shippingCard.querySelectorAll('p.MuiTypography-body1'));
  
  for (const p of allParagraphs) {
    const text = p.textContent;
    
    // Shipping method, status, cost, weight
    if (text.includes('Método de envío:')) {
      shippingInfo.method = text.replace(/.*Método de env[ií]o:\s*/i, '').trim();
    }
    if (text.includes('Estado del envío:') || text.includes('Estado del env')) {
      shippingInfo.status = text.replace(/.*Estado del env[ií]o:\s*/i, '').trim();
    }
    if (text.includes('Costo del envío:') || text.includes('Costo del env')) {
      shippingInfo.cost = text.replace(/.*Costo del env[ií]o:\s*/i, '').trim();
    }
    if (text.includes('Peso total:')) {
      shippingInfo.weight = text.replace(/.*Peso total:\s*/i, '').trim();
    }
    
    // Address fields
    if (text.includes('Calle:')) {
      shippingInfo.address.street = text.replace(/.*Calle:\s*/i, '').trim();
    }
    if (text.includes('Número:')) {
      shippingInfo.address.number = text.replace(/.*N[uú]mero:\s*/i, '').split(/Piso:|Dpto:/)[0].trim();
    }
    if (text.includes('Piso:')) {
      const pisoMatch = text.match(/Piso:\s*([^\s]+)/i);
      if (pisoMatch) shippingInfo.address.floor = pisoMatch[1].trim();
    }
    if (text.includes('Dpto:')) {
      const dptoMatch = text.match(/Dpto:\s*([^\s]+)/i);
      if (dptoMatch) shippingInfo.address.apartment = dptoMatch[1].trim();
    }
    if (text.includes('Ciudad:')) {
      shippingInfo.address.city = text.replace(/.*Ciudad:\s*/i, '').trim();
    }
    if (text.includes('Provincia:')) {
      shippingInfo.address.province = text.replace(/.*Provincia:\s*/i, '').trim();
    }
    if (text.includes('Código postal:')) {
      shippingInfo.address.postalCode = text.replace(/.*C[oó]digo postal:\s*/i, '').trim();
    }
    
    // Recipient information
    if (text.includes('Nombre completo:')) {
      shippingInfo.recipient.name = text.replace(/.*Nombre completo:\s*/i, '').trim();
    }
    if (text.includes('Teléfono:')) {
      shippingInfo.recipient.phone = text.replace(/.*Tel[eé]fono:\s*/i, '').trim();
    }
    if (text.includes('Email:')) {
      shippingInfo.recipient.email = text.replace(/.*Email:\s*/i, '').trim();
    }
    if (text.includes('DNI:')) {
      shippingInfo.recipient.dni = text.replace(/.*DNI:\s*/i, '').trim();
    }
  }
  
  return shippingInfo;
}

function extractGenericItems() {
  const items = [];
  
  // Try to find item containers
  const selectors = [
    '[class*="item"]',
    '[class*="product"]',
    'tr[class*="order"]',
    '.line-item'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    
    if (elements.length > 0 && elements.length < 50) { // Sanity check
      elements.forEach(item => {
        const name = item.querySelector('[class*="name"], [class*="title"], h3, h4')?.textContent.trim();
        const price = item.querySelector('[class*="price"], [class*="cost"]')?.textContent.trim();
        const quantity = item.querySelector('[class*="quantity"], [class*="qty"]')?.textContent.trim();
        
        if (name && name.length > 3) {
          items.push({ name, price: price || 'N/A', quantity: quantity || '1' });
        }
      });
      
      if (items.length > 0) break;
    }
  }
  
  return items;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractOrder') {
    const orderData = extractOrderData();
    sendResponse({ success: true, data: orderData });
  }
  return true;
});
