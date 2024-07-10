import React from 'react';
import styled from 'styled-components';
// import IMG from '../img/default-avatar-2.png';

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
`;

const CommentContent = styled.div`
  margin: 0;
  color: ${(props) => (props.isCombined ? 'inherit' : 'black')};
`;

const Comment = ({ comment, isCombined, isDragging}) => {
  return (
    <CommentContainer isDragging={isDragging}>
      <UserLogo>
        {/* <img src={IMG} alt="User Profile" className="user-profile" /> */}
        <img src={chrome.runtime.getURL('/static/media/default-avatar-2.png')} alt="User Profile" className="user-profile"/>
      </UserLogo>
      <CommentContent isCombined={isCombined}>
        <p>{comment.text}</p>
      </CommentContent>
    </CommentContainer>
  );
};

export default Comment;
