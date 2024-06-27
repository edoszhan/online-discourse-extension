import React, { useState, useEffect } from 'react';
import './App.css';
import { logEvent } from './utils/logger';

function App() {
  const [role, setRole] = useState('L0');
  const userId = 'user1';

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['selectedRole'], (result) => {
        if (result.selectedRole) {
          setRole(result.selectedRole);
        }
      });
    }
  }, []);

  const injectThreads = () => {
    logEvent('Inject Threads Clicked', userId, 'threads_injection');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id !== undefined) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'removeColorControl',
        }, (response) => {
          console.log(response);
        });
      }
    });
  };

  const handleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    logEvent(`Role Changed to ${selectedRole}`, userId, 'role_change');
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ selectedRole: selectedRole }, () => {
        console.log('Role updated to:', selectedRole);
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Start Discussion</h1>
        <div className="role-selection">
          <h2>Select Role</h2>
          <select value={role} onChange={handleChange}>
            <option value="L0">Level 0 (L0)</option>
            <option value="L1">Level 1 (L1)</option>
            <option value="L2">Level 2 (L2)</option>
          </select>
        </div>
        <button onClick={injectThreads}>Add Threads</button>
      </header>
    </div>
  );
}

export default App;
