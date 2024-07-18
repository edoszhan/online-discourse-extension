
// }
// function sendArticleTextToServer(articleText) {
//     fetch('http://localhost:8000/generate-topics', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ text: articleText })
//     })
//     .then(response => response.json())
//     .then(data => {
//         chrome.runtime.sendMessage({ type: 'TOPICS_GENERATED', topics: data.topics });
//     })
//     .catch(error => console.error('Error:', error));
// } 
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// if (request.type === 'EXTRACT_ARTICLE_TEXT') {
//     console.log('Received message to extract article text');
//     let articleText = extractArticleText();
//     if (articleText) {
//     console.log('Sending extracted article text to background script');
//     chrome.runtime.sendMessage({ type: 'ARTICLE_TEXT_EXTRACTED', text: articleText });
//     } else {
//     console.log('No article text found');
//     }
// }
// });

// extractionScript.js

function extractArticleText() {
    let articleContent = document.querySelectorAll('div.article__content-container p');
    let articleText = '';
  
    articleContent.forEach(paragraph => {
      articleText += paragraph.innerText + '\n';
    });
  
    // console.log('Extracted article text:', articleText);
    return articleText.trim();
  }
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_EXTRACTION') {
    const extractedText = extractArticleText(); 
    // console.log('Extracted text:', extractedText);
    chrome.runtime.sendMessage({type: 'ARTICLE_TEXT_EXTRACTED', text: extractedText});
  }
});
  