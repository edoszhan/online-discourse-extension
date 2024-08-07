import React, { useState} from "react";
import styled from "styled-components";
import axios from "axios";

import SummaryContext from "../CommentSection/SummaryContext";

const PopupContainer = styled.div`
  position: absolute;
  background-color: white;
  padding: 20px;
  width: 400px;
  border: 1px #ccc;
  border-radius: 1px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  right: 0;
  margin-top: 5px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0px;
  margin-bottom: 5px;
  height: 30px;
`;

const SummarizePopup = ({ articleId, threadId, comment, onClose, buttonRef, summary, reviewId, onSummarySaved}) => {
  const [localSummary, setSummary] = useState("");

  const [isTextareaEmpty, setIsTextareaEmpty] = useState(true);

  const { updateSummary } = React.useContext(SummaryContext);

  const saveSummary = async () => {
    try {
      const summaryToSend = localSummary.trim() !== "" ? localSummary : summary;
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/${threadId}/reviews/${reviewId}`, {
      summary: summaryToSend,
      });
      onClose();
      updateSummary(); 
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  return (
    <PopupContainer
      style={{
        top: buttonRef.current ? buttonRef.current.offsetTop + buttonRef.current.offsetHeight : 0,
        left: 'auto',
        right: buttonRef.current ? window.innerWidth - buttonRef.current.offsetLeft - buttonRef.current.offsetWidth : 0,
      }}
    >
       <Header>
        <h4>Finish the summarization</h4>
        <CloseButton onClick={onClose}>X</CloseButton>
      </Header>
      <p style={{textAlign: 'left'}}>
        <strong>AI Suggested Summary:</strong> {summary || "There was a general consensus that this is not the case in the article."}
      </p>
      <textarea
        placeholder="Revise a summary"
        value={localSummary}
        onChange={(e) => {
          setSummary(e.target.value);
          setIsTextareaEmpty(e.target.value.trim() === '');
        }}
        style={{ width: "100%", height: "60px" }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          style={{
            background: isTextareaEmpty ? '#B5B5B5' : 'green',
            color: 'white',
            cursor: isTextareaEmpty ? 'not-allowed' : 'pointer'
          }} 
          onClick={saveSummary}
          disabled={isTextareaEmpty}
        >
          Save Summary
        </button>
      </div>
    </PopupContainer>
  );
};

export default SummarizePopup;