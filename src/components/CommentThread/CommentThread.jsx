import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import './CommentThread.css';
import CommentBox from '../CommentBox/CommentBox';

const CommentThread = ({ topic }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedComments = Array.from(comments);
    const [movedComment] = reorderedComments.splice(result.source.index, 1);
    reorderedComments.splice(result.destination.index, 0, movedComment);

    setComments(reorderedComments);
  };

  return (
    <div className="comment-thread">
      <h3>{topic}</h3>
      <p>Comments ({comments.length})</p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="comments">
          {(provided) => (
            <div
              className="comments-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((comment, index) => (
                  <CommentBox key={index} comment={comment} index={index} />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        ></textarea>
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default CommentThread;
