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
            <LogoIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 128c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72s32.2-72 72-72zM256 448c-52.9 0-100.5-25.1-130.8-64c26.3-38.9 68.1-64 114.8-64s88.5 25.1 114.8 64c-30.3 38.9-77.9 64-130.8 64z"/>
            </LogoIcon>
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
