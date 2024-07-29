import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { DragDropContext} from '@hello-pangea/dnd';
import CommentBox from '../CommentBox/CommentBox';
import './CommentThread.css';
import ReviewPage from '../level1/ReviewPage';
import SummarizeButton from '../level1/SummarizeBox';
import SummaryCollapse from '../level1/SummaryCollapse';
import axios from 'axios';
import AcceptedPopup from './AcceptedPopup';
import CommentUnit from '../CommentBox/CommentUnit';
import { v4 as uuidv4 } from 'uuid';

const CommentThread = ({ articleId, threadId, topic, onBack, level, userId,  question, color}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCounter, setCommentCounter] = useState(0);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [acceptedReviews, setAcceptedReviews] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const commentInputRef = useRef(null);
  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);

  const [isClusterDeleted, setIsClusterDeleted] = useState(false);
  const [deletedClusters, setDeletedClusters] = useState([]);


  useEffect(() => {
    if (replyingTo) {
      commentInputRef.current.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    fetchComments();
    fetchAcceptedReviews();
    initializeLocalStorage();
  }, []);


  const ClusterPopup = ({ clusters, comments, onClose }) => (
    <Overlay>
      <PopupContainer>
        <h3>Here are the updates made in your absence:</h3>
        <ScrollContainer>
        {clusters.map((cluster, index) => {
          const destinationComment = comments.find(comment => comment.id === cluster.destinationId);
          const replies = comments.filter(comment => comment.children_id === cluster.destinationId);
          const clusteredComments = comments.filter(comment => comment.cluster_id === cluster.destinationId);
  
          return (
            <ClusterSection key={cluster.uid}>
              <ClusterLabel>Cluster #{index + 1} Result - Accepted</ClusterLabel>
              {destinationComment ? (
                <CommentUnit
                  articleId={articleId}
                  threadId={threadId}
                  comment={destinationComment}
                  index={0}
                  clusteredComments={clusteredComments}
                  childrenComments={replies}
                  userId={userId}
                  level={level}
                />
              ) : (
                <p>Destination comment not found</p>
              )}
            </ClusterSection>
          );
        })}
        </ScrollContainer>
          <ButtonContainerPopup>
            <OkayButton onClick={onClose}>Close</OkayButton>
          </ButtonContainerPopup>
      </PopupContainer>
    </Overlay>
  );


  const initializeLocalStorage = () => {
    const storageKey = `clusters_${articleId}_${threadId}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify({}));
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchComments();
      await fetchAcceptedReviews();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  }

  const handleClosePopup = () => {
    setShowAcceptedPopup(false);
  };
  
  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      const data = response.data || []; 

      const storageKey = `clusters_${articleId}_${threadId}`;
      const clusters = JSON.parse(localStorage.getItem(storageKey));

      const updatedComments = data.map(comment => {
        const cluster = Object.values(clusters).find(c => c.sourceId === comment.id);
        if (cluster) {
          return { ...comment, cluster_id: cluster.destinationId };
        }
        return comment;
      });

      setComments(updatedComments);
      setCommentCounter(countAllComments(updatedComments));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchAcceptedReviews = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`);
      const acceptedReviews = response.data.filter((review) => !review.pendingReview);
      setAcceptedReviews(acceptedReviews);

      const storageKey = `clusters_${articleId}_${threadId}`;
      const clusters = JSON.parse(localStorage.getItem(storageKey));
      
      let clustersChanged = false;
      let deletedClustersArray = [];
      acceptedReviews.forEach(review => {
        if (review.pendingReview != null) {
          Object.entries(clusters).forEach(([uid, cluster]) => {
            if (cluster.children && cluster.children[0] === review.newOrder[0]) {
              deletedClustersArray.push(cluster);
              delete clusters[uid];
              clustersChanged = true;
            }
          });
        }
      });

      if (clustersChanged) {
        localStorage.setItem(storageKey, JSON.stringify(clusters));
      }

      if (deletedClustersArray.length > 0) {
        setDeletedClusters(deletedClustersArray);
        setIsClusterDeleted(true);
      }

    } catch (error) {
      console.error('Error fetching accepted reviews:', error);
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

  const clientChange = (result) => {
    const { destination, source } = result;

    if (!destination || source.droppableId=== destination.droppableId) {
      return;
    }
    
    const uid = uuidv4();
    setComments(prevComments => {
      const updatedComments = prevComments.map(comment => {
        if (comment.id === parseInt(source.droppableId.split('-')[1])) {
          return {
            ...comment,
            cluster_id: parseInt(destination.droppableId.split('-')[1]),
            children: [...(comment.children || []), uid]
          };
        }
        return comment;
      });
      return updatedComments;
    });

    const storageKey = `clusters_${articleId}_${threadId}`;
    const clusters = JSON.parse(localStorage.getItem(storageKey));
    clusters[uid] = {
      sourceId: parseInt(source.droppableId.split('-')[1]),
      destinationId: parseInt(destination.droppableId.split('-')[1]),
      children: [uid]
    };
    localStorage.setItem(storageKey, JSON.stringify(clusters));

    return uid;
  };

  const serverChange = async (result, uid) => {
    const { destination, source } = result;

    if (!destination || source.droppableId=== destination.droppableId) {
      return;
    }
    
    try {
      const sourceComment = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${source.droppableId.split('-')[1]}`);
      const destinationComment = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${destination.droppableId.split('-')[1]}`);
  
      const sourceHasClusters = sourceComment.data.hasClusters;
      const sourceClusterId = sourceComment.data.cluster_id;
      const destinationHasClusters = destinationComment.data.hasClusters;
      const destinationClusterId = destinationComment.data.cluster_id;
      
       // Case 1: Both source and destination have hasClusters true
      if (sourceHasClusters && destinationHasClusters) {
        console.log("Auto reject 1 case");
        return;
      }
      // Case 2: Destination has a non-null cluster_id
      if (destinationClusterId !== null) {
        console.log("Auto rejected 2 case");
        return;
      }
       // Case 3: Destination has hasClusters false and cluster_id null, and source has hasClusters true
      if (!destinationHasClusters && destinationClusterId === null && sourceHasClusters) {
        console.log("Swapping source and destination");
        const reviewObj = {
          article_id: articleId, 
          thread_id: threadId,
          author: userId,
          timestamp: new Date(),
          sourceId: parseInt(destination.droppableId.split('-')[1]),
          destinationId: parseInt(source.droppableId.split('-')[1]),
          pendingReview: null,
          newOrder: [uid.toString()],
          prevOrder: [],
          acceptedBy: [],
          deniedBy: []
        };
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`, reviewObj);
        setShowAcceptedPopup(true);
      } else {
        const reviewObj = {
          article_id: articleId, 
          thread_id: threadId,
          author: userId,
          timestamp: new Date(),
          sourceId: parseInt(source.droppableId.split('-')[1]),
          destinationId: parseInt(destination.droppableId.split('-')[1]),
          pendingReview: null,
          newOrder: [uid.toString()],
          prevOrder: [],
          acceptedBy: [],
          deniedBy: [],
          summary: null
        };
        console.log("reviewObj  is this: ", reviewObj);
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`, reviewObj);
        setShowAcceptedPopup(true);
      }
    } catch (error) {
      console.error('Error updating comment order:', error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const uid = clientChange(result);
    await serverChange(result, uid);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const timestamp = new Date();
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/${threadId}/comments`, {
          thread_id: threadId,
          text: newComment,
          author: userId,
          timestamp: timestamp,
          upvotes: [],
          children: [],
          cluster_id: null,
          article_id: articleId,
          children_id: replyingTo ? replyingTo : null,
          hasClusters: false,
        });
        setComments([...comments, response.data]);
        setNewComment('');
        setCommentCounter(commentCounter + 1);
        setReplyingTo(null);
        fetchComments();
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleReplyClick = (commentId) => {
    console.log("replying to", commentId || null);
    setReplyingTo(commentId);
  };

  if (showReviewPage && level === "L1") {
    return (
      <ReviewPage 
        articleId={articleId}
        threadId={threadId}
        onBack={() => setShowReviewPage(false)} 
        userId={userId}
        header={
          <>
            <h2>{topic}</h2>
            <div className="heading-underline" style={{ backgroundColor: color }}></div>
            <br></br>
            <div>
              {acceptedReviews.filter((review) => review.pendingReview === null).length} reviews
              <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
                (REVIEWING)
              </span>
            </div>
          </>
        }
      />
    );
  }

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="comment-thread-container">
      <ButtonContainer>
      <BackButton onClick={handleBack}>
        <BackIcon>&larr;</BackIcon>
        Back
      </BackButton>
      <RefreshButton onClick={handleRefresh}>
        <RefreshIcon>&#8635;</RefreshIcon>
        Refresh
      </RefreshButton>
      </ButtonContainer>
      <ThreadHeader className="thread-header">
        <h2>{topic}</h2>
      </ThreadHeader>
      <div className="heading-underline" style={{ backgroundColor: color }}></div>
      <div className="random-question">{question}</div>
      <div style={{ display: 'flex', justifyContent:'space-between', alignItems: 'center' }}>
      {comments && comments.length > 0 && <div className="comment-count">{commentCounter} comments</div>}
      {level === "L1" && (
         <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
         <ReviewButton onClick={() => setShowReviewPage(true)}>Review clustered comments &gt;&gt;</ReviewButton>
       </div>
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
          .filter((comment) => comment.children_id === null && comment.cluster_id === null)
          .map((comment, index) => {
            // Find the replies to the parent comment
            const replies = comments.filter(
              (c) => c.children_id === comment.id
            );
            // Find the clusters to the parent comment
            const clusteredComments = comments.filter(
              (c) => c.cluster_id === comment.id
            );
            
            // Check if the cluster is accepted
            const isClusterAccepted = acceptedReviews.some(
              (review) => review.destinationId === comment.id
            );

            // Find the accepted review that matches the comment's sourceId
            const acceptedReview = acceptedReviews.find(
              (review) => review.destinationId === comment.id
            );

            return (
              <React.Fragment key={comment.id}>
                {clusteredComments.length > 0 ? (
                  <CombinedCommentContainer>
                  {acceptedReview && acceptedReview.summary ? (
                    <>
                      <SummaryCollapse
                        articleId={articleId}
                        threadId={threadId}
                        summary={acceptedReview.summary}
                        comment={comment}
                        childrenComments={replies}
                        clusteredComments={clusteredComments}
                        onReplyClick={handleReplyClick}
                      />
                      <ReviewMessage>Cluster accepted. Summary completed.</ReviewMessage>
                    </>
                  ) : (
                    <CommentUnit
                      articleId={articleId}
                      threadId={threadId}
                      comment={comment}
                      index={index}
                      clusteredComments={clusteredComments}
                      childrenComments={replies}
                      userId={userId}
                      onReplyClick={handleReplyClick}
                      level={level}
                      hasSummaryCollapse={comment.summary !== undefined && comment.summary !== null}
                    />
                  )}
                  {level === 'L0' || level === 'L2' ? (
                    (() => {
                      const storageKey = `clusters_${articleId}_${threadId}`;
                      const clusters = JSON.parse(localStorage.getItem(storageKey) || '{}');
                      const isLocalCluster = Object.values(clusters).some(cluster => cluster.destinationId === comment.id);
                      
                      return isClusterAccepted && !acceptedReview?.summary && !isLocalCluster ? (
                        <ReviewMessage>Cluster accepted. Summary pending.</ReviewMessage>
                      ) : <ReviewMessage>This cluster is currently visible only to you.</ReviewMessage>;
                    })()
                  ) : (
                    level === 'L1' && isClusterAccepted && !acceptedReview?.summary && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <SummarizeButton
                          articleId={articleId}
                          threadId={threadId}
                          comment={comment}
                          clusteredComments={clusteredComments}
                          reviewId={acceptedReview.id}
                        />
                      </div>
                    )
                  )}
                </CombinedCommentContainer>
                ) : (
                  <CommentBox
                    articleId={articleId}
                    threadId={threadId}
                    comment={comment}
                    index={index}
                    childrenComments={replies}
                    clusteredComments={[]}
                    userId={userId}
                    onReplyClick={handleReplyClick}
                    level={level}
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
        <UserProfile>{userId.charAt(0).toUpperCase() || 'A'}</UserProfile>
        <CommentInputContainer>
          <CommentInput
            ref={commentInputRef}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <CommentActions>
            <AddCommentButton onClick={handleAddComment}>
              POST
            </AddCommentButton>
            <br />
            <br />
          </CommentActions>
        </CommentInputContainer>
      </CommentBoxContainer>
      {isClusterDeleted && deletedClusters.length > 0 && (
        <ClusterPopup 
          clusters={deletedClusters}
          comments={comments}
          onClose={() => setIsClusterDeleted(false)}
        />
      )}
      {showAcceptedPopup && <AcceptedPopup onClose={handleClosePopup} />}
    </div>
  );
};

export default CommentThread;


const ScrollContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const ClusterLabel = styled.h4`
  margin: 0;
  padding: 0 0 10px 0;
  color: white;
`;


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

const UserProfile = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: black;
  font-weight: bold;
  margin-top: 10px;
  flex-shrink: 0;
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
  padding: 10px;
  background-color: white; 
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

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

const RefreshIcon = styled.span`
  margin-right: 5px;
  font-size: 15px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const PopupContainer = styled.div`
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
`;

const ClusterSection = styled.div`
  background-color: #4caf50;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
`;

const OkayButton = styled.button`
  background-color: white;
  color: #4caf50;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const ButtonContainerPopup= styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
`;

