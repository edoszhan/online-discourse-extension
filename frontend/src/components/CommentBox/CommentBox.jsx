import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {Draggable, Droppable } from '@hello-pangea/dnd';
import Comment from './Comment';
import CommentMap from './CommentMap';
import axios from 'axios';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: ${props => props.isDragging  ? 'lightblue' : '#F2F2F2'};
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


const CommentBox = ({ articleId, threadId, comment, index, isReplyingTo, setReplyingTo, clusteredComments, childrenComments, userId, onReplyClick, level, pass, isSummary, isReplyEnabled}) => {
  const [allComments, setAllComments] = useState([]);
  const hasChildren = clusteredComments && clusteredComments.length > 0;

  // useEffect(() => {
  //   fetchComments();
  // }, []);

  // const fetchComments = async () => {
  //   if (articleId === undefined || threadId === undefined) {
  //     return;
  //   }
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
  //     setAllComments(response.data);
  //   } catch (error) {
  //     return;
  //   }
  // };

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

  if (isSummary) {
    return (
      <CommentBoxContainer
        style={{ backgroundColor: hasChildren ? '#F2F2F2' : '#F2F2F2', padding: "6px" }}
      >
        <CommentWrapper>
          <Comment
            articleId={articleId}
            threadId={threadId}
            comment={comment}
            isCombined={false}
            isReplyDisabled={isReplyEnabled}
            userId={userId}
            onReplyClick={onReplyClick}
            level={level}
            isReplyEnabled={false} 
          />
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
                    isCombined={false}
                  />
                </div>
              ))}
            </ReplyContainer>
          )}
        </CommentWrapper>
        {clusteredComments && clusteredComments.length > 0 && (
          <div>
            {renderClusteredComments()}
          </div>
        )}
      </CommentBoxContainer>
    );
  }

  return (
    <Droppable droppableId={`droppable-${comment.id}`}>
      {(provided, snapshot) => (
        <CommentBoxContainer
        ref={provided.innerRef}
        {...provided.droppableProps}
        isDragging={snapshot.isDraggingOver}
        style={{ padding: "6px"}}
      >
        <Draggable draggableId={String(comment.id)} index={index} isDragDisabled={level !== 'L0'} >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <CommentWrapper>
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
                  isReplyingTo={isReplyingTo}
                  setReplyingTo={setReplyingTo}
                  isReplyEnabled={false} 
                />
                {!snapshot.isDragging && (
                  <>
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
                              isCombined={false}
                            />
                          </div>
                        ))}
                      </ReplyContainer>
                    )}
                    {clusteredComments && clusteredComments.length > 0 && (
                      <div>
                        {renderClusteredComments()}
                      </div>
                    )}
                  </>
                )}
                {pass !== "unpass" && level === "L0" && <DraggableIndicator />}
              </CommentWrapper>
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
