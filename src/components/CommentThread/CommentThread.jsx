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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCounter, setCommentCounter] = useState(0);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

  useEffect(() => {
    fetchComments();
    const clusteringData = window.localStorage.getItem('clusteringData');
    if (clusteringData) {
      setComments(JSON.parse(clusteringData));
    }
    setCommentCounter(countAllComments(comments));
  }, []);

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

  const onDragEnd = async (result) => {
    console.log('Drag ended:', result);
    const { destination, source, draggableId } = result;
  
    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }
    const draggedCommentId = parseInt(draggableId, 10);
    const draggedComment = comments.find((comment) => comment.id === draggedCommentId);

    if (!draggedComment){
      console.log('Dragged comment not found');
      return;
    }

    console.log('Dragged comment:', draggedComment);

    const originalOrder = comments.map((comment) => comment.id);

    const updatedComments = comments.map((comment) => {
      if (comment.id === parseInt(destination.droppableId.split('-')[1])) {
        return {
          ...comment,
          cluster_id: parseInt(draggableId),
        };
      }
      return comment;
    })

    console.log('Updated comments:', updatedComments);
  
    // const newOrder = updatedComments.map((comment) => comment.id);

    const newOrder = updatedComments.map((comment) => {
      if (comment.id === parseInt(destination.droppableId.split('-')[1])) {
        return parseInt(draggableId);
      }
      return comment.id;
    });
  
    const reviewObj = {
      prevOrder: originalOrder,
      newOrder: newOrder,
      sourceId: parseInt(draggableId),
      destinationId: parseInt(destination.droppableId.split('-')[1]),
      pendingReview: true,
      acceptedBy: [],
      deniedBy: [],
      author: userId,
      timestamp: new Date().toISOString(),
    };
    console.log("reviewObJ in thread", reviewObj);

    try {
      await axios.post('http://localhost:8000/api/reviews', reviewObj);
      // await axios.put(`http://localhost:8000/api/comments/${threadId}/${draggableId}`, { cluster_id: destination.droppableId.split('-')[1] }); 
      window.localStorage.setItem('clusteringData', JSON.stringify(updatedComments));
      setReviewsList([...reviewsList, reviewObj]);
      setComments(updatedComments);
      setCommentCounter(countAllComments(updatedComments));
      fetchComments(); // needs to be checked
    } catch (error) {
      console.error('Error sending review data:', error);
    }
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
          cluster_id: null,
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
        onBack={() => setShowReviewPage(false)} 
        threadId={threadId}
        userId={userId}
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
        <DragDropContext onDragEnd={onDragEnd}>
  <CommentsContainer>
    {comments
      .filter((comment) => comment.cluster_id === null)
      .map((comment, index) => {
        const clusteredComments = comments.filter(
          (c) => c.cluster_id === comment.id
        );
        return (
          <React.Fragment key={comment.id}>
            {clusteredComments.length > 0 ? (
              <CombinedCommentContainer>
                <CommentBox
                  comment={comment}
                  index={index}
                  clusteredComments={clusteredComments}
                />
                {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SummarizeButton comment={comment} />
                </div> */}
                <ReviewMessage> This change will be reviewed by a person in charge</ReviewMessage>
              </CombinedCommentContainer>
            ) : (
              <CommentBox
                comment={comment}
                index={index}
                clusteredComments={[]}
              />
            )}
          </React.Fragment>
        );
      })}
  </CommentsContainer>
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
