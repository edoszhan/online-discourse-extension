import React from 'react';
import styled from 'styled-components';
import CommentBaseline from './CommentBaseline';

const CommentMapContainer = styled.div`
  margin-bottom: 10px;
  background-color: #F2F2F2;  // we have comment, it has cluster comment, cluster comment has background color set to this
  border-radius: 5px;
`;

const ReplyContainer = styled.div`
  border-left: 2px solid #ccc;
  margin-left: 20px;
  padding-left: 10px;
`;

const CommentMapBaseline = ({ articleId, threadId, comment, childrenComments, userId, onReplyClick}) => {
  return (
    <CommentMapContainer>
      <CommentBaseline
        articleId={articleId}
        threadId={threadId}
        comment={comment}
        isCombined={isCombined}
        isDragging={false}
        isReplyDisabled={false}
        userId={userId}
        onReplyClick={onReplyClick}
      />

      {/* Render the replies */}
      {childrenComments && childrenComments.length > 0 && (
        <ReplyContainer>
          {childrenComments.map((childComment, childIndex) => (
            <div key={childComment.id}>
              <CommentMapBaseline
                articleId={articleId}
                threadId={threadId}
                comment={childComment}
                index={childIndex}
                clusteredComments={[]}
                childrenComments={[]}
                userId={userId}
                isCombined={isCombined}
                onReplyClick={onReplyClick}
              />
            </div>
          ))}
        </ReplyContainer>
      )}
    </CommentMapContainer>
  );
};

export default CommentMapBaseline;
