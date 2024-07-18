import React, { useState } from 'react';
import styled from 'styled-components';
import { AiOutlineLike, AiFillLike, AiOutlineMessage } from "react-icons/ai";

const CommentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: ${(props) => (props.isCombined ? 'transparent' : 'white')}; 
  opacity: ${(props) => (props.isDragging ? '0.5' : '1')}; 
`;

const UserLogo = styled.div`
  margin-right: 10px;
  width: 50px;
  height: 50px;
  background-color: #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: black;
  font-weight: bold;
  margin-top: 10px;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex-grow: 1;
  color: ${(props) => (props.isCombined ? 'inherit' : 'black')};
`;

const CommentText = styled.p`
  margin: 0 0 10px 0;
  margin-top: 10px;
`;

const CommentDetails = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  color: #555;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
`;

const DotSeparator = styled.span`
  margin: 0 5px;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  justify-content: flex-start;
`;

const ReplyButton = styled.button`
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 1px;

  &:hover {
    text-decoration: underline;
  }
`;

const UpvoteButton = styled.button`
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;


  &.active {
    color: black; 
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-right: 10px;
  justify-content: flex-end;
`;

const Comment = ({ comment, isCombined, isDragging }) => {
  if (!comment) {
    return null;
  }

  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const authorInitial = comment.author ? comment.author.charAt(0).toUpperCase() : 'A';

  const formattedTimestamp = new Date(comment.timestamp).toLocaleString('kr-KO', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const handleUpvote = () => {
    console.log('Upvote clicked');
    setHasUpvoted(!hasUpvoted);
    setUpvotes(hasUpvoted ? upvotes - 1 : upvotes + 1);
  };

  return (
    <CommentContainer isDragging={isDragging}>
      <UserLogo>{authorInitial}</UserLogo>
      <CommentContent isCombined={isCombined} isDragging={isDragging}>
        <CommentDetails>
          <CommentAuthor>{comment.author}</CommentAuthor>
          <DotSeparator>•</DotSeparator>
          <span>{formattedTimestamp}</span>
        </CommentDetails>
        <CommentText>{comment?.text || ''}</CommentText>
        <CommentActions>
          <ReplyButton>
            <AiOutlineMessage style={{ marginRight: '5px' }} />
            Reply
          </ReplyButton>
          <UpvoteButton onClick={handleUpvote} className={hasUpvoted ? 'active' : ''}>
           <IconWrapper>{hasUpvoted ? <AiFillLike /> : <AiOutlineLike />} {upvotes} </IconWrapper> 
          </UpvoteButton>
        </CommentActions>
      </CommentContent>
    </CommentContainer>
  );
};

export default Comment;
