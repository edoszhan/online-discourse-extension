import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AiOutlineLike, AiFillLike, AiOutlineMessage, AiOutlineEllipsis, AiOutlineEdit, AiOutlineDelete, AiOutlineWarning} from "react-icons/ai";
import axios from 'axios';
import moment from 'moment-timezone';
import SummaryContext from '../CommentSection/SummaryContext';

const CommentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 5px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.isReplyingTo ? '#9bbcc7' : props.isCombined ? '#F2F2F2' : '#F2F2F2'}; //individual (not surrounding) comment background 
  opacity: ${(props) => (props.isDragging ? '1' : '1')}; 

  position: relative;
`;

const UserLogo = styled.div`
  margin-right: 10px;
  width: 50px;
  height: 50px;
  background-color: #E2E2E2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: black;
  font-weight: bold;
  margin-top: 10px;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex-grow: 1;
  color: ${(props) => (props.isCombined ? 'inherit' : 'black')};
`;

const CommentText = styled.p`
  margin: 0 0 10px 0;
  margin-top: 10px;
`;

const CommentDetails = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  color: #555;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
`;

const DotSeparator = styled.span`
  margin: 0 5px;
`;

const CommentActions = styled.div`
  display: flex;
  margin-top: 5px;
  justify-content: flex-start;

  .upvote-button {
    order: ${(props) => (props.hasReplyButton ? '2' : '1')}; /* Order based on the presence of the reply button */
  }

  .reply-button {
    order: 1; /* Always place the reply button first if it exists */
  }

  .ellipsis-button {
    order: 3; /* Keep ellipsis at the end */
  }
`;

const ReplyButton = styled.button`
  background: none;
  border: none;
  color: black;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 1px;
  margin-right: 5px;

  opacity: ${props => props.isDisabled ? 0.5 : 1};
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};

  &:hover {
    text-decoration: underline;
  }
`;

const UpvoteButton = styled.button`
  background: none;
  border: none;
  color: black;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;

  opacity: ${props => props.isDisabled ? 0.5 : 1};
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};

  &.active {
    color: black; 
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-right: 5px;
  justify-content: flex-end;

  svg {
    margin-right: 5px; // Add this line to create space between the icon and the number
  }
`;

const DraggableIndicator = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  background-color: #5D6BE5;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const EllipsisButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 4px;

  opacity: ${props => props.isDisabled ? 0.5 : 1};
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
`;

const MenuPopup = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  transform: translateY(5px);
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    margin-right: 8px;
  }
`;

const EditForm = styled.form`
  margin-top: 10px;
`;

const EditInput = styled.textarea`
  width: 95%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
`;

const EditButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding-right: 20px; // check 
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 12px;
  margin-right: 8px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 100%;
`;

const ModalHeader = styled.h2`
  text-align: left;
  margin-top: 0;
`;

const ModalText = styled.p`
  text-align: left;
  margin-bottom: 20px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  background-color: #D32F2F;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
`;

const CancelModalButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
`;

