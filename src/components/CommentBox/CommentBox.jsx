import React from 'react';
import './CommentBox.css';

const CommentBox = ({ comment }) => {
  return (
    <div className="comment-box">
      <div className="user-avatar">
        <span>U</span>
      </div>
      <div className="comment-content">
        <p>{comment}</p>
      </div>
    </div>
  );
};
export default CommentBox;
