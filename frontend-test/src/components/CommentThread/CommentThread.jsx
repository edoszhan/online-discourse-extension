// import React, { useState } from 'react';
// // import { DragDropContext, Draggable } from 'react-beautiful-dnd';
// import styled from 'styled-components';
// import CommentBox from '../CommentBox/CommentBox';
// import './CommentThread.css';
// import IMG from '../../assets/default-avatar-2.png';
// import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

// const CommentBoxContainer = styled.div`
//   display: flex;
//   align-items: flex-start;
//   margin-top: 20px;
//   width: 100%;
// `;

// const CommentInputContainer = styled.div`
//   display: flex;
//   flex-direction: column;s
//   margin-left: 10px;
//   width: 100%;
// `;

// const CommentInput = styled.textarea`
//   width: 100%;
//   height: 60px;
//   margin-bottom: 10px;
//   padding: 10px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
//   box-sizing: border-box;
// `;

// const CommentActions = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   width: 100%;
// `;

// const UserProfile = styled.img`
//   width: 30px;
//   height: 30px;
//   border-radius: 50%;
// `;

// const AddCommentButton = styled.button`
//   width: 100%;
//   padding: 10px 20px;
//   background-color: #007bff;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   box-sizing: border-box;
// `;

// const Separator = styled.hr`
//   width: 100%;
//   border: 0;
//   height: 1px;
//   background: #ccc;
//   margin: 20px 0;
// `;

// const ThreadHeader = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: flex-start;
// `;  

// const BackButton = styled.button`
//   background: none;
//   border: none;
//   cursor: pointer;
//   font-size: 15px;
//   display: flex;
//   align-items: center;
// `;

// const BackIcon = styled.span`
//   margin-right: 5px;
//   font-size: 15px;
// `;

// const CombinedComment = styled.div`
//   padding: 10px;
//   margin: 10px;
//   background-color: ${(props) => (props.status === 'pending' ? 'lightblue' : 'lightgreen')};
//   border: 1px solid lightgray;
// `;

// const CommentsContainer = styled.div`
//   border: 2px solid #000;
//   border-radius: 5px;
//   padding: 10px;
//   background-color: ${props => (props.isDraggingOver ? 'lightblue' : 'lightgrey')};
// `;

// const grid = 8;

// const getItemStyle = (isDragging, draggableStyle) => ({
//   userSelect: 'none',
//   padding: grid * 2,
//   margin: `0 0 ${grid}px 0`,
//   background: isDragging ? 'lightgreen' : 'grey',
//   ...draggableStyle,
// });

// const reorder = (list, startIndex, endIndex) => {
//   const result = Array.from(list);
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };


// const CommentThread = ({ topic, onBack, userLevel = 1 }) => {
//   // const [comments, setComments] = useState([]);
//   const [comments, setComments] = useState([
//     { id: '1', text: 'This is the first sample comment.' },
//     { id: '2', text: 'This is the second sample comment.' },
//     { id: '3', text: 'This is the third sample comment.' },
//   ]);
//   const [newComment, setNewComment] = useState('');
//   const [combinedComments, setCombinedComments] = useState([]);
//   const [commentCounter, setCommentCounter] = useState(0);

//   const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

//   const onDragEnd = (result) => {
//       if (!result.destination) {
//         return;
//       }

//     // const reorderedComments = reorder(
//     //   comments,
//     //   result.source.index,
//     //   result.destination.index
//     // );

//     if (result.combine) {
//       const { draggableId, combineWith } = result;
//       const draggedComment = comments.find((c) => c.id === draggableId);
//       const combinedComment = comments.find((c) => c.id === combineWith);

//       const updatedComments = comments.map((c) => {
//         if (c.id === draggableId) {
//           return { ...c, combinedWith: combineWith };
//         }
//         if (c.id === combineWith) {
//           return { ...c, combinedWith: draggableId };
//         }
//         return c;
//       });

//       setComments(reorderedComments);
//     }
//   };

//   const handleAddComment = () => {
//     if (newComment.trim()) {
//       const newCommentId = commentCounter + 1;
//       setComments([...comments, { id: newCommentId.toString(), text: newComment }]);
//       setNewComment('');
//       setCommentCounter(newCommentId);
//     }
//   };

//   const handleApproveCombination = (id) => {
//     setCombinedComments(
//       combinedComments.map((comment) =>
//         comment.id === id ? { ...comment, status: 'approved' } : comment
//       )
//     );
//   };

