// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       files: ['./content/contentScript.js']
//     });
//   });

  
// chrome.action.onClicked.addListener((tab) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//     const activeTab = tabs[0];
//     chrome.tabs.sendMessage(activeTab.id, { type: 'EXTRACT_ARTICLE_TEXT' }, response => {
//       if (chrome.runtime.lastError) {
//         console.error('Error sending message:', chrome.runtime.lastError);
//       } else {
//         console.log('Message sent successfully');
//       }
//     });
//   });
// });


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);

  if (request.action === 'EXTRACT_ARTICLE_TEXT') {
    console.log('Action to extract article text recognized.');

    // Get the active tab and inject the extraction script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: {tabId: activeTab.id},
        files: ['static/js/extractionScript.js']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to inject script:', chrome.runtime.lastError);
        } else {
          console.log('extractionScript.js injected successfully');
          chrome.tabs.sendMessage(activeTab.id, {action: 'START_EXTRACTION'});
        }
      });
    });
  }

  return true; 
});
