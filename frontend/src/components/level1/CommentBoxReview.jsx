import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Comment from '../CommentBox/Comment';
import axios from 'axios';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background-color: ${(props) => (props.hasChildren ? 'white' : 'white')};
  border-radius: 5px;
`;

const ReplyContainer = styled.div`
  border-left: 2px solid #ccc;
  margin-left: 20px;
  padding-left: 10px;
`;

const CommentBox = ({ articleId, threadId, comment, childrenComments, clusteredComments, isReplyDisabled }) => {
  const [allComments, setAllComments] = useState([]);
  const hasChildren = clusteredComments && clusteredComments.length > 0;


  useEffect(() => {
    fetchComments();
  },[]);

  const fetchComments = async () => {
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      setAllComments(response.data);
    } catch (error) {
      return;
    }
  };

  const findChildrenComments = (commentId) => {
    return allComments.filter((c) => c.children_id === commentId);
  };

  return (
      <CommentBoxContainer hasChildren={hasChildren}>
        <Comment comment={comment} isCombined={true} isDragging={false} isReplyDisabled={true} />
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
        </CommentBoxContainer>
  );
};

export default CommentBox;
