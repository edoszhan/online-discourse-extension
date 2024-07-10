import React, { useState, useRef} from "react";
import SummarizePopup from "./SummarizePopup";

const SummarizeButton = ({ comment }) => {
  const [showPopup, setShowPopup] = useState(false);
  const buttonRef = useRef(null);

  const handleSummarizeClick = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div style={{ justifyContent: "flex-end", alignItems: "flex-end" }}>
      <button ref={buttonRef} style={{ background: "green", color: "white" }} onClick={handleSummarizeClick}>
        Summarize
      </button>
      {showPopup && <SummarizePopup comment={comment} onClose={handlePopupClose}  buttonRef={buttonRef} />}
    </div>
  );
};

export default SummarizeButton;
