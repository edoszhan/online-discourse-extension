import React from "react";
import { createRoot } from 'react-dom/client';
import CommentSection from "../components/CommentSection/CommentSection";
import { DragDropContext } from '@hello-pangea/dnd';


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
        </DragDropContext>);
    }
  } else {
    console.error('Target div not found');
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'removeColorControl') {
    console.log('tables added');
    if ( request.payload === undefined ) {
      console.log("nothing reached");
      return;
    }
    console.log("User Id in script: ", request.payload.userId);
    console.log("User Level in script: ", request.payload.level);
    removeColorControl(request.payload.userId, request.payload.level);
  }
});

