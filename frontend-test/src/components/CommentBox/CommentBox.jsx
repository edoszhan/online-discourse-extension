import React from 'react';
import styled from 'styled-components';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Comment from './Comment';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  border-radius: 5px;
`;

const ClusteredCommentsContainer = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: #D9DBF4;
  margin-bottom: 10px;
`;

const CommentBox = ({ comment, index }) => {

  return (
    <Droppable droppableId={comment.id} isDropDisabled={comment.children.length >= 10} mode="child">
      {(provided, snapshot) => (
        <CommentBoxContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'white',
            borderRadius: '5px',
          }}
        >
          <Draggable draggableId={comment.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {comment.children.length > 0 ? (
                  <ClusteredCommentsContainer>
                    <Comment comment={comment} isCombined={true} isDragging={snapshot.isDragging}  />
                    {comment.children.map((child, childIndex) => (
                      <CommentBox key={child.id} comment={child} index={childIndex} />
                    ))}
                  </ClusteredCommentsContainer>
                ) : (
                  <Comment comment={comment} isCombined={false} isDragging={snapshot.isDragging}  />
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
