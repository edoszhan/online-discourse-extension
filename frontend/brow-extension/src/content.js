import React from 'react';
import ReactDOM from 'react-dom';
import InjectedComponent from './components/InjectedComponent.jsx';

chrome.storage.sync.get(['selectedRole'], (result) => {
  const role = result.selectedRole || 'L0';
  const validPage = !chrome.runtime.getURL('/').includes(window.location.origin);

  if (validPage) {
    injectThreads(role);
  }
});

function injectThreads(role) {
  if (document.getElementById('discussionThreads')) {
    return; // Prevent multiple injections
  }

  const container = document.createElement('div');
  container.id = 'discussionThreads';
  container.style.border = '1px solid black';
  container.style.padding = '40px';
  container.style.marginTop = '20px';
  container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  container.style.backgroundColor = '#f9f9f9';
  container.style.borderRadius = '8px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center'; 
  container.style.width = '80%';
  container.style.marginLeft = 'auto';
  container.style.marginRight = 'auto';

  const headingsContainer = document.createElement('div');
  headingsContainer.style.display = 'flex'; 
  headingsContainer.style.justifyContent = 'space-between';
  headingsContainer.style.width = '100%';

  const headings = ['Heading A', 'Heading B', 'Heading C'];
  headings.forEach((headingText) => {
    const thread = document.createElement('div');
    thread.style.marginBottom = '20px';
    thread.style.flex = '1'; 
    thread.style.display = 'flex';
    thread.style.flexDirection = 'column';
    thread.style.alignItems = 'center';

    const heading = document.createElement('h3');
    heading.innerText = headingText;
    heading.style.textAlign = 'center'; 
    thread.appendChild(heading);

    const paddedBox = document.createElement('div');
    paddedBox.style.padding = '150px';
    paddedBox.style.margin = '20px';
    paddedBox.style.border = '1px solid black';
    paddedBox.style.borderRadius = '4px';
    paddedBox.style.backgroundColor = '#fff';
    thread.appendChild(paddedBox);

    headingsContainer.appendChild(thread);
  });

  container.appendChild(headingsContainer);

  const commentSection = document.createElement('div');
  commentSection.className = 'comment-section';
  commentSection.style.width = '100%';

  const commentForm = document.createElement('form');
  commentForm.className = 'comment-form';
  commentForm.style.display = 'flex';
  commentForm.style.flexDirection = 'column';
  commentForm.style.alignItems = 'flex-start';

  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.placeholder = 'Write a comment...';
  commentInput.style.width = '100%';
  commentInput.style.padding = '10px';
  commentInput.style.marginBottom = '10px';
  commentInput.style.border = '1px solid black';
  commentInput.style.borderRadius = '4px';

  const commentButton = document.createElement('button');
  commentButton.type = 'submit';
  commentButton.innerText = 'Post';
  commentButton.style.padding = '10px 20px';
  commentButton.style.border = 'none';
  commentButton.style.borderRadius = '4px';
  commentButton.style.backgroundColor = '#007BFF';
  commentButton.style.color = '#fff';
  commentButton.style.cursor = 'pointer';

  commentForm.appendChild(commentInput);
  commentForm.appendChild(commentButton);
  commentSection.appendChild(commentForm);
  container.appendChild(commentSection);

  const reactRoot = document.createElement('div');
  reactRoot.id = 'react-root';
  container.appendChild(reactRoot);

  const article = document.querySelector('article');
  if (article) {
    article.parentNode.insertBefore(container, article.nextSibling);
  } else {
          document.body.appendChild(container);
  }

  ReactDOM.render(<InjectedComponent />, reactRoot);

  logEvent('Threads Injected');
}

function logEvent(action) {
  const log = {
    action,
    timestamp: new Date().toISOString()
  };

  try {
    fetch('http://localhost:8000/log', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(log)
    });
  } catch (error) {
    console.error('Error logging event:', error);
  }
}
