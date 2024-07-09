import React from 'react';
import styled from 'styled-components';
import CommentBox from '../CommentBox/CommentBox';
import './ReviewPage.css';

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

const ReviewPage = ({ comments, setComments, onBack, header }) => {
  const handleAccept = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          pendingReview: false,
        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  const handleDecline = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          children: [],
          pendingReview: false,
        };
      }
      return comment;
    });
    setComments(updatedComments);
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
        {comments
          //  .filter((comment) => comment.pendingReview)
          .filter((comment) => comment.children.some((child) => child.pendingReview, console.log("comment.children", comment.children)))
          .map((comment, index) => (
            <div key={comment.id}>
              <div className="review-title">#{index + 1} Review</div>
              <CombinedCommentContainer>
                <CommentWrapper>
                  <CommentContent>
                    {comment.prevOrder.map((prevCommentId) => {
                      const prevComment = comments.find((c) => c.id === prevCommentId);
                      return <CommentBox key={prevComment.id} comment={prevComment} />;
                    })}
                  </CommentContent>
                  <CommentContent>
                    {comment.children.map((childComment) => (
                      <CommentBox key={childComment.id} comment={childComment} />
                    ))}
                  </CommentContent>
                </CommentWrapper>
                <div>
                  <ReviewButton style={{backgroundColor: "green"}} onClick={() => handleAccept(comment.id)}>Accept</ReviewButton>
                  <ReviewButton onClick={() => handleDecline(comment.id)}>Decline</ReviewButton>
                </div>
              </CombinedCommentContainer>
            </div>
          ))}
      </ReviewSection>
    </ReviewPageContainer>
  );
};

export default ReviewPage;
