import React from "react";
import { createRoot } from 'react-dom/client';
import CommentSection from "../components/CommentSection/CommentSection";

function removeColorControl() {
  // Find the target div with class "comm-fixed fixed-left"
  const targetDiv = document.querySelector('div.article-view'); // this will be changed depending on the website we visit

  if (targetDiv) {
    if (!document.getElementById("react-comment-section")) {
      const commentSectionContainer = document.createElement('div');
      commentSectionContainer.id = 'react-comment-section';
      
      targetDiv.insertAdjacentElement('afterend', commentSectionContainer);
      
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
