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

const CommentBox = ({ articleId, threadId, comment, index, isDraggingOver, clusteredComments, childrenComments, userId, onReplyClick }) => {
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
                <Comment
                  articleId={articleId}
                  threadId={threadId}
                  comment={comment}
                  isCombined={clusteredComments.length > 0}
                  isDragging={snapshot.isDragging}
                  isReplyDisabled={false}
                  userId={userId}
                  onReplyClick={onReplyClick}
                />

                {/* Render the replies */}
                {childrenComments && childrenComments.length > 0 && (
                  <div>
                    {childrenComments.map((childComment, childIndex) => (
                      <div key={childComment.id} style={{ marginLeft: '20px' }}>
                        <CommentBox
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
                  </div>
                )}

                {/* Render the clusteredComments */}
                {clusteredComments && clusteredComments.length > 0 && (
                  <div>
                    {clusteredComments.map((child, childIndex) => (
                      <CommentBox
                        key={child.id}
                        articleId={articleId}
                        threadId={threadId}
                        comment={child}
                        index={childIndex}
                        clusteredComments={[]}
                        childrenComments={[]}
                        userId={userId}
                        onReplyClick={onReplyClick}
                      />
                    ))}
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
