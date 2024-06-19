import React, { useState, useEffect } from 'react';
import { logEvent } from './utils/logger'; // Import the logEvent function

const App = () => {
  const [role, setRole] = useState('L0');

  const userId = 'masteryt'; // Hardcoded user ID for demonstration, my id is 'edoszhan'

  useEffect(() => {
    chrome.storage.sync.get(['selectedRole'], (result) => {
      if (result.selectedRole) {
        setRole(result.selectedRole);
      }
    });
  }, []);

  const saveRole = () => {
    logEvent('Save Role Clicked', userId, 'role_settings');
    chrome.storage.sync.set({ selectedRole: role }, () => {
      alert('You have been promoted to : ' + role);
    });
  };

  const injectThreads = () => {
    logEvent('Inject Threads Clicked', userId, 'threads_injection');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      });
    });
  };

  const handleChange = (e) => {
    setRole(e.target.value);
    logEvent(`Role Changed to ${e.target.value}`, userId, 'role_change');
  };

  return (
    <div style={{ padding: '10px', fontFamily: 'Arial' }}>
      <h2>Select Role</h2>
      <select value={role} onChange={handleChange} style={{ width: '100%', padding: '10px', margin: '10px 0' }}>
        <option value="L0">Level 0 (L0)</option>
        <option value="L1">Level 1 (L1)</option>
        <option value="L2">Level 2 (L2)</option>
      </select>
      <button onClick={saveRole} style={{ width: '100%', padding: '10px', margin: '10px 0' }}>Save Role</button>
      <button onClick={injectThreads} style={{ width: '100%', padding: '10px', margin: '10px 0' }}>Inject Threads</button>
    </div>
  );
};

export default App;
