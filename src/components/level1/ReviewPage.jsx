import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
// import CommentBox from './CommentBoxReview';
import CommentBox from '../CommentBox/CommentBox';
import './ReviewPage.css';
import Comment from '../CommentBox/Comment';

const ReviewPage = ({ onBack, header, threadId, userId}) => {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchReviews();
    fetchComments();
  }, [threadId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/reviews`);
      setReviews(response.data);
      console.log("Reviews:", response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/comments/${threadId}`);
      setComments(response.data);
      console.log('Comments:', response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAccept = async (reviewObj) => {
    console.log("Accepting review:", reviewObj);
    if (!reviewObj.acceptedBy.includes(userId)) {
      try {
        const updatedReviewObj = {
          ...reviewObj,
          acceptedBy: [...reviewObj.acceptedBy, userId],
          pendingReview:[...reviewObj.acceptedBy, userId].length < 2,
        };
  
        await axios.put(`http://localhost:8000/api/reviews/${reviewObj.id}`, updatedReviewObj);
  
        setReviews((prevReviews) =>
          prevReviews.map((review) => (review.id === reviewObj.id ? updatedReviewObj : review))
        );
  
        if (updatedReviewObj.acceptedBy.length >= 2) {
          try {
            await axios.put(`http://localhost:8000/api/comments/${threadId}/${reviewObj.destinationId}`, {
              cluster_id: reviewObj.sourceId,
            });
            fetchComments();
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
        await axios.put(`http://localhost:8000/api/reviews/${reviewObj.id}`, updatedReviewObj);
        setReviews((prevReviews) =>
          prevReviews.map((review) => (review.id === reviewObj.id ? updatedReviewObj : review))
        );
  
        if (updatedReviewObj.deniedBy.length >= 2) {
          try {
            await axios.delete(`http://localhost:8000/api/reviews/${reviewObj.id}`);
            setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewObj.id));
          } catch (error) {
            console.error('Error deleting review:', error);
          }
        }
      } catch (error) {
        console.error('Error updating review:', error);
      }
    }
  };

  return (
    <ReviewPageContainer>
      <ReviewHeader>
        <BackButton onClick={onBack}>
          <BackIcon>&larr;</BackIcon>
          Back
        </BackButton>
      </ReviewHeader>
      {header}
      <ReviewSection>
        {reviews.filter((review) => review.pendingReview).map((review, index) => (
          <div key={review.id}>
            <CombinedCommentContainer>
              <div className="review-title">#{index + 1} Review</div>
              <CommentWrapper>
              <CommentContent>
                {review.prevOrder.map((commentId) => {
                  const originalComment = comments.find((c) => c.id === commentId);
                  if (!originalComment) return null;
                  const clusteredComments = comments.filter((c) => c.cluster_id === commentId);
                  return (
                    <div
                      key={commentId}
                      style={{
                        backgroundColor:
                          commentId === review.sourceId || commentId === review.destinationId
                          ? '#FEE8E8' : 'inherit',
                        padding: '8px',
                      }}
                    >
                      <CommentBox comment={originalComment} clusteredComments={clusteredComments} />
                    </div>
                  );
                })}
              </CommentContent>
              <CommentContent>
  {review.newOrder.map((commentData, idx) => {
    const originalComment = comments.find(
      (c) =>
        c.text === commentData.text &&
        c.author === commentData.author &&
        c.timestamp === commentData.timestamp
    );
    if (!originalComment) return null;

    const modifiedCommentData = {
      ...commentData,
      id: originalComment.id,
    };

    if (modifiedCommentData.cluster_id === null) {
      const clusteredComments = review.newOrder.filter(
        (cd) => cd.cluster_id === modifiedCommentData.id
      );

      const clusteredCommentObjects = clusteredComments.map((cd) =>
        comments.find(
          (c) =>
            c.text === cd.text && c.author === cd.author && c.timestamp === cd.timestamp
        )
      ).filter((c) => c !== undefined);

      return (
        <div
          key={idx}
          style={{
            backgroundColor:
              originalComment.id === review.sourceId ||
              originalComment.id === review.destinationId
                ? '#DCF8E0'
                : 'inherit',
            padding: '8px',
          }}
        >
          <CommentBox
            comment={originalComment}
            clusteredComments={clusteredCommentObjects}
          />
        </div>
      );
    }

    return null;
  })}
</CommentContent>
              </CommentWrapper>
              <div style={{ display: 'flex', justifyContent:'flex-end' }}>
              {review.pendingReview && (
                <>
                  <ReviewButton
                    style={{ backgroundColor: 'green' }}
                    onClick={() => handleAccept(review)}
                  >
                    Accept ({review.acceptedBy ? review.acceptedBy.length : 0}/2)
                  </ReviewButton>
                  <ReviewButton onClick={() => handleDecline(review)}>
                    Decline ({review.deniedBy ? review.deniedBy.length : 0}/2)
                    </ReviewButton>
                </>
                )}
                </div>
            </CombinedCommentContainer>
          </div>
        ))}
      </ReviewSection>
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
  width: 130%;

`;

const CommentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const CommentContent = styled.div`
  width: 48%;
`;