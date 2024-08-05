import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AiOutlineLike, AiFillLike, AiOutlineMessage } from "react-icons/ai";
import axios from 'axios';
import moment from 'moment-timezone';

import iconCat from '../../assets/icon_cat.png';
import iconDuck from '../../assets/icon_duck.png';
import iconFox from '../../assets/icon_fox.png';

const CommentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: ${(props) =>
    props.isReplying ? '#9bbcc7' : props.isCombined ? 'white' : 'white'};
  opacity: ${(props) => (props.isDragging ? '1' : '1')}; 

  position: relative;
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
// const UserLogo = styled.div`
//   margin-right: 10px;
//   width: 50px;
//   height: 50px;
//   background-color: white;
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   overflow: hidden;
//   flex-shrink: 0;
// `;

const UserIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const DraggableIndicator = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  background-color: #5D6BE5;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;


const Comment = ({ articleId, threadId, comment, isCombined, isDragging, isReplyDisabled, userId, onReplyClick, level }) => {
  if (!comment) {
    return null;
  }

  const [upvotes, setUpvotes] = useState(comment.upvotes || []);
  const [hasUpvoted, setHasUpvoted] = useState(
    Array.isArray(comment.upvotes) && comment.upvotes.includes(userId)
  );  
  const [isReplying, setIsReplying] = useState(false);

  const authorInitial = comment.author ? comment.author.charAt(0).toUpperCase() : 'A';

  const formattedTimestamp = moment.utc(comment.timestamp)
  .tz('Asia/Seoul')
  .format('MMMM D, YYYY h:mm A z');

  const addUpvote = async () => {
    const updatedUpvotes = Array.isArray(comment.upvotes) && comment.upvotes.includes(userId)
    ? comment.upvotes.filter((id) => id !== userId)
    : Array.isArray(comment.upvotes)
      ? [...comment.upvotes, userId]
      : [userId];

    setHasUpvoted(!hasUpvoted);
    setUpvotes(updatedUpvotes);
  
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${comment.id}`, {
        upvotes: updatedUpvotes,
      });
    } catch (error) {
      console.error('Error updating upvotes:', error);
    }
  };

  const iconPaths = [
    chrome.runtime.getURL('static/media/icon_cat.png'),
    chrome.runtime.getURL('static/media/icon_duck.png'),
    chrome.runtime.getURL('static/media/icon_fox.png')
];

  
  const getRandomIcon = () => {
    return iconPaths[Math.floor(Math.random() * iconPaths.length)];
  };

  const handleReplyClick = () => {
    setIsReplying(true);
    onReplyClick(comment.id); 
  };
  const handleCancelReply = () => {
    setIsReplying(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isReplying && !event.target.closest(".comment-container") && !event.target.closest(".comment-input")) {
        handleCancelReply();
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isReplying]);

  const userIcon = getRandomIcon();

  return (
    <CommentContainer isDragging={isDragging} isReplying={isReplying}>
      {/* <UserLogo>
        <img src={getRandomIcon()} alt="User Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </UserLogo> */}
        <UserLogo>{authorInitial}</UserLogo>
      <CommentContent isCombined={isCombined} isDragging={isDragging}>
        <CommentDetails>
          <CommentAuthor>{comment.author}</CommentAuthor>
          <DotSeparator>•</DotSeparator>
          <span>{formattedTimestamp}</span>
        </CommentDetails>
        <CommentText>{comment?.text || ''}</CommentText>
        <CommentActions>
          {!isReplyDisabled && (
             <ReplyButton onClick={handleReplyClick}>
              <AiOutlineMessage style={{ marginRight: '5px' }} />
              Reply
            </ReplyButton>
          )}
          <UpvoteButton onClick={addUpvote} className={hasUpvoted ? 'active' : ''}>
           <IconWrapper>{hasUpvoted ? <AiFillLike /> : <AiOutlineLike />} {upvotes.length || 0} </IconWrapper> 
          </UpvoteButton>
        </CommentActions>
      </CommentContent>
      {!isCombined && level === "L0" &&  <DraggableIndicator />}
    </CommentContainer>
  );
};

export default Comment;
