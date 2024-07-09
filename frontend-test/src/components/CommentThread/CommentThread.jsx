import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import CommentBox from '../CommentBox/CommentBox';
import './CommentThread.css';
import IMG from '../../assets/default-avatar-2.png';  
import ReviewPage from '../level1/ReviewPage';

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

const CombinedCommentContainer = styled.div`
  padding: 10px;
  margin: 10px 0;
  background-color: #D9DBF4;
  border: 1px solid lightgray;
`;

const ReviewMessage = styled.div`
  font-size: 12px;
  color: #555;
  margin-top: 10px;
  margin-right: 5px;
  text-align: right;
`;

const CommentsContainer = styled.div`
  margin-top: 10px;
  // border-radius: 5px;
  padding: 10px;
  // background-color: ${(props) => (props.isDraggingOver ? 'lightblue' : 'lightgrey')};
  background-color: #F2F2F2;
  //  border: 2px solid #000;
`;
const ReviewButton = styled.button`
  background-color: #5D6BE5;
  color: white;
  border: none;
  padding: 4px 5px;
  margin: 5px 0;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
`;

const HeaderUnderline = styled.div`
  width: 120%;
  height: 2px;
  background-color: #5D6BE5;
  margin-bottom: 10px;
`;


const CommentThread = ({ topic, onBack, userLevel = 1 }) => {
  const [comments, setComments] = useState([
    { id: '101', text: 'This is the first comment.', children: [], pendingReview: false, prevOrder: []},
    { id: '102', text: 'This is the second comment.', children: [], pendingReview: false, prevOrder: []},
    { id: '103', text: 'This is the third comment.', children: [], pendingReview: false, prevOrder: []},
  ]);
  const [newComment, setNewComment] = useState('');
  const [commentCounter, setCommentCounter] = useState(comments.length);
  const [showReviewPage, setShowReviewPage] = useState(false);

  const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

  useEffect(() => {
    setCommentCounter(countAllComments(comments));
  }, [comments]);

  const countAllComments = (comments) => {
    let count = comments.length;
    comments.forEach(comment => {
      count += countAllComments(comment.children);
    });
    return count;
  };

  const onDragEnd = (result) => {
    console.log("onDragEnd result:", result);
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log("Dropped in the same position");
      return;
    }

    const draggedComment = comments.find((comment) => comment.id === draggableId);
    
    if (destination.droppableId === source.droppableId) {
      console.log("simple reorder");
      // reordering
      const newComments = Array.from(comments);
      const [removed] = newComments.splice(source.index, 1);
      newComments.splice(destination.index, 0, removed);
      setComments(newComments);
    } else {
      // clustering 
      console.log("hard clustering");
      const updatedComments = comments.map((comment) => {
        if (comment.id === destination.droppableId) {
          console.log("Success");
          return {
            ...comment,
            // children: [...comment.children, draggedComment],
            children: [...comment.children, { ...draggedComment, prevOrder: [...comment.children.map(c => c.id)] }],
            pendingReview: true,
          };
        }
        return comment;
      });
      const filteredComments = updatedComments.filter((comment) => comment.id !== draggableId);
      setComments(filteredComments);
      setCommentCounter(countAllComments(filteredComments));
      
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentId = (parseInt(comments[comments.length - 1]?.id || '100') + 1).toString();
      setComments([...comments, { id: newCommentId.toString(), text: newComment, children: [], pendingReview: false }]);
      setNewComment('');
    }
  };

  if (showReviewPage && userLevel === 1) {
    return (
      <ReviewPage 
        comments={comments} 
        setComments={setComments} 
        onBack={() => setShowReviewPage(false)} 
        header={
          <>
            <h2>{topic}</h2>
            <HeaderUnderline />
            <div>
              {commentCounter} comments 
              <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
                (REVIEWING)
              </span>
            </div>
          </>
        }
      />
    );
  }

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
      <div style={{ display: 'flex', justifyContent:'space-between', alignItems: 'center' }}>
      {comments.length > 0 && <div className="comment-count">{commentCounter} comments</div>}
      {userLevel === 1 && (
        <ReviewButton onClick={() => setShowReviewPage(true)}>Review clustered comments &gt;&gt;</ReviewButton>
      )} 
      </div>
      {comments.length === 0 ? (
        <div className="no-comments">
          <p>No Comments</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-comments">
            {(provided, snapshot) => (
              <CommentsContainer ref={provided.innerRef} {...provided.droppableProps}>
                {comments.map((comment, index) => (
                  comment.children.length > 0 ? (
                    <CombinedCommentContainer key={comment.id}>
                      <CommentBox comment={comment} index={index} />
                      <ReviewMessage>This change will be reviewed by the person in charge.</ReviewMessage>
                    </CombinedCommentContainer>
                  ) : (
                    <CommentBox key={comment.id} comment={comment} index={index} />
                  )
                ))}
                {provided.placeholder}
              </CommentsContainer>
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




