import React, { useState, useEffect } from 'react';
import './App.css';
import { logEvent } from './utils/logger';

function App() {
  const [role, setRole] = useState('L0');
  const [userId, setUserId] = useState('');
  const [isUserIdConfirmed, setIsUserIdConfirmed] = useState(false);

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
          payload: {
            userId: userId,
            level: role,
          },
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

  const extractArticleText = () => {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'EXTRACT_ARTICLE_TEXT' }, (response) => {
        console.log('Message sent for text extraction');
        if (chrome.runtime.lastError) {
          console.error('Error in sending message:', chrome.runtime.lastError);
        }
      });
    } else {
      console.error('Chrome runtime is not available.');
    }
  };

  const handleUserIdChange = (e) => {
    const newUserId = e.target.value;
    setUserId(newUserId);
  };

  const confirmUserId = () => {
    if (userId.trim() !== '') {
      setIsUserIdConfirmed(true);
      logEvent('UserId Confirmed', userId, 'userid_confirm');
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ userId: userId }, () => {
          console.log('UserId saved:', userId);
        });
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Start Discussion</h1>
        <div className="userid-selection">
          <h2>Select Name</h2>
          <div className="userid-input">
          <input
            type="text"
            value={userId}
            onChange={handleUserIdChange}
            placeholder="Enter name"
          />
          <button
            onClick={confirmUserId}
            style={{ backgroundColor: isUserIdConfirmed ? 'green' : 'blue' }}
          >
            {isUserIdConfirmed ? 'DONE' : 'SET'}
          </button>
          </div>
        </div>
        <div className="role-selection">
          <h2>Select Role</h2>
          <select value={role} onChange={handleChange}>
            <option value="L0">Level 0 (L0)</option>
            <option value="L1">Level 1 (L1)</option>
            <option value="L2">Level 2 (L2)</option>
          </select>
        </div>
        <button onClick={injectThreads}>Add Threads</button>
        <button onClick={extractArticleText}>Extract Article Text</button>
      </header>
    </div>
  );
}

export default App;
