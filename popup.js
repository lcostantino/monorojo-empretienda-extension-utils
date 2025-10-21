// Popup script
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  
  document.getElementById('extractBtn').addEventListener('click', extractCurrentPage);
  document.getElementById('clearBtn').addEventListener('click', clearHistory);
  document.getElementById('exportBtn').addEventListener('click', exportToJSON);
  document.getElementById('exportCSVBtn').addEventListener('click', exportToCorreoArgentinoCSVWrapper);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
});

function openSettings() {
  chrome.runtime.openOptionsPage();
}

async function exportToCorreoArgentinoCSVWrapper() {
  try {
    const result = await exportToCorreoArgentinoCSV();
    showError(`✓ Exported ${result.count} orders to CSV (${result.total} total orders)`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      const errorDiv = document.getElementById('error');
      if (errorDiv) errorDiv.style.display = 'none';
    }, 3000);
  } catch (error) {
    showError(error.message);
  }
}

async function extractCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.id) {
    showError('Unable to access current tab');
    return;
  }
  
  try {
    // First, inject the content script if not already present
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Small delay to ensure script is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractOrder' });
    
    if (response && response.success) {
      displayCurrentOrder(response.data);
      
      // Save to storage
      chrome.storage.local.get(['orders'], (result) => {
        const orders = result.orders || [];
        orders.unshift(response.data);
        
        if (orders.length > 50) {
          orders.pop();
        }
        
        chrome.storage.local.set({ orders }, () => {
          loadOrders();
        });
      });
    }
  } catch (error) {
    console.error('Extraction error:', error);
    showError('Could not extract data from this page. Error: ' + error.message);
  }
}

function displayCurrentOrder(orderData) {
  const currentOrderSection = document.getElementById('currentOrder');
  const content = document.getElementById('currentOrderContent');
  
  currentOrderSection.style.display = 'block';
  content.innerHTML = formatOrderCard(orderData);
}

function loadOrders() {
  chrome.storage.local.get(['orders'], (result) => {
    const orders = result.orders || [];
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyState');
    
    if (orders.length === 0) {
      emptyState.style.display = 'block';
      document.getElementById('ordersHistory').style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      document.getElementById('ordersHistory').style.display = 'block';
      
      ordersList.innerHTML = orders.map(order => formatOrderCard(order)).join('');
    }
  });
}

