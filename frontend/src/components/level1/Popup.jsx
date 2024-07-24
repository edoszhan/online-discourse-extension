import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const PopupContainer = styled.div`
  background-color: #4caf50;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
`;

const PopupText = styled.p`
  color: white;
  font-size: 18px;
  margin-bottom: 20px;
`;

const OkayButton = styled.button`
  background-color: white;
  color: #4caf50;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const Popup = ({ onClose }) => {
  return (
    <Overlay>
      <PopupContainer>
        <PopupText>The review has been summarized and saved.</PopupText>
        <PopupText>Go to the main page and refresh the thread to see the change</PopupText>
        <OkayButton onClick={onClose}>Okay</OkayButton>
      </PopupContainer>
    </Overlay>
  );
};

export default Popup;
