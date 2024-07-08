// import React from 'react';
// import styled from 'styled-components';
// import { Draggable } from '@hello-pangea/dnd';
// import './CommentBox.css';
// import IMG from '../../assets/default-avatar-2.png'; 

// const CommentContainer = styled.div`
//   display: flex;
//   align-items: flex-start;
//   margin-bottom: 20px;
//   padding: 10px;
//   border: 1px solid #ccc; 
//   border-radius: 5px;
//   background-color: ${(props) => (props.isDragging ? '#f0f0f0' : 'white')};
//   opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
// `;

// const UserLogo = styled.div`
//   margin-right: 10px;
// `;

// const LogoIcon = styled.svg`
//   width: 30px;
//   height: 30px;
//   fill: #888;
// `;

// const CommentContent = styled.div`
//   margin: 0;
// `;

// const CommentBox = ({ comment, isDragging }) => {
//   return (
//     <CommentContainer isDragging={isDragging}>
//       <UserLogo>
//         <img src={IMG} alt="User Profile" className="user-profile" />
//       </UserLogo>
//       <CommentContent>
//         <p>{comment}</p>
//       </CommentContent>
//     </CommentContainer>
//   );
// };
// export default CommentBox;



// import React from 'react';
// import styled from 'styled-components';
// import { Draggable } from '@hello-pangea/dnd';
// import './CommentBox.css';
// import IMG from '../../assets/default-avatar-2.png';
// import Comment from './Comment';

// const CommentBox = ({ comments }) => {
//   return (
//     <>
//       {comments.map((comment, index) => (
//         <Draggable key={comment.id} draggableId={comment.id} index={index}>
//           {(provided, snapshot) => (
//             <div
//               ref={provided.innerRef}
//               {...provided.draggableProps}
//               {...provided.dragHandleProps}
//             >
//               <Comment comment={comment}/>
//             </div>
//           )}
//         </Draggable>
//       ))}
//     </>
//   );
// };

// export default CommentBox;




import React from 'react';
import styled from 'styled-components';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Comment from './Comment';

const CommentBoxContainer = styled.div`
  margin-bottom: 10px;
  background-color: ${(props) => (props.isDragging ? 'lightgreen' : 'white')};
`;

const ClusteredCommentsContainer = styled.div`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: black;
`;

const CommentBox = ({ comment, index }) => {
  console.log(`Comment ${comment.id} has ${comment.children.length} children`);

  return (
    <Droppable droppableId={comment.id} isDropDisabled={comment.children.length > 0}>
      {(provided, snapshot) => (
        <CommentBoxContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDragging={snapshot.isDraggingOver}
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
                    <Comment comment={comment} isCombined={true} />
                    {comment.children.map((child, childIndex) => (
                      <CommentBox key={child.id} comment={child} index={childIndex} />
                    ))}
                  </ClusteredCommentsContainer>
                ) : (
                  <Comment comment={comment} isCombined={false} />
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
