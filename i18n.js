// i18n helper - Apply translations on page load
document.addEventListener('DOMContentLoaded', () => {
  // Translate all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const messageName = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageName);
    if (message) {
      if (element.tagName === 'INPUT' && element.type === 'button') {
        element.value = message;
      } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = message;
      } else {
        element.textContent = message;
      }
    }
  });
  
  // Update document title
  const titleElement = document.querySelector('title[data-i18n]');
  if (titleElement) {
    const messageName = titleElement.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageName);
    if (message) {
      document.title = message;
    }
  }
});