function formatOrderCard(order) {
  const fields = [];
  
  if (order.orderNumber) {
    fields.push(`<div class="order-field"><span class="field-label">Order #:</span> <span class="field-value">${escapeHtml(order.orderNumber)}</span></div>`);
  }
  
  if (order.customerName) {
    fields.push(`<div class="order-field"><span class="field-label">Customer:</span> <span class="field-value">${escapeHtml(order.customerName)}</span></div>`);
  }
  
  if (order.orderDate) {
    fields.push(`<div class="order-field"><span class="field-label">Date:</span> <span class="field-value">${escapeHtml(order.orderDate)}</span></div>`);
  }
  
  if (order.totalAmount) {
    fields.push(`<div class="order-field"><span class="field-label">Total:</span> <span class="field-value">${escapeHtml(order.totalAmount)}</span></div>`);
  }
  
  if (order.shippingCost) {
    fields.push(`<div class="order-field"><span class="field-label">Shipping:</span> <span class="field-value">${escapeHtml(order.shippingCost)}</span></div>`);
  }
  
  if (order.paymentStatus) {
    fields.push(`<div class="order-field"><span class="field-label">Payment Status:</span> <span class="field-value">${escapeHtml(order.paymentStatus)}</span></div>`);
  }
  
  if (order.shippingStatus) {
    fields.push(`<div class="order-field"><span class="field-label">Shipping Status:</span> <span class="field-value">${escapeHtml(order.shippingStatus)}</span></div>`);
  }
  
  if (order.status) {
    fields.push(`<div class="order-field"><span class="field-label">Status:</span> <span class="field-value">${escapeHtml(order.status)}</span></div>`);
  }
  
  if (order.email) {
    fields.push(`<div class="order-field"><span class="field-label">Email:</span> <span class="field-value">${escapeHtml(order.email)}</span></div>`);
  }
  
  if (order.phone) {
    fields.push(`<div class="order-field"><span class="field-label">Phone:</span> <span class="field-value">${escapeHtml(order.phone)}</span></div>`);
  }
  
  if (order.trackingNumber) {
    fields.push(`<div class="order-field"><span class="field-label">Tracking:</span> <span class="field-value">${escapeHtml(order.trackingNumber)}</span></div>`);
  }
  
  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = `
      <div class="order-field">
        <span class="field-label">Items:</span>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <div class="item-name">${escapeHtml(item.name)}</div>
              <div class="item-details">
                ${item.price ? `Price: ${escapeHtml(item.price)}` : ''} 
                ${item.quantity ? `• Qty: ${escapeHtml(item.quantity)}` : ''}
                ${item.details ? `<br><small>${escapeHtml(item.details)}</small>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Format shipping info if available
  let shippingHtml = '';
  if (order.shippingInfo) {
    const si = order.shippingInfo;
    const shippingFields = [];
    
    if (si.method) shippingFields.push(`<strong>Method:</strong> ${escapeHtml(si.method)}`);
    if (si.status) shippingFields.push(`<strong>Status:</strong> ${escapeHtml(si.status)}`);
    if (si.cost) shippingFields.push(`<strong>Cost:</strong> ${escapeHtml(si.cost)}`);
    if (si.weight) shippingFields.push(`<strong>Weight:</strong> ${escapeHtml(si.weight)}`);
    
    let addressHtml = '';
    if (si.address && (si.address.street || si.address.city)) {
      const addr = [];
      if (si.address.street) addr.push(escapeHtml(si.address.street));
      if (si.address.number) addr.push(escapeHtml(si.address.number));
      if (si.address.floor) addr.push(`${escapeHtml(si.address.floor)}`);
      if (si.address.apartment) addr.push(`${escapeHtml(si.address.apartment)}`);
      if (si.address.city) addr.push(escapeHtml(si.address.city));
      if (si.address.province) addr.push(escapeHtml(si.address.province));
      if (si.address.postalCode) addr.push(escapeHtml(si.address.postalCode));
      
      addressHtml = `<div style="margin-top:5px"><strong>Address:</strong><br>${addr.join(', ')}</div>`;
    }
    
    let recipientHtml = '';
    if (si.recipient && (si.recipient.name || si.recipient.phone)) {
      const rec = [];
      if (si.recipient.name) rec.push(`<strong>Name:</strong> ${escapeHtml(si.recipient.name)}`);
      if (si.recipient.phone) rec.push(`<strong>Phone:</strong> ${escapeHtml(si.recipient.phone)}`);
      if (si.recipient.email) rec.push(`<strong>Email:</strong> ${escapeHtml(si.recipient.email)}`);
      if (si.recipient.dni) rec.push(`<strong>DNI:</strong> ${escapeHtml(si.recipient.dni)}`);
      
      recipientHtml = `<div style="margin-top:5px"><strong>Recipient:</strong><br>${rec.join('<br>')}</div>`;
    }
    
    if (shippingFields.length > 0 || addressHtml || recipientHtml) {
      shippingHtml = `
        <div class="order-field">
          <span class="field-label">Shipping Info:</span>
          <div style="font-size:12px; margin-top:5px">
            ${shippingFields.join('<br>')}
            ${addressHtml}
            ${recipientHtml}
          </div>
        </div>
      `;
    }
  }
  
  const hostname = order.url ? new URL(order.url).hostname : 'Unknown';
  const timestamp = order.timestamp ? new Date(order.timestamp).toLocaleString() : '';
  
  return `
    <div class="order-card">
      ${fields.join('')}
      ${itemsHtml}
      ${shippingHtml}
      <div class="timestamp">
        Extracted: ${timestamp} from <a href="${escapeHtml(order.url)}" target="_blank" class="url-link">${escapeHtml(hostname)}</a>
      </div>
    </div>
  `;
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all order history?')) {
    chrome.storage.local.set({ orders: [] }, () => {
      loadOrders();
      document.getElementById('currentOrder').style.display = 'none';
    });
  }
}

function exportToJSON() {
  chrome.storage.local.get(['orders'], (result) => {
    const orders = result.orders || [];
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  });
}

function copyToClipboard() {
  chrome.storage.local.get(['orders'], (result) => {
    const orders = result.orders || [];
    const text = JSON.stringify(orders, null, 2);
    
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('Copied to clipboard!');
    }).catch(err => {
      showError('Failed to copy');
    });
  });
}

function showError(message) {
  alert('❌ ' + message);
}

function showSuccess(message) {
  alert('✅ ' + message);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
