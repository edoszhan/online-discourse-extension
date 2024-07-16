import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import CommentBox from './CommentBoxReview';
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
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/comments/${threadId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAccept = async (reviewObj) => {
    if (!reviewObj.acceptedBy.includes(userId)) {
      try {
        const updatedReviewObj = {
          ...reviewObj,
          acceptedBy: [...reviewObj.acceptedBy, userId],
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

  const handleDecline= async (reviewObj) => {
    const updatedReviewObj = {
      ...reviewObj,
      deniedBy: [...reviewObj.deniedBy, userId],
      pendingReview: reviewObj.deniedBy.length + 1 < 2,
    };
  
    if (updatedReviewObj.deniedBy.length >= 2) {
      try {
        await axios.delete(`http://localhost:8000/api/reviews/${reviewObj.id}`);
        setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewObj.id));
        // Update the reviews state by removing the deleted reviewObj
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    } else {
      // Update the reviews state with the updated reviewObj
      setReviews((prevReviews) =>
        prevReviews.map((review) => (review.id === reviewObj.id ? updatedReviewObj : review))
      );
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
        {reviews.map((review, index) => (
          <div key={review.id}>
            <CombinedCommentContainer>
              <div className="review-title">#{index + 1} Review</div>
              <CommentWrapper>
                <CommentContent>
                  {review.prevOrder.map((commentId) => {
                    const comment = comments.find((c) => c.id === commentId);
                    if (!comment) return null;
                    return (
                      <div
                        key={comment.id}
                        style={{
                          backgroundColor:
                            comment.id === review.sourceId || comment.id === review.destinationId
                            ? '#FEE8E8' : 'inherit',
                          padding: '8px',
                        }}
                      >
                        <Comment comment={comment} />
                      </div>
                    );
                  })}
                </CommentContent>
                <CommentContent>
                  {review.newOrder.map((commentId) => {
                    const comment = comments.find((c) => c.id === commentId);
                    if (!comment) return null;
                    return (
                      <div
                        key={comment.id}
                        style={{
                          backgroundColor:
                            comment.id === review.sourceId || comment.id === review.destinationId
                            ? '#DCF8E0' : 'inherit',
                          padding: '8px',
                        }}
                      >
                        <Comment comment={comment} />
                      </div>
                    );
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