// Background service worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Order Reader extension installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'orderDetected') {
    console.log('Order detected:', request.data);
    
    // Update badge to show order was detected
    if (sender.tab && sender.tab.id) {
      chrome.action.setBadgeText({
        tabId: sender.tab.id,
        text: '✓'
      });
      
      chrome.action.setBadgeBackgroundColor({
        tabId: sender.tab.id,
        color: '#4CAF50'
      });
      
      // Clear badge after 3 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({
          tabId: sender.tab.id,
          text: ''
        });
      }, 3000);
    }
  }
  
  return true;
});

// Clear badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({
      tabId: tabId,
      text: ''
    });
  }
});
