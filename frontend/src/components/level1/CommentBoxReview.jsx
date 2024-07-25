import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Comment from '../CommentBox/Comment';
import axios from 'axios';

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

const ReplyContainer = styled.div`
  border-left: 2px solid #ccc;
  margin-left: 20px;
  padding-left: 10px;
`;

const CommentBox = ({ articleId, threadId, comment, childrenComments, clusteredComments, isReplyDisabled }) => {
  const [allComments, setAllComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, [articleId, threadId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      setAllComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const findChildrenComments = (commentId) => {
    return allComments.filter((c) => c.children_id === commentId);
  };

  return (
    <CommentBoxContainer>
      <ClusteredCommentsContainer>
        <Comment comment={comment} isCombined={false} isDragging={false} isReplyDisabled={isReplyDisabled} />
        {childrenComments && childrenComments.length > 0 ? (
          <>
            <ReplyContainer>
              {childrenComments.map((child) => {
                const childrenOfChild = findChildrenComments(child.id);
                return (
                  <CommentBox
                    key={child.id}
                    articleId={articleId}
                    threadId={threadId}
                    comment={child}
                    childrenComments={childrenOfChild}
                    clusteredComments={[]}
                    isReplyDisabled={isReplyDisabled}
                  />
                );
              })}
            </ReplyContainer>
            {clusteredComments && clusteredComments.length > 0 ? (
              <>
                {clusteredComments.map((child) => {
                  const childrenOfChild = findChildrenComments(child.id);
                  return (
                    <CommentBox
                      key={child.id}
                      articleId={articleId}
                      threadId={threadId}
                      comment={child}
                      childrenComments={childrenOfChild}
                      clusteredComments={[]}
                      isReplyDisabled={isReplyDisabled}
                    />
                  );
                })}
              </>
            ) : null}
          </>
        ) : (
          <>
            {clusteredComments && clusteredComments.length > 0 ? (
              <>
                {clusteredComments.map((child) => {
                  const childrenOfChild = findChildrenComments(child.id);
                  return (
                    <CommentBox
                      key={child.id}
                      articleId={articleId}
                      threadId={threadId}
                      comment={child}
                      childrenComments={childrenOfChild}
                      clusteredComments={[]}
                      isReplyDisabled={isReplyDisabled}
                    />
                  );
                })}
              </>
            ) : null}
          </>
        )}
      </ClusteredCommentsContainer>
    </CommentBoxContainer>
  );
};

export default CommentBox;
