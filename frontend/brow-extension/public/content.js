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
  container.style.border = '1px solid #ddd';
  container.style.padding = '20px';
  container.style.marginTop = '20px';
  container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  container.style.backgroundColor = '#f9f9f9';
  container.style.borderRadius = '8px';

  const headings = ['Heading A', 'Heading B', 'Heading C'];
  headings.forEach((headingText) => {
    const thread = document.createElement('div');
    thread.style.marginBottom = '20px';

    const heading = document.createElement('h3');
    heading.innerText = `${headingText} - Role ${role}`;
    thread.appendChild(heading);

    const commentSection = document.createElement('div');
    commentSection.className = 'comment-section';

    const commentList = document.createElement('ul');
    commentList.className = 'comment-list';
    commentSection.appendChild(commentList);

    const commentForm = document.createElement('form');
    commentForm.className = 'comment-form';

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Write a comment...';
    commentForm.appendChild(commentInput);

    const commentButton = document.createElement('button');
    commentButton.type = 'submit';
    commentButton.innerText = 'Post';
    commentForm.appendChild(commentButton);

    commentForm.onsubmit = (e) => {
      e.preventDefault();
      if (commentInput.value.trim() !== '') {
        const commentItem = document.createElement('li');
        commentItem.innerText = commentInput.value.trim();
        commentList.appendChild(commentItem);
        commentInput.value = '';
      }
    };

    commentSection.appendChild(commentForm);
    thread.appendChild(commentSection);
    container.appendChild(thread);
  });

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

  fetch('http://localhost:8000/log', { // Replace with your backend URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(log)
  });
}