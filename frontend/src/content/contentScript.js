import React from "react";
import { createRoot } from 'react-dom/client';
import CommentSection from "../components/CommentSection/CommentSection";
import { DragDropContext } from '@hello-pangea/dnd';
import CommentThreadBaseline from "../components/baseline/CommentThreadBaseline";


function removeColorControl(userId, level) {
  // Find the target div with class "comm-fixed fixed-left"
  const targetDiv = document.querySelector('article'); // this will be changed depending on the website we visit
  
  if (targetDiv) {
    if (!document.getElementById("react-comment-section")) {
      const commentSectionContainer = document.createElement('div');
      commentSectionContainer.id = 'react-comment-section';
      
      targetDiv.insertAdjacentElement('afterend', commentSectionContainer);
      
      
      const root = createRoot(commentSectionContainer);
      root.render(
        <DragDropContext>
          <CommentSection userId={userId} level={level}/>
          {/* <CommentThreadBaseline userId={userId}/> */}
        </DragDropContext>);
    }
  } else {
    console.error('Target div not found');
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'removeColorControl') {
    if ( request.payload === undefined ) {
      return;
    }
    removeColorControl(request.payload.userId, request.payload.level);
  }
});

