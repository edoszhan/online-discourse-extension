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

const CommentBox = ({ comment, clusteredComments, isReplyDisabled }) => {
  // remember that we are not changing isReplayDisabled
  return (
    <CommentBoxContainer>
      {clusteredComments.length > 0 ? (
        <ClusteredCommentsContainer>
          <Comment comment={comment} isCombined={true} isDragging={false} isReplyDisabled={isReplyDisabled} />
          {clusteredComments.map((child) => (
            <CommentBox key={child.id} comment={child} clusteredComments={[]} isReplyDisabled={isReplyDisabled} />
          ))}
        </ClusteredCommentsContainer>
      ) : (
        <Comment comment={comment} isCombined={false} isDragging={false} isReplyDisabled={isReplyDisabled} />
      )}
    </CommentBoxContainer>
  );
};

export default CommentBox;
