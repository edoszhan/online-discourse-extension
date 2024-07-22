import React from 'react';
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import Comment from './Comment';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  background-color: ${(props) => (props.isDragging ? 'lightgreen' : 'white')};
  border-radius: 5px;
`;

const ClusteredCommentsContainer = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: #D9DBF4;
  margin-bottom: 10px;
`;

const CommentBox = ({ articleId, threadId, comment, index, isDraggingOver, clusteredComments, userId,  onReplyClick }) => {
  const hasChildren = clusteredComments && clusteredComments.length > 0;

  return (
    <Droppable droppableId={`droppable-${comment.id}`}>
      {(provided, snapshot) => (
        <CommentBoxContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDragging={snapshot.isDraggingOver}
          style={{ backgroundColor: hasChildren ? 'transparent' : 'white' }}
        >
        <Draggable draggableId={String(comment.id)} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {clusteredComments.length > 0 ? (
                  <ClusteredCommentsContainer>
                    <Comment
                      articleId={articleId}
                      threadId={threadId}
                      comment={comment}
                      isCombined={true}
                      isDragging={snapshot.isDragging}
                      isReplyDisabled={false}
                      userId={userId}
                      onReplyClick={onReplyClick}
                    />
                    {clusteredComments.map((child, childIndex) => (
                      <CommentBox
                        key={child.id}
                        articleId={articleId}
                        threadId={threadId}
                        comment={child}
                        index={childIndex}
                        clusteredComments={[]}
                        userId={userId}
                      />
                    ))}
                  </ClusteredCommentsContainer>
                ) : (
                  <Comment
                    articleId={articleId}
                    threadId={threadId}
                    comment={comment}
                    isCombined={false}
                    isDragging={snapshot.isDragging}
                    isReplyDisabled={false}
                    userId={userId}
                    onReplyClick={onReplyClick}
                  />
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

