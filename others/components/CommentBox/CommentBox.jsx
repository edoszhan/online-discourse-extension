import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import './CommentBox.css';


const CommentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  background-color: #f0f0f0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const UserLogo = styled.div`
  margin-right: 10px;
`;

const LogoIcon = styled.svg`
  width: 30px;
  height: 30px;
  fill: #888;
`;

const CommentContent = styled.div`
  margin: 0;
`;

const CommentBox = ({ comment, index }) => {
  return (
    <Draggable draggableId={`comment-${index}`} index={index}>
      {(provided) => (
        <CommentContainer
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <UserLogo>
           {/* <img src={IMG} alt="User Profile" className="user-profile" /> */}
           <img src={chrome.runtime.getURL('static/media/default-avatar-2.png')} alt="User Profile" className="user-profile" />
          </UserLogo>
          <CommentContent>
            <p>{comment}</p>
          </CommentContent>
        </CommentContainer>
      )}
    </Draggable>
  );
};
export default CommentBox;
