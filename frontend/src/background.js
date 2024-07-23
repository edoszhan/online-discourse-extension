chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'EXTRACT_ARTICLE_TEXT') {

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
          chrome.tabs.sendMessage(activeTab.id, {action: 'START_EXTRACTION'});
        }
      });
    });
  }

  return true; 
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'ARTICLE_TEXT_EXTRACTED') {
    const { text, url } = request;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, url})
    })
    .then(response => response.json())
    .then(data => {
      console.log('Generated Topics:', data.topics);
      console.log('Generated Questions:', data.questions);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});

