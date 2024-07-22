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

const CommentBox = ({ comment, index, isDraggingOver, clusteredComments }) => {
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
                      comment={comment}
                      isCombined={true}
                      isDragging={snapshot.isDragging}
                      isReplyDisabled={false}
                    />
                    {clusteredComments.map((child, childIndex) => (
                      <CommentBox
                        key={child.id}
                        comment={child}
                        index={childIndex}
                        clusteredComments={[]}
                      />
                    ))}
                  </ClusteredCommentsContainer>
                ) : (
                  <Comment
                    comment={comment}
                    isCombined={false}
                    isDragging={snapshot.isDragging}
                    isReplyDisabled={false}
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

