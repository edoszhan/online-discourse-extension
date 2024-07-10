import React, { useState} from "react";
import styled from "styled-components";

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

const SummarizePopup = ({ comment, onClose, buttonRef }) => {
  const [summary, setSummary] = useState("");

  const handleSummarize = () => {
    // OpenAI call here
    onClose();
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
      <p>
        <strong>Suggested Summary:</strong> There was a general consensus that this is not the case in the article.
      </p>
      <textarea
        placeholder="Revise a summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        style={{ width: "100%", height: "60px" }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{background:'#B5B5B5', color:'white'}} onClick={handleSummarize}>Summarize</button>
      </div>

    </PopupContainer>
  );
};

export default SummarizePopup;