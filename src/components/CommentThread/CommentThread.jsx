import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CommentBox from '../CommentBox/CommentBox';
import './CommentThread.css';

const CommentThread = ({ topic }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return;

    const reorderedComments = Array.from(comments);
    const [movedComment] = reorderedComments.splice(source.index, 1);
    reorderedComments.splice(destination.index, 0, movedComment);

    setComments(reorderedComments);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: Date.now().toString(), text: newComment }]);
      setNewComment('');
    }
  };

  return (
    <div className="comment-thread-container">
      <div className="thread-header">
        <h2>{topic}</h2>
        <div className="heading-underline"></div>
        {comments.length > 0 && <div className="comment-count">{comments.length} comments</div>}
      </div>
      {comments.length === 0 ? (
        <div className="no-comments">
          <p>No Comments</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div className="comments-list" {...provided.droppableProps} ref={provided.innerRef}>
                {comments.map((comment, index) => (
                  <Draggable key={comment.id} draggableId={comment.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <CommentBox comment={comment.text} isDragging={snapshot.isDragging} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <div className="comment-box-container">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button onClick={handleAddComment} className="add-comment-button">
          POST
        </button>
      </div>
    </div>
  );
};

export default CommentThread;
