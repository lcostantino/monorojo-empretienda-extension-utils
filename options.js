// Configura// Options page script
// Note: Some code in this file was generated with AI assistance
console.log('Order Reader Extension: Options page loaded');

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  
  document.getElementById('configForm').addEventListener('submit', saveSettings);
  document.getElementById('configForm').addEventListener('reset', () => {
    setTimeout(() => {
      clearStatus();
    }, 100);
  });
});

function loadSettings() {
  chrome.storage.sync.get(['csvExportSettings'], (result) => {
    if (result.csvExportSettings) {
      const config = result.csvExportSettings;
      
      // Load address field templates
      if (config.calleDestinoTemplate !== undefined) {
        document.getElementById('calleDestinoTemplate').value = config.calleDestinoTemplate;
      }
      if (config.alturaDestinoTemplate !== undefined) {
        document.getElementById('alturaDestinoTemplate').value = config.alturaDestinoTemplate;
      }
      if (config.pisoTemplate !== undefined) {
        document.getElementById('pisoTemplate').value = config.pisoTemplate;
      }
      if (config.dptoTemplate !== undefined) {
        document.getElementById('dptoTemplate').value = config.dptoTemplate;
      }
      
      // Load sanitization settings (defaults)
      document.getElementById('removeAccents').checked = config.removeAccents !== false;
      document.getElementById('replaceEnie').checked = config.replaceEnie === true;
      document.getElementById('replaceUmlaut').checked = config.replaceUmlaut === true;
      document.getElementById('removeParentheses').checked = config.removeParentheses !== false;
      document.getElementById('removeSpecialChars').checked = config.removeSpecialChars !== false;
      
      // Load default dimensions
      if (config.defaultLargo) {
        document.getElementById('defaultLargo').value = config.defaultLargo;
      }
      if (config.defaultAncho) {
        document.getElementById('defaultAncho').value = config.defaultAncho;
      }
      if (config.defaultAltura) {
        document.getElementById('defaultAltura').value = config.defaultAltura;
      }
    }
  });
}

function saveSettings(event) {
  event.preventDefault();
  
  // Get address field templates
  const calleDestinoTemplate = document.getElementById('calleDestinoTemplate').value.trim();
  const alturaDestinoTemplate = document.getElementById('alturaDestinoTemplate').value.trim();
  const pisoTemplate = document.getElementById('pisoTemplate').value.trim();
  const dptoTemplate = document.getElementById('dptoTemplate').value.trim();
  
  // Get sanitization settings
  const removeAccents = document.getElementById('removeAccents').checked;
  const replaceEnie = document.getElementById('replaceEnie').checked;
  const replaceUmlaut = document.getElementById('replaceUmlaut').checked;
  const removeParentheses = document.getElementById('removeParentheses').checked;
  const removeSpecialChars = document.getElementById('removeSpecialChars').checked;
  
  // Get default dimensions
  const defaultLargo = document.getElementById('defaultLargo').value.trim();
  const defaultAncho = document.getElementById('defaultAncho').value.trim();
  const defaultAltura = document.getElementById('defaultAltura').value.trim();
  
  const config = {
    calleDestinoTemplate,
    alturaDestinoTemplate,
    pisoTemplate,
    dptoTemplate,
    removeAccents,
    replaceEnie,
    replaceUmlaut,
    removeParentheses,
    removeSpecialChars,
    defaultLargo,
    defaultAncho,
    defaultAltura,
    lastUpdated: new Date().toISOString()
  };
  
  chrome.storage.sync.set({ csvExportSettings: config }, () => {
    if (chrome.runtime.lastError) {
      showStatus(chrome.i18n.getMessage('configError') + ': ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus(chrome.i18n.getMessage('configSaved'), 'success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        clearStatus();
      }, 3000);
    }
  });
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  statusDiv.style.display = 'block';
}

function clearStatus() {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.style.display = 'none';
  statusDiv.textContent = '';
  statusDiv.className = 'status-message';
}
