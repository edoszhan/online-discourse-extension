import React from "react";
import { createRoot } from 'react-dom/client';
import CommentSection from "../components/CommentSection/CommentSection";

// function injectCSS(filePath) {
//   const link = document.createElement('link');
//   link.href = chrome.runtime.getURL(filePath);
//   link.type = 'text/css';
//   link.rel = 'stylesheet';
//   document.head.appendChild(link);
// }

function removeColorControl() {
  // Find the target div with class "comm-fixed fixed-left"
  const targetDiv = document.querySelector('article'); // this will be changed depending on the website we visit
  
  if (targetDiv) {
    if (!document.getElementById("react-comment-section")) {
      const commentSectionContainer = document.createElement('div');
      commentSectionContainer.id = 'react-comment-section';
      
      targetDiv.insertAdjacentElement('afterend', commentSectionContainer);
      
      // // Inject CSS files
      // injectCSS('static/css/CommentSection.css');
      // injectCSS('static/css/CommentThread.css');
      // injectCSS('static/css/CommentBox.css');
      
      const root = createRoot(commentSectionContainer);
      root.render(<CommentSection />);
    }
  } else {
    console.error('Target div not found');
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'removeColorControl') {
    console.log('tables added');
    removeColorControl();
  }
});


// import React from "react";
// import { createRoot } from 'react-dom/client';
// import CommentSection from "../components/CommentSection/CommentSection";

// function removeColorControl() {
//   // Find the target div with class "comm-fixed fixed-left"
//   const targetDiv = document.querySelector('article'); // this will be changed depending on the website we visit
  
//   if (targetDiv) {
//     if (!document.getElementById("react-comment-section")) {
//       const commentSectionContainer = document.createElement('div');
//       commentSectionContainer.id = 'react-comment-section';
      
//       targetDiv.insertAdjacentElement('afterend', commentSectionContainer);
      
//       const root = createRoot(commentSectionContainer);
//       root.render(<CommentSection />);
//     }
//   } else {
//     console.error('Target div not found');
//   }
// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'removeColorControl') {
//     console.log('tables added');
//     removeColorControl();
//   }
// });
