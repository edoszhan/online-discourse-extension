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
  container.style.flexDirection = 'column'; // container column view
  container.style.alignItems = 'center'; 
  container.style.width = '80%';
  container.style.marginLeft = 'auto';
  container.style.marginRight = 'auto';

  const headingsContainer = document.createElement('div');
  headingsContainer.style.display = 'flex'; 
  headingsContainer.style.justifyContent = 'space-between'; // distance between headings
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

  // Single comment section at the end
  const commentSection = document.createElement('div');
  commentSection.className = 'comment-section';
  // commentSection.style.marginTop = '20px';
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

  // page is going to relaod after submitting the comment, it is intentional for now
  // commentForm.onsubmit = (e) => {
  //   e.preventDefault(); 
  //   if (commentInput.value.trim() !== '') {
  //     const commentItem = document.createElement('div');
  //     commentItem.innerText = commentInput.value.trim();
  //     commentItem.style.padding = '10px';
  //     commentItem.style.marginTop = '10px';
  //     commentItem.style.border = '1px solid #ddd';
  //     commentItem.style.borderRadius = '4px';
  //     commentItem.style.backgroundColor = '#fff';
  //     commentSection.appendChild(commentItem);
  //     commentInput.value = '';
  //   }
  // };

  const article = document.querySelector('article');
  if (article) {
    article.parentNode.insertBefore(container, article.nextSibling);
  } else {
    document.body.appendChild(container);
  }

  logEvent('Threads Injected');
}

function logEvent(action) {
  const log = {
    action,
    timestamp: new Date().toISOString()
  };

  fetch('http://localhost:8000/log', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(log)
  });
}