const FloatingMessage = styled.div`
  position: fixed;
  bottom: 40px;
  right: 380px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 10000;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;



const CommentNew = ({ articleId, threadId, comment, isCombined, isDragging, isReplyDisabled, userId, onReplyClick, level, isReplyingTo, isReplyEnabled, allComments}) => {
  if (!comment) {
    return null;
  }
  const { updateCommentDeleted, updateCommentUpvoted} = React.useContext(SummaryContext);

  const [upvotes, setUpvotes] = useState(comment.upvotes || []);
  const [hasUpvoted, setHasUpvoted] = useState(
    Array.isArray(comment.upvotes) && comment.upvotes.includes(userId)
  );  
  const [isReplying, setIsReplying] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const menuPopupRef = useRef(null);
  const ellipsisButtonRef = useRef(null);
  const [floatingMessage, setFloatingMessage] = useState(null);
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);


  const authorInitial = comment.author ? comment.author.charAt(0).toUpperCase() : 'A';

  const formattedTimestamp = moment.utc(comment.timestamp)
  .tz('Asia/Seoul')
  .format('MMMM D, YYYY h:mm A z');

  const addUpvote = async () => {
    if (!isReplyDisabled) {
      const updatedUpvotes = Array.isArray(comment.upvotes) && comment.upvotes.includes(userId)
      ? comment.upvotes.filter((id) => id !== userId)
      : Array.isArray(comment.upvotes)
        ? [...comment.upvotes, userId]
        : [userId];

      setHasUpvoted(!hasUpvoted);
      setUpvotes(updatedUpvotes);
    
      try {
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}/${comment.id}`, {
          upvotes: updatedUpvotes,
        });
      } catch (error) {
        console.error('Error updating upvotes:', error);
      }
      updateCommentUpvoted();
    }
  };

  const handleReplyClick = () => {
    if (!isReplyDisabled) {
      setIsReplying(true);
      onReplyClick(comment.id);
    }
  };
  const handleCancelReply = () => {
    setIsReplying(false);
  };

  const handleEllipsisClick = () => {
    if (!isReplyDisabled) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isReplying && !event.target.closest(".comment-container") && !event.target.closest(".comment-input")) {
        handleCancelReply();
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isReplying]);

  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (isMenuOpen && menuPopupRef.current && !menuPopupRef.current.contains(event.target) && !ellipsisButtonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (floatingMessage) {
      setShowFloatingMessage(true);
      const timer = setTimeout(() => {
        setShowFloatingMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [floatingMessage]);

  const handleEdit = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/comments/${comment.id}`, {
        text: editedText,
      });
      comment.text = editedText;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    const hasDependencies = allComments.some(
      (c) => c.children_id === comment.id || c.cluster_id === comment.id
    );

    if (hasDependencies) {
      setFloatingMessage('Cannot delete comment. It has replies or is part of a cluster.');
      closeDeleteModal();
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/comments/${comment.id}`);
      updateCommentDeleted();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  

  return (
    <CommentContainer isDragging={isDragging} isReplyingTo={isReplyingTo} isCombined={isCombined}>
        <UserLogo>{authorInitial}</UserLogo>
      <CommentContent isCombined={isCombined} isDragging={isDragging}>
        <CommentDetails>
          <CommentAuthor>{comment.author}</CommentAuthor>
          <DotSeparator>•</DotSeparator>
          <span>{formattedTimestamp}</span>
        </CommentDetails>
        {isEditing ? (
          <EditForm onSubmit={handleSaveEdit}>
            <EditInput
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
            <EditButtons>
              <CancelButton onClick={() => setIsEditing(false)}>Cancel</CancelButton>
              <SaveButton type="submit">Save Edit</SaveButton>
            </EditButtons>
          </EditForm>
        ) : (
          <CommentText>{comment.text}</CommentText>
        )}
        <CommentActions hasReplyButton={!isReplyDisabled && comment.children_id === null}>
          <UpvoteButton onClick={addUpvote} className={`upvote-button ${hasUpvoted ? 'active' : ''}`} isDisabled={isReplyDisabled}>
            <IconWrapper>{hasUpvoted ? <AiFillLike /> : <AiOutlineLike />} {upvotes.length || 0} </IconWrapper>
          </UpvoteButton>
          <EllipsisButton ref={ellipsisButtonRef} className="ellipsis-button" onClick={handleEllipsisClick} isDisabled={isReplyDisabled}>
            <IconWrapper> <AiOutlineEllipsis /> </IconWrapper>
          </EllipsisButton>
          {isMenuOpen && (
            <MenuPopup ref={menuPopupRef} className="menu-popup">
              {comment.author === userId && (
                <>
                  <MenuItem onClick={handleEdit}>
                    <AiOutlineEdit /> Edit comment
                  </MenuItem>
                  <MenuItem onClick={openDeleteModal}>
                    <AiOutlineDelete /> Delete comment
                  </MenuItem>
                </>
              )}
              {comment.author !== userId && (
                <MenuItem>
                  <AiOutlineWarning /> Report comment
                </MenuItem>
              )}
            </MenuPopup>
          )}
        </CommentActions>
      </CommentContent>
      {isDeleteModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>Delete comment?</ModalHeader>
            <ModalText>Are you sure you want to delete your comment? You can't undo this.</ModalText>
            <ModalButtons>
              <CancelModalButton onClick={closeDeleteModal}>Cancel</CancelModalButton>
              <ConfirmButton onClick={handleDelete}>Delete</ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
      {floatingMessage && (
        <FloatingMessage show={showFloatingMessage}>{floatingMessage}</FloatingMessage>
      )}
    </CommentContainer>
  );
};

export default CommentNew;
