import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import CommentBox from '../CommentBox/CommentBox';
import './CommentThread.css';
import IMG from '../../assets/default-avatar-2.png';

const CommentBoxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  width: 100%;
`;

const CommentInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  width: 100%;
`;

const CommentInput = styled.textarea`
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
`;

const CommentActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const UserProfile = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

const AddCommentButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;
`;

const Separator = styled.hr`
  width: 100%;
  border: 0;
  height: 1px;
  background: #ccc;
  margin: 20px 0;
`;

const ThreadHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;  

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
`;

const BackIcon = styled.span`
  margin-right: 5px;
  font-size: 15px;
`;

const CommentThread = ({ topic, onBack }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

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
        <BackButton onClick={onBack}>
          <BackIcon>&larr;</BackIcon> 
          Back
        </BackButton>
      <ThreadHeader className="thread-header">
        <h2>{topic}</h2>
      </ThreadHeader>
      <div className="heading-underline"></div>
      <div className="random-question">{randomQuestion}</div>
      {comments.length > 0 && <div className="comment-count">{comments.length} comments</div>}
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
      <Separator />
      <CommentBoxContainer>
        <UserProfile src={IMG} alt="User Profile" />
        <CommentInputContainer>
          <CommentInput
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <CommentActions>
            <AddCommentButton onClick={handleAddComment}>
              POST
            </AddCommentButton>
          </CommentActions>
        </CommentInputContainer>
      </CommentBoxContainer>
    </div>
  );
};

export default CommentThread;
