import React from "react";
import { createRoot } from 'react-dom/client';
import CommentSection from "../components/CommentSection/CommentSection";

function removeColorControl() {
  // const styleId = "un-color-display";
  // const styleContent = `
  //         html {
  //           filter: grayscale(1)!important;
  //         }
  //       `;
  
  // const styleElement = document.getElementById(styleId);

  // if (styleElement) {
  //   document.head.removeChild(styleElement);
  // } else {
  //   const newStyleElement = document.createElement("style");
  //   newStyleElement.id = styleId;
  //   newStyleElement.innerHTML = styleContent;
  //   document.head.appendChild(newStyleElement);
  // }

  // Inject the comment section HTML
  // const commentSectionHTML = `
  //   <div class="comment-section css-s2htvn">
  //     <div class="discussion-threads" style="width: 100%;">
  //       <h2> Discussion About the Articles </h2>
  //       <div class="thread-list"">
  //         <div class="thread-box""></div>
  //         <div class="thread-box""></div>
  //         <div class="thread-box""></div>
  //       </div>
  //     </div>
  //     <div class="comments" style="width: 100%;">
  //       <h2> Comments </h2>
  //       <div class="comments-list"></div>
  //       <textarea id="new-comment" placeholder="Add a comment..." style="width: 100%;"></textarea>
  //       <button class="add-comment">Add Comment</button>
  //     </div>
      
  //   </div>
  //   `;



  // Find the specific section
  const targetSection = document.querySelector('section[name="articleBody"]');

  if (targetSection) {
    // Check if comment section already exists to avoid duplications
    if (!document.getElementById("comment-section")) {
      // targetSection.insertAdjacentHTML('afterend', commentSectionHTML);
      const commentSectionContainer = document.createElement('div');
      commentSectionContainer.id = 'react-comment-section';
      targetSection.insertAdjacentElement('afterend', commentSectionContainer);
      // Create a root and render the component
      const root = createRoot(commentSectionContainer);
      root.render(<CommentSection />);    }
  } else {
    console.error('Target section not found');
  }

}

   
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.action === 'removeColorControl') {
  console.log('remove');
  removeColorControl();

}
});


