import React, { useState } from 'react';
import styled from 'styled-components';
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import CommentBox from '../CommentBox/CommentBox';

const SummaryCollapse = ({ summary, comment, clusteredComments }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <CommentBox comment={comment} clusteredComments={clusteredComments} />
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
  padding: 10px;
  background-color: #f0f0f0;
  cursor: pointer;
`;

const SummaryText = styled.div`
  flex: 1;
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
  padding: 10px;
`;
