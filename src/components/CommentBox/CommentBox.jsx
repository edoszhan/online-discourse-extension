import React from 'react';
import styled from 'styled-components';
import { Draggable, Droppable } from '@hello-pangea/dnd';
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

const CommentBox = ({ comment, index }) => {

  return (
    <Droppable droppableId={comment.id} isDropDisabled={comment.children.length >= 2}>
      {(provided, snapshot) => (
        <CommentBoxContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDragging={snapshot.isDraggingOver}
          style={{ backgroundColor: comment.children.length > 0 ? 'transparent' : 'white' }}
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
