import React from 'react';
import ReactDOM from 'react-dom/client';
import CommentSection from './components/CommentSection/CommentSection';
import './index.css';
import { DragDropContext } from '@hello-pangea/dnd';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <DragDropContext>
    <CommentSection />
    </DragDropContext>
  </React.StrictMode>
);
