import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {Droppable } from '@hello-pangea/dnd';
import Comment from './Comment';
import CommentMap from './CommentMap';
import axios from 'axios';

const CommentUnitContainer = styled.div`
  margin-bottom: 10px;
  background-color: ${(props) => (props.isDragging ? 'lightgreen' : 'white')};
  border-radius: 5px;
`;

const ReplyContainer = styled.div`
  border-left: 2px solid #ccc;
  margin-left: 20px;
  padding-left: 10px;
`;

const CommentUnit = ({ articleId, threadId, comment, index, clusteredComments, childrenComments, userId, onReplyClick, hasSummaryCollapse}) => {
  const [allComments, setAllComments] = useState([]);
  const hasChildren = clusteredComments && clusteredComments.length > 0;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      setAllComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const renderClusteredComments = () => {
    return clusteredComments.map((child, childIndex) => {
      const childrenComments = allComments.filter(comment => comment.children_id === child.id);

      return (
        <div key={child.id}>
          <CommentMap
            key={child.id}
            articleId={articleId}
            threadId={threadId}
            comment={child}
            index={childIndex}
            clusteredComments={child.clusteredComments || []}
            childrenComments={childrenComments}
            userId={userId}
            isReplyDisabled={false}
            onReplyClick={onReplyClick}
          />
        </div>
      );
    });
  };

  return (
    <Droppable droppableId={`droppable-${comment.id}`} isDropDisabled={hasSummaryCollapse}>
      {(provided, snapshot) => (
        <CommentUnitContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDragging={snapshot.isDraggingOver}
          style={{ backgroundColor: hasChildren ? '#F2F2F2' : 'white', padding: "5px"}}
        >
          <Comment
            articleId={articleId}
            threadId={threadId}
            comment={comment}
            isCombined={true}
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
                  <CommentMap
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

          {/* Render the clusteredComments */}
          {clusteredComments && clusteredComments.length > 0 && (
            <div>
              {renderClusteredComments()}
            </div>
          )}
          {provided.placeholder}
        </CommentUnitContainer>
      )}
    </Droppable>
  );
};

export default CommentUnit;
