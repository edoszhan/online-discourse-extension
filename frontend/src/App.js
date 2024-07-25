import React, { useState, useEffect } from 'react';
import './App.css';
import { logEvent } from './utils/logger';

function App() {
  const [role, setRole] = useState('L0');
  const [userId, setUserId] = useState('');
  const [isUserIdConfirmed, setIsUserIdConfirmed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['selectedRole', 'userId'], (result) => {
        if (result.selectedRole) {
          setRole(result.selectedRole);
        }
        if (result.userId) {
          setUserId(result.userId);
          setIsUserIdConfirmed(true);
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

  const handleAddThreads = () => {
    if (!userId.trim()) {
      setShowWarning(true);
    } else {
      injectThreads();
    }
  };

  const handleInject = () => {
    if (!userId.trim()) {
      setShowWarning(true);
    } else {
      extractArticleText();
    }
  }

  const closeWarning = () => {
    setShowWarning(false);
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
        <button onClick={handleAddThreads}>Add Threads</button>
        <button onClick={handleInject}>Extract Article</button>
        {showWarning && (
          <div className="warning-popup">
            <p>Please fill out the name.</p>
            <button onClick={closeWarning}>OK</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
