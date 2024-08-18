import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import CommentBaseline from './CommentBaseline';
import CommentMapBaseline from './CommentMapBaseline';
import axios from 'axios';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  border-radius: 5px;
`;

const ReplyContainer = styled.div`
  border-left: 2px solid #ccc; 
  margin-left: 20px;
  padding-left: 10px;
`;

const DraggableIndicator = styled.div`
  position: absolute;
  top: 0;
  right: -5px;
  width: 15px;
  height: 100%;
  background-color: #5D6BE5;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const CommentWrapper = styled.div`
  position: relative;
`;


const CommentBoxBaseline = ({ articleId, threadId, comment, isReplyingTo, clusteredComments, childrenComments, userId, onReplyClick, level, pass, isSummary }) => {
  const [allComments, setAllComments] = useState([]);
  const hasChildren = clusteredComments && clusteredComments.length > 0;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    if (articleId === undefined || threadId === undefined) {
      return;
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      setAllComments(response.data);
    } catch (error) {
      return;
    }
  };

    return (
      <CommentBoxContainer
        style={{ backgroundColor: hasChildren ? '#F2F2F2' : '#F2F2F2', padding: "6px" }}
      >
        <CommentWrapper>
          <CommentBaseline
            articleId={articleId}
            threadId={threadId}
            comment={comment}
            isReplyDisabled={false}
            userId={userId}
            onReplyClick={onReplyClick}
            level={level}
            isReplyingTo={isReplyingTo}
          />
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
                    onReplyClick={onReplyClick}
                  />
                </div>
              ))}
            </ReplyContainer>
          )}
        </CommentWrapper>
      </CommentBoxContainer>
    );
};

export default CommentBoxBaseline;
