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

const CommentBox = ({ comment, index, isDraggingOver}) => {

  console.log("author in box", comment.author);

  const hasChildren = comment.children && Array.isArray(comment.children) && comment.children.length > 0;

  return (
    <Droppable droppableId={String(comment.id)} isDropDisabled={hasChildren && comment.children.length >= 10}>
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
                {hasChildren ? (
                  <ClusteredCommentsContainer>
                    <Comment comment={comment} isCombined={true} isDraggingOver={snapshot.isDragging}  />
                    {comment.children.map((child, childIndex) => (
                      <CommentBox key={child.id} comment={child} index={childIndex} />
                    ))}
                  </ClusteredCommentsContainer>
                ) : (
                  <Comment comment={comment} isCombined={false} isDraggingOver={snapshot.isDragging}  />
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
