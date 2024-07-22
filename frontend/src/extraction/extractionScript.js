function extractArticleText() {
    let articleContent = document.querySelectorAll('div.article__content-container p');
    let articleText = '';
  
    articleContent.forEach(paragraph => {
      articleText += paragraph.innerText + '\n';
    });
  
    return{ text: articleText.trim(), url: window.location.href};
  }

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'START_EXTRACTION') {
    const { text, url } = extractArticleText(); 
    chrome.runtime.sendMessage({ type: 'ARTICLE_TEXT_EXTRACTED', text, url });
  }
});

  