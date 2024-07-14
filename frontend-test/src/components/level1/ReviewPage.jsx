import React from 'react';
import styled from 'styled-components';
import CommentBox from './CommentBoxReview';
import './ReviewPage.css';
import Comment from '../CommentBox/Comment';

const ReviewPage = ({ comments, setComments, onBack, reviewsList, header,  newComments={newComments}}) => {
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
    // setAcceptedComments((prevAcceptedComments) => [...prevAcceptedComments, reviewObj.destinationId]);
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
        {reviewsList.map((reviewObj, index) => {
          if (!comments) {
            console.log("nothing to display");
            return <div> Nothing to review </div>;
          }

          console.log("ReviewObj:", reviewObj);

          return (
            <div key={index}>
              <CombinedCommentContainer>
                <div className="review-title">#{index + 1} Review</div>
                <CommentWrapper>
                  {/* <CommentContent>
                    {reviewObj.parentChildRelationship.map((commentObj) => {
                      console.log("CommentObj in prevOrder:", commentObj);
                      return (
                        <div key={commentObj.id}  style={{
                          backgroundColor:
                          commentObj.id === reviewObj.sourceId || commentObj.id === reviewObj.destinationId
                            ? '#FEE8E8'
                            : 'inherit',
                          padding: "8px",
                        }}>
                          {commentObj.children.length > 0 ? (
                            <CommentBox
                              key={commentObj.id}
                              comment={commentObj}
                            />
                          ) : (
                            <Comment
                              key={commentObj.id}
                              comment={commentObj}
                            />
                          )}
                        </div>
                      );
                    })}
                  </CommentContent> */}
                   <CommentContent>
                    {getParentChildRelationship(reviewObj.newOrder, newComments).map((newCommentObj) => {
                      return (
                        <div
                          key={newCommentObj.id}
                          style={{
                            backgroundColor: newCommentObj.id === reviewObj.destinationId ? '#DCF8E0' : 'inherit',
                            padding: "8px",
                          }}
                        >
                          <CommentBox key={newCommentObj.id} comment={newCommentObj} />
                        </div>
                      );
                    })}
                  </CommentContent>
                  <CommentContent>
                    {reviewObj.newOrder.map((newCommentId) => {
                      const newComment = comments.find((c) => c.id === newCommentId);
                      if (!newComment) {
                        return null; 
                      }
                      return (
                        <div
                          key={newComment.id}
                          style={{
                            backgroundColor: newComment.id === reviewObj.destinationId ? '#DCF8E0' : 'inherit',
                            padding: "8px",
                          }}
                        >
                          <CommentBox
                            key={newComment.id}
                            comment={newComment}
                          />
                        </div>
                      );
                    })}
                  </CommentContent>
                </CommentWrapper>
                <div style={{ display: 'flex', justifyContent:'flex-end' }}>
                  <ReviewButton
                    style={{ backgroundColor: 'green' }}
                    onClick={() => handleAccept(reviewObj)}
                  >
                    Accept
                  </ReviewButton>
                  <ReviewButton onClick={() => handleDecline(reviewObj)}>Decline</ReviewButton>
                </div>
              </CombinedCommentContainer>
            </div>
          );
        })}
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