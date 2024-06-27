import React, { useState } from 'react';
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

  return (
    <div className="comment-thread">
      <h3>{topic}</h3>
      <p>Comments ({comments.length})</p>
      <div className="comments-list">
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <CommentBox key={index} comment={comment} />
          ))
        )}
      </div>
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
