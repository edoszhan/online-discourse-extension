import React from 'react';
import styled from 'styled-components';
import Comment from '../CommentBox/Comment';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  background-color: ${(props) => (props.isDragging ? 'lightgreen' : 'white')};
  border-radius: 5px;
`;

const ClusteredCommentsContainer = styled.div`
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const CommentBox = ({ comment }) => {

  return (
    <CommentBoxContainer>
      {comment.children.length > 0 ? (
        <ClusteredCommentsContainer>
          <Comment comment={comment} isCombined={true} isDragging={false} />
          {comment.children.map((child) => (
            <CommentBox key={child.id} comment={child} />
          ))}
        </ClusteredCommentsContainer>
      ) : (
        <Comment comment={comment} isCombined={false} isDragging={false} />
      )}
    </CommentBoxContainer>
  );
};

export default CommentBox;