//   return (
//     <div className="comment-thread-container">
//       <BackButton onClick={onBack}>
//         <BackIcon>&larr;</BackIcon>
//         Back
//       </BackButton> 
//       <ThreadHeader className="thread-header">
//         <h2>{topic}</h2>
//       </ThreadHeader>
//       <div className="heading-underline"></div>
//       <div className="random-question">{randomQuestion}</div>
//       {comments.length > 0 && <div className="comment-count">{comments.length} comments</div>}
//       {comments.length === 0 ? (
//         <div className="no-comments">
//           <p>No Comments</p>
//         </div>
//       ) : (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable droppableId="droppable-comments" isCombineEnabled={true}>
//             {(provided) => (
//             <div className="comments-list" {...provided.droppableProps} ref={provided.innerRef}>
//               <CommentBox comments={comments} />
//               {provided.placeholder}
//             </div>
//           )}
//           </Droppable>
//         </DragDropContext>
//       )}
//       <Separator />
//       <CommentBoxContainer>
//         <UserProfile src={IMG} alt="User Profile" />
//         <CommentInputContainer>
//           <CommentInput
//             placeholder="Add a comment..."
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//           />
//           <CommentActions>
//             <AddCommentButton onClick={handleAddComment}>
//               POST
//             </AddCommentButton>
//           </CommentActions>
//         </CommentInputContainer>
//       </CommentBoxContainer>
//       <div>
//         {combinedComments.map((combined) => (
//           <CombinedComment key={combined.id} status={combined.status}>
//             {combined.content}
//             {userLevel === 2 && combined.status === 'pending' && (
//               <button onClick={() => handleApproveCombination(combined.id)}>Approve</button>
//             )}
//           </CombinedComment>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CommentThread;


// import React, { useState } from 'react';
// import { DragDropContesxt, Draggable, Droppable } from '@hello-pangea/dnd';
// import styled from 'styled-components';
// import CommentBox from '../CommentBox/CommentBox';
// import './CommentThread.css';
// import IMG from '../../assets/default-avatar-2.png';

// // ... (keep the existing styled components)

// const CommentThread = ({ topic, onBack, userLevel = 1 }) => {
//   const [comments, setComments] = useState([
//     { id: '1', text: 'This is the first sample comment.' },
//     { id: '2', text: 'This is the second sample comment.' },
//     { id: '3', text: 'This is the third sample comment.' },
//   ]);
//   const [newComment, setNewComment] = useState('');
//   const [combinedComments, setCombinedComments] = useState([]);
//   const [commentCounter, setCommentCounter] = useState(0);

//   const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

//   const onDragEnd = (result) => {
//     const { destination, source, draggableId } = result;

//     if (!destination) return;

//     if (source.droppableId !== destination.droppableId) {
//       // Combining logic here
//       const combined = {
//         id: `combined-${Date.now()}`,
//         content: `${comments.find((c) => c.id === draggableId).text} + ${comments.find((c) => c.id === destination.droppableId).text}`,
//         status: 'pending'
//       };
//       setCombinedComments([...combinedComments, combined]);
//     } else {
//       // Normal reordering logic
//       const reorderedComments = Array.from(comments);
//       const [movedComment] = reorderedComments.splice(source.index, 1);
//       reorderedComments.splice(destination.index, 0, movedComment);

//       setComments(reorderedComments);
//     }
//   };

//   const handleAddComment = () => {
//     if (newComment.trim()) {
//       const newCommentId = commentCounter + 1;
//       setComments([...comments, { id: newCommentId.toString(), text: newComment }]);
//       setNewComment('');
//       setCommentCounter(newCommentId);
//     }
//   };

//   const handleApproveCombination = (id) => {
//     setCombinedComments(
//       combinedComments.map((comment) =>
//         comment.id === id ? { ...comment, status: 'approved' } : comment
//       )
//     );
//   };

//   return (
//     <div className="comment-thread-container">
//       {/* ... (keep the existing elements) */}
//       {comments.length === 0 ? (
//         <div className="no-comments">
//           <p>No Comments</p>
//         </div>
//       ) : (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable droppableId="droppable-comments">
//             {(provided) => (
//               <div className="comments-list" {...provided.droppableProps} ref={provided.innerRef}>
//                 {comments.map((comment, index) => (
//                   <Draggable key={comment.id} draggableId={`${comment.id}`} index={index}>
//                     {(provided, snapshot) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         {...provided.dragHandleProps}
//                       >
//                         <CommentBox comment={comment.text} isDragging={snapshot.isDragging} />
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>
//       )}
//       {/* ... (keep the existing elements) */}
//     </div>
//   );
// };

// export default CommentThread;


