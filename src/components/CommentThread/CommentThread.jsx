import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import CommentBox from '../CommentBox/CommentBox';
import './CommentThread.css';
// import IMG from '../img/default-avatar-2.png';
import ReviewPage from '../level1/ReviewPage';
import SummarizeButton from '../level1/SummarizeBox';
import axios from 'axios';

const CommentThread = ({ threadId, topic, onBack, level, userId}) => {
  console.log('User ID in thread:', userId);
  console.log('User Level in thread:', level);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCounter, setCommentCounter] = useState(0);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

  useEffect(() => {
    fetchComments();
    setCommentCounter(countAllComments(comments));
  }, [threadId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/comments/${threadId}`);
      const data = response.data || []; 
      setComments(data);
      console.log(data);
      setCommentCounter(countAllComments(data));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };


  const countAllComments = (comments) => {
    let count = 0;
    const countChildComments = (comment) => {
      count++;
      if (comment.children && comment.children.length > 0) {
        comment.children.forEach(countChildComments);
      }
    };
    comments.forEach(countChildComments);
    return count;
  };

  const onDragEnd = (result) => {
    console.log('Drag ended:', result);
    const { destination, source, draggableId } = result;
  
    if (source.droppableId === destination.droppableId) {
      return;
    }
  
    if (!destination) {
      return;
    }
  
    const draggedComment = comments.find((comment) => comment.id === draggableId);
    const originalOrder = comments.map((comment) => comment.id);
  
    const getParentChildRelationship = (comments) => {
      const relationship = [];
      for (const comment of comments) {
        const commentObj = {
          id: comment.id,
          text: comment.text,
          children: [],
        };
        if (comment.children.length > 0) {
          commentObj.children = getParentChildRelationship(comment.children);
        }
        relationship.push(commentObj);
      }
      return relationship;
    };
  
    const parentChildRelationship = getParentChildRelationship(comments);
  
    let updatedComments = [...comments];
  
    console.log("hard clustering");
    updatedComments = comments.map((comment) => {
      if (comment.id === destination.droppableId) {
        return {
          ...comment,
          children: [...comment.children, { ...draggedComment, prevOrder: originalOrder }],
          pendingReview: true,
        };
      }
      return comment;
    }).filter((comment) => comment.id !== draggableId);
  
    updatedComments = updatedComments.map((comment) => {
      if (comment.id === destination.droppableId) {
        return {
          ...comment,
          pendingReview: true,
        };
      }
      return comment;
    });
  
    const getNewOrder = (comments) => {
      let newOrder = [];
      for (const comment of comments) {
        newOrder.push(comment.id);
        if (comment.children.length > 0) {
          newOrder = [...newOrder, ...getNewOrder(comment.children)];
        }
      }
      return newOrder;
    };
  
    const newOrder = getNewOrder(updatedComments);
  
    const reviewObj = {
      prevOrder: originalOrder,
      newOrder: newOrder,
      sourceId: source.droppableId,
      destinationId: destination.droppableId,
      parentChildRelationship: parentChildRelationship,
    };
  
    setReviewsList([...reviewsList, reviewObj]);
    setComments(updatedComments);
    setCommentCounter(countAllComments(updatedComments));
  };
  
  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        console.log("user id when adding:", userId);
        const timestamp = new Date().toISOString();
        const response = await axios.post('http://localhost:8000/api/comments', {
          thread_id: threadId,
          text: newComment,
          author: userId,
          timestamp: timestamp,
          upvotes: 0,
          children: [],
        });
        setComments([...comments, response.data]);
        setNewComment('');
        setCommentCounter(commentCounter + 1);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  if (showReviewPage && level === "L1") {
    return (
      <ReviewPage 
        comments={comments} 
        setComments={setComments} 
        onBack={() => setShowReviewPage(false)} 
        reviewsList={reviewsList}
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
      {comments && comments.length > 0 && <div className="comment-count">{commentCounter} comments</div>}
      {level === "L1" && (
        <ReviewButton onClick={() => setShowReviewPage(true)}>Review clustered comments &gt;&gt;</ReviewButton>
      )} 
      </div>
      {comments && comments.length === 0 ? (
        <div className="no-comments">
          <p>No Comments</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd} onDragStart={console.log("drag start")}>
          <Droppable droppableId="droppable-comments">
            {(provided, snapshot) => (
              <CommentsContainer ref={provided.innerRef} {...provided.droppableProps}>
                {comments && comments.map((comment, index) => {
                  return (
                    (comment.children && comment.children.length > 0) ? (
                      <CombinedCommentContainer key={comment.id}>
                        <CommentBox comment={comment} index={index} isDraggingOver={snapshot.isDraggingOver} />
                        <ReviewMessage>This change will be reviewed by the person in charge.</ReviewMessage>
                      </CombinedCommentContainer>
                  ) : (
                    <CommentBox key={comment.id} comment={comment} index={index} isDraggingOver={snapshot.isDraggingOver} />
                  )
                  );
                })}
                {provided.placeholder}
              </CommentsContainer>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Separator />
      <CommentBoxContainer>
        <UserProfile src={chrome.runtime.getURL('/static/media/default-avatar-2.png')} alt="User Profile" />
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
