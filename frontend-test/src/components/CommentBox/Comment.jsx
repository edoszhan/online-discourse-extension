// import React from 'react';
// import styled from 'styled-components';

// const CommentContainer = styled.div`
//   padding: 10px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
//   background-color: ${(props) => (props.isCombined ? 'lightblue' : 'white')};
// `;

// const Comment = ({ text, isCombined }) => {
//   return (
//     <CommentContainer isCombined={isCombined}>
//       <p>{text}</p>
//     </CommentContainer>
//   );
// };

// export default Comment;

import React from 'react';
import styled from 'styled-components';
import IMG from '../../assets/default-avatar-2.png';

const CommentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
`;

const UserLogo = styled.div`
  margin-right: 10px;
`;

const CommentContent = styled.div`
  margin: 0;
  color: ${(props) => (props.isCombined ? 'red' : 'inherit')};
`;

const Comment = ({ comment, isCombined }) => {
  console.log("Rendering comment:", comment);
  return (
    <CommentContainer>
      <UserLogo>
        <img src={IMG} alt="User Profile" className="user-profile" />
      </UserLogo>
      <CommentContent isCombined={isCombined}>
        <p>{comment.text}</p>
      </CommentContent>
    </CommentContainer>
  );
};

export default Comment;
