// Helper functions to access CSV export configuration

/**
 * Get CSV export settings
 * @returns {Promise<Object>} Configuration object with field templates and dimensions
 */
async function getCSVExportSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['csvExportSettings'], (result) => {
      resolve(result.csvExportSettings || {
        calleDestinoTemplate: '$street  $number - $floor $apt',
        alturaDestinoTemplate: '',
        pisoTemplate: '',
        dptoTemplate: '',
        removeAccents: true,
        replaceEnie: false,
        replaceUmlaut: false,
        removeParentheses: true,
        removeSpecialChars: true,
        defaultLargo: '30',
        defaultAncho: '20',
        defaultAltura: '10'
      });
    });
  });
}
