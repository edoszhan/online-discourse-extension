import React, { useEffect, useState} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import CommentBox from './CommentBoxReview';
import './ReviewPage.css';
import AcceptedPopup from './AcceptedPopup';
import DeletedPopup from './DeletedPopup';

const ReviewPage = ({ articleId, threadId, onBack, header, userId}) => {
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);
  const [showDeletedPopup, setShowDeletedPopup] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchComments();
  }, [threadId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`);
      const filteredReviews = response.data.filter((review) => review.pendingReview === null);
      setReviews(response.data);
      setReviewCount(filteredReviews.length);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleRefresh = () => {
    fetchReviews();
    fetchComments();
  };


  const handleAccept = async (reviewObj) => {
    if (!reviewObj.acceptedBy.includes(userId)) {
      try {
        const updatedReviewObj = {
          ...reviewObj,
          acceptedBy: [...reviewObj.acceptedBy, userId],
        };

        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/${threadId}/reviews/${reviewObj.id}`, updatedReviewObj);

        setReviews((prevReviews) =>
          prevReviews.map((review) => (review.id === reviewObj.id ? updatedReviewObj : review))
        );

        if (updatedReviewObj.acceptedBy.length >= 2) {
          // Update the cluster_id of the source comment
          try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${reviewObj.sourceId}`, {
              cluster_id: reviewObj.destinationId,
            });

          // Update the hasClusters attribute of the destination comment
          await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${reviewObj.destinationId}`, {
            hasClusters: true,
          });

          // Update the cluster_id of the source comment's children
          const childrenComments = comments.filter((c) => c.cluster_id === reviewObj.sourceId);
          if (childrenComments.length > 0) {
            await Promise.all(
            childrenComments.map((comment) =>
              axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${comment.id}`, {
                cluster_id: reviewObj.destinationId,
              })
            )
           );
          }
            fetchReviews();

            setShowAcceptedPopup(true);
          } catch (error) {
            console.error('Error updating comment:', error);
          }
        }
      } catch (error) {
        console.error('Error updating review:', error);
      }
    }
  };

  const handleDecline = async (reviewObj) => {
    if (!reviewObj.deniedBy.includes(userId) && !reviewObj.acceptedBy.includes(userId)) {
      const updatedReviewObj = {
        ...reviewObj,
        deniedBy: [...reviewObj.deniedBy, userId],
      };
  
      try {
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/${threadId}/reviews/${reviewObj.id}`, updatedReviewObj);
        setReviews((prevReviews) =>
          prevReviews.map((review) => (review.id === reviewObj.id ? updatedReviewObj : review))
        );

        if (updatedReviewObj.deniedBy.length >= 2) {
          setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewObj.id));
          fetchReviews();
          setShowDeletedPopup(true);
        }
      } catch (error) {
        console.error('Error updating review:', error);
      }
    }
  };

  const handleClosePopup = () => {
    setShowAcceptedPopup(false);
  };

  const handleClosePopupDelete = () => {
    setShowDeletedPopup(false);
  };

  const handleBack = async () => {
    try {
      await onBack();
    } catch (error) {
      console.error('Error fetching comments:', error);
      onBack();
    }
  };

  return (
    <ReviewPageContainer>
      <ReviewHeader>
        <BackButton onClick={handleBack}> 
          <BackIcon>&larr;</BackIcon>
          Back
        </BackButton>
        <RefreshButton onClick={handleRefresh}>
          <RefreshIcon>&#8635;</RefreshIcon>
          Refresh
        </RefreshButton>
      </ReviewHeader>
      {header}
      <div>
        {reviewCount} reviews
        <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
          (REVIEWING)
        </span>
      </div>
      <ReviewSection>
      {reviews.filter((review) => review.pendingReview === null).length === 0 ? (
          <NoReviewsMessage>Nothing to review as of right now</NoReviewsMessage>
        ) : (
          reviews.filter((review) => review.pendingReview === null).map((review, index) => (
          <div key={review.id}>
             <div className="review-title">#{index + 1} Review</div>
              <CommentWrapper>
                <CommentContent>
                  {comments
                    .filter((c) => c.id === review.sourceId || c.id === review.destinationId)
                    .map((comment) => {
                      const childrenComments = comments.filter((c) => c.children_id === comment.id);
                      const clusteredComments = comments.filter((c) => c.cluster_id === comment.id);
                      
                      if (comment.id === review.destinationId && comment.cluster_id !== null) {
                        const clusterComment = comments.find(c => c.id === comment.cluster_id);
                        const clusterChildrenComments = comments.filter((c) => c.children_id === clusterComment.id);
                        const clusterClusteredComments = comments.filter((c) => c.cluster_id === clusterComment.id);
                        return (
                          <CommentBoxWrapper
                            key={comment.id}
                            style={{
                              backgroundColor: '#FEE8E8',
                              padding: '8px',
                            }}
                          >
                            <CommentBox articleId={articleId} threadId={threadId} comment={clusterComment} childrenComments={clusterChildrenComments} clusteredComments={clusterClusteredComments} />
                          </CommentBoxWrapper>
                        );
                      } else {
                        return (
                          <CommentBoxWrapper
                            key={comment.id}
                            style={{
                              backgroundColor:
                                comment.id === review.sourceId || comment.id === review.destinationId
                                ? '#FEE8E8' : 'inherit',
                              padding: '8px',
                            }}
                          >
                            <CommentBox articleId={articleId} threadId={threadId} comment={comment} childrenComments={childrenComments} clusteredComments={clusteredComments} />
                          </CommentBoxWrapper>
                        );
                      }
                    })}
                  </CommentContent>
                <CommentContent>
                  {comments
                    .filter((c) => c.id === review.destinationId) // find the destination comment
                    .map((comment) => {
                      const destinationId = comment.cluster_id !== null ? comment.cluster_id : review.destinationId; // needs to be tested for case [1<-2] and [2<-3]
                      const modifiedComments = comments.map((c) => {
                        if (c.id === review.sourceId || c.cluster_id === review.sourceId) { // find the source comment and its children and exchange to destinationId
                          return {
                            ...c,
                            cluster_id: review.destinationId,
                          };
                        }
                        return c;
                      });

                      const childrenComments = modifiedComments.filter((c) => c.children_id === comment.id);
                      const clusteredComments = modifiedComments.filter(
                        (c) => c.cluster_id === comment.id
                      );

                      return (
                        <CommentBoxWrapper
                          key={comment.id}
                          style={{
                            backgroundColor:
                              comment.id === review.sourceId || comment.id === review.destinationId
                                ? '#DCF8E0'
                                : 'inherit',
                            padding: '8px',
                          }}
                        >
                          {comment.cluster_id !== null && (
                          <PotentialConflictSign>Potential Conflict!</PotentialConflictSign>
                        )}
                          <CommentBox articleId={articleId} threadId={threadId} comment={comment} childrenComments={childrenComments} clusteredComments={clusteredComments}/>
                        </CommentBoxWrapper>
                      );
                    })}
                </CommentContent>
              </CommentWrapper>
              <div style={{ display: 'flex', justifyContent:'flex-end' }}>
                {review.pendingReview === null && (
                  <>
                    <ReviewButton style={{ backgroundColor: 'green' }} onClick={() => handleAccept(review)}>
                      Accept ({review.acceptedBy ? review.acceptedBy.length : 0}/2)
                    </ReviewButton>
                    <ReviewButton onClick={() => handleDecline(review)}>
                      Decline ({review.deniedBy ? review.deniedBy.length : 0}/2)
                    </ReviewButton>
                  </>
                )}
              </div>
          </div>
          ))
        )}
      </ReviewSection>
      {showAcceptedPopup && <AcceptedPopup onClose={handleClosePopup} />}
      {showDeletedPopup && <DeletedPopup onClose={handleClosePopupDelete} />}
      <br />
      <br />
    </ReviewPageContainer>
  );
};


export default ReviewPage;


const ReviewPageContainer = styled.div`
  padding: 20px;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const ReviewSection = styled.div`
  margin-top: 20px;
`;

const ReviewButton = styled.button`
  background-color: red;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px 0;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const CombinedCommentContainer = styled.div`
  padding: 10px;
  margin: 10px 0;
  background-color: #F8F8F8;
  border: 1px solid lightgray;
  border-radius: 10px;
  // width: 130%;

`;

const CommentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const CommentContent = styled.div`
  width: 48%;
`;

const CommentBoxWrapper = styled.div`
  padding: 8px;
  border-radius: 5px;
`;

const NoReviewsMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 50px;
`;
const PotentialConflictSign = styled.div`
  color: red;
  font-weight: bold;
  margin-bottom: 5px;
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
