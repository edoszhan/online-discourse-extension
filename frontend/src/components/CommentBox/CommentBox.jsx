import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {Draggable, Droppable } from '@hello-pangea/dnd';
import Comment from './Comment';
import CommentMap from './CommentMap';
import axios from 'axios';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  background-color: ${(props) => (props.isDragging ? 'lightgreen' : '#F2F2F2')};
  border-radius: 5px;
`;

const ReplyContainer = styled.div`
  border-left: 2px solid #ccc;
  margin-left: 20px;
  padding-left: 10px;
`;


const CommentBox = ({ articleId, threadId, comment, index, clusteredComments, childrenComments, userId, onReplyClick, level }) => {
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
    <Droppable droppableId={`droppable-${comment.id}`}>
      {(provided, snapshot) => (
        <CommentBoxContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDragging={snapshot.isDraggingOver}
          style={{ backgroundColor: hasChildren ? '#F2F2F2' : '#F2F2F2', padding: "5px"}}
        >
          <Draggable draggableId={String(comment.id)} index={index} isDragDisabled={level !== 'L0'} >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <Comment
                  articleId={articleId}
                  threadId={threadId}
                  comment={comment}
                  isCombined={false}
                  isDragging={snapshot.isDragging}
                  isReplyDisabled={false}
                  userId={userId}
                  onReplyClick={onReplyClick}
                  level={level}
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
              </div>
            )}
          </Draggable>
          {provided.placeholder}
        </CommentBoxContainer>
      )}
    </Droppable>
  );
};

export default CommentBox;
