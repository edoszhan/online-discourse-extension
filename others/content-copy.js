chrome.storage.sync.get(['selectedRole', 'comments'], (result) => {
    const role = result.selectedRole || 'L0';
    const comments = result.comments || {
      "Heading X": [],
      "Heading Y": [],
      "Heading Z": []
    };
    const validPage = !chrome.runtime.getURL('/').includes(window.location.origin);
  
    if (validPage) {
      injectThreads(role, comments);
    }
  });
  
  function injectThreads(role, comments) {
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
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.gap = '20px';
  
    const headings = ['Heading X', 'Heading Y', 'Heading Z'];
    headings.forEach((headingText) => {
      const thread = document.createElement('div');
      thread.style.flex = '1';
      thread.style.border = '1px solid #ddd';
      thread.style.padding = '10px';
      thread.style.backgroundColor = '#e0ffe0';
      thread.style.borderRadius = '8px';
  
      const heading = document.createElement('h2');
      heading.innerText = headingText;
      thread.appendChild(heading);
  
      const commentSection = document.createElement('div');
      commentSection.className = 'comment-section';
  
      const commentList = document.createElement('ul');
      commentList.className = 'comment-list';
      commentList.style.listStyleType = 'none';
      commentList.style.padding = '10px';
      comments[headingText].forEach(comment => {
        const commentItem = document.createElement('li');
        commentItem.style.border = '1px solid #ccc';
        commentItem.style.margin = '5px 0';
        commentItem.style.padding = '5px';
        commentItem.style.borderRadius = '4px';
        commentItem.innerText = `${comment.user}: ${comment.text}`;
        commentList.appendChild(commentItem);
      });
      commentSection.appendChild(commentList);
      thread.appendChild(commentSection);
      container.appendChild(thread);
    });
  
    const commentFormContainer = document.createElement('div');
    commentFormContainer.style.width = '100%';
    commentFormContainer.style.marginTop = '20px';
  
    const commentForm = document.createElement('form');
    commentForm.className = 'comment-form';
    commentForm.style.display = 'flex';
    commentForm.style.gap = '10px';
  
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Write a comment...';
    commentInput.style.flex = '1';
    commentForm.appendChild(commentInput);
  
    const commentSelect = document.createElement('select');
    headings.forEach(heading => {
      const option = document.createElement('option');
      option.value = heading;
      option.innerText = heading;
      commentSelect.appendChild(option);
    });
    commentForm.appendChild(commentSelect);
  
    const commentButton = document.createElement('button');
    commentButton.type = 'submit';
    commentButton.innerText = 'Post';
    commentForm.appendChild(commentButton);
  
    commentForm.onsubmit = (e) => {
      e.preventDefault();
      const selectedHeading = commentSelect.value;
      const user = 'User1'; // Replace with dynamic user identification if available
      if (commentInput.value.trim() !== '') {
        const commentItem = document.createElement('li');
        commentItem.style.border = '1px solid #ccc';
        commentItem.style.margin = '5px 0';
        commentItem.style.padding = '5px';
        commentItem.style.borderRadius = '4px';
        commentItem.innerText = `${user}: ${commentInput.value.trim()}`;
        const commentList = container.querySelector(`h2:contains('${selectedHeading}')`).nextElementSibling.firstElementChild;
        commentList.appendChild(commentItem);
        saveComment(selectedHeading, { user, text: commentInput.value.trim() });
        commentInput.value = '';
      }
    };
  
    commentFormContainer.appendChild(commentForm);
    container.appendChild(commentFormContainer);
  
    const article = document.querySelector('article');
    if (article) {
      article.parentNode.insertBefore(container, article.nextSibling);
    } else {
      document.body.appendChild(container);
    }
  
    logEvent('Threads Injected');
  }
  
  function saveComment(thread, comment) {
    chrome.storage.sync.get(['comments'], (result) => {
      const comments = result.comments || {
        "Heading X": [],
        "Heading Y": [],
        "Heading Z": []
      };
      comments[thread].push(comment);
      chrome.storage.sync.set({ comments });
    });
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
  