import React, { useState } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import CommentBox from '../CommentBox/CommentBox';
import './CommentThread.css';
import IMG from '../../assets/default-avatar-2.png';

const CommentBoxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  width: 100%;
`;

const CommentInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  width: 100%;
`;

const CommentInput = styled.textarea`
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
`;

const CommentActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const UserProfile = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

const AddCommentButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;
`;

const Separator = styled.hr`
  width: 100%;
  border: 0;
  height: 1px;
  background: #ccc;
  margin: 20px 0;
`;

const ThreadHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
`;

const BackIcon = styled.span`
  margin-right: 5px;
  font-size: 15px;
`;

const CombinedCommentContainer = styled.div`
  padding: 10px;
  margin: 10px 0;
  background-color: lightblue;
  border: 1px solid lightgray;
`;

const ReviewMessage = styled.div`
  font-size: 12px;
  color: #555;
  margin-top: 10px;
`;

const CommentsContainer = styled.div`
  border: 2px solid #000;
  border-radius: 5px;
  padding: 10px;
  background-color: ${(props) => (props.isDraggingOver ? 'lightblue' : 'lightgrey')};
`;

const CommentThread = ({ topic, onBack, userLevel = 1 }) => {
  const [comments, setComments] = useState([
    { id: '100', text: 'This is the first comment.', children: [] },
    { id: '101', text: 'This is the second comment.', children: [] },
    { id: '102', text: 'This is the third comment.', children: [] },
  ]);
  const [newComment, setNewComment] = useState('');
  const [commentCounter, setCommentCounter] = useState(0);

  const randomQuestion = "How has the collective action of doctors, particularly residents, affected patient care and hospital operations over the past three months?";

  const onDragEnd = (result) => {
    console.log("onDragEnd result:", result);
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log("Dropped in the same position");
      return;
    }

    const draggedComment = comments.find((comment) => comment.id === draggableId);
    console.log("Dragged comment:", draggedComment);
    
    if (destination.droppableId === source.droppableId) {
      console.log("simple reorder");
      // reordering
      const newComments = Array.from(comments);
      const [removed] = newComments.splice(source.index, 1);
      newComments.splice(destination.index, 0, removed);
      setComments(newComments);
      console.log("Reordered comments:", newComments);
    } else {
      // clustering 
      console.log("hard clustering");
      const updatedComments = comments.map((comment) => {
        console.log("comment:", comment);
        if (comment.id === destination.droppableId) {
          console.log("Success");
          return {
            ...comment,
            children: [...comment.children, draggedComment],
            pendingReview: true,
          };
        }
        return comment;
      });
      setComments(updatedComments.filter((comment) => comment.id !== draggableId));
      console.log("Combined comments:", updatedComments);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentId = commentCounter + 1;
      setComments([...comments, { id: newCommentId.toString(), text: newComment, children: [] }]);
      setNewComment('');
      setCommentCounter(newCommentId);
    }
  };

  return (
    <div className="comment-thread-container">
      <BackButton onClick={onBack}>
        <BackIcon>&larr;</BackIcon>
        Back
      </BackButton>
      <ThreadHeader className="thread-header">
        <h2>{topic}</h2>
      </ThreadHeader>
      <div className="heading-underline"></div>
      <div className="random-question">{randomQuestion}</div>
      {comments.length > 0 && <div className="comment-count">{comments.length} comments</div>}
      {comments.length === 0 ? (
        <div className="no-comments">
          <p>No Comments</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-comments" isCombineEnabled={true}>
            {(provided, snapshot) => (
              <CommentsContainer ref={provided.innerRef} {...provided.droppableProps} isDraggingOver={snapshot.isDraggingOver}>
                {comments.map((comment, index) => (
                  comment.children.length > 0 ? (
                    <CombinedCommentContainer key={comment.id}>
                      <CommentBox comment={comment} index={index} />
                      <ReviewMessage>This change will be reviewed by the person in charge.</ReviewMessage>
                    </CombinedCommentContainer>
                  ) : (
                    <CommentBox key={comment.id} comment={comment} index={index} />
                  )
                ))}
                {provided.placeholder}
              </CommentsContainer>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Separator />
      <CommentBoxContainer>
        <UserProfile src={IMG} alt="User Profile" />
        <CommentInputContainer>
          <CommentInput
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <CommentActions>
            <AddCommentButton onClick={handleAddComment}>
              POST
            </AddCommentButton>
          </CommentActions>
        </CommentInputContainer>
      </CommentBoxContainer>
    </div>
  );
};

export default CommentThread;




