import React from 'react';
import styled from 'styled-components';
import Comment from './Comment';

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

const CommentMap = ({ articleId, threadId, comment, index, clusteredComments, childrenComments, userId, onReplyClick, isCombined, allComments}) => {
  return (
    <CommentMapContainer>
      <Comment
        articleId={articleId}
        threadId={threadId}
        comment={comment}
        isCombined={isCombined}
        isDragging={false}
        isReplyDisabled={false}
        userId={userId}
        onReplyClick={onReplyClick}
        allComments={allComments}
      />

      {/* Render the replies */}
      {childrenComments && childrenComments.length > 0 && (
        <ReplyContainer>
          {childrenComments.map((childComment, childIndex) => (
            <div key={childComment.id}>
              <CommentMap
                articleId={articleId}
                threadId={threadId}
                comment={childComment}
                index={childIndex}
                clusteredComments={[]}
                childrenComments={[]}
                userId={userId}
                isCombined={isCombined}
                onReplyClick={onReplyClick}
                allComments={allComments}
              />
            </div>
          ))}
        </ReplyContainer>
      )}

      {/* Render the clusteredComments */}
      {clusteredComments && clusteredComments.length > 0 && (
        <div>
          {clusteredComments.map((child, childIndex) => (
            <CommentMap
              key={child.id}
              articleId={articleId}
              threadId={threadId}
              comment={child}
              index={childIndex}
              clusteredComments={child.clusteredComments || []}
              childrenComments={[]}
              userId={userId}
              isReplyDisabled={false}
              onReplyClick={onReplyClick}
              isCombined={isCombined}
              allComments={allComments}
            />
          ))}
        </div>
      )}
    </CommentMapContainer>
  );
};

export default CommentMap;
