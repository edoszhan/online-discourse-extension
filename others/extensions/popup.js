document.getElementById('saveRole').addEventListener('click', () => {
    const selectedRole = document.getElementById('roleSelect').value;
    chrome.storage.sync.set({ selectedRole: selectedRole }, () => {
      alert('You were promoted to ' + selectedRole);
    });
  });
  
  document.getElementById('inject').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      });
    });
  });
  
  // Inject tables immediately when the popup is opened
  document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      });
    });
  });
  