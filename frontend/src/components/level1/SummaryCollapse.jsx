import React, { useState } from 'react';
import styled from 'styled-components';
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import CommentBox from '../CommentBox/CommentBox';
import CommentUnit from '../CommentBox/CommentUnit';

const SummaryCollapse = ({ articleId, threadId, summary, comment, clusteredComments, childrenComments, onReplyClick, userId }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <SummaryContainer>
        <SummaryText>{summary}</SummaryText>
        <ToggleButton onClick={toggleExpand}>
          {isExpanded ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </ToggleButton>
      </SummaryContainer>
      {isExpanded && (
        <ExpandedContent>
          <CommentBox articleId={articleId} threadId={threadId} userId={userId} comment={comment} clusteredComments={clusteredComments} childrenComments={childrenComments} onReplyClick={onReplyClick} pass="unpass" isSummary={true}/>
        </ExpandedContent>
      )}
    </div>
  );
};

export default SummaryCollapse;

const SummaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #e9e9e9;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
  border-radius: 10px 10px 0 0;
`;

const SummaryText = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const ToggleButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const ExpandedContent = styled.div`
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 10px 10px;
`;