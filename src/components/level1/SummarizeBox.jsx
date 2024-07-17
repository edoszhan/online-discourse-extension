import React, { useState, useRef} from "react";
import SummarizePopup from "./SummarizePopup";
import axios from "axios";

const SummarizeButton = ({ comment, clusteredComments, reviewId}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [summary, setSummary] = useState(null);
  const buttonRef = useRef(null);

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleSummarize = async () => {
    try {
      const commentsString = [comment.text, ...clusteredComments.map(comment => comment.text)].join('\n');
      console.log('Comments being sent to OpenAI:', commentsString);

      const response = await axios.post('http://localhost:8000/summarize', {
        comments: commentsString,
      });
      const generatedSummary = response.data.summary;
      setSummary(generatedSummary);
      setShowPopup(true);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  return (
    <div style={{ justifyContent: "flex-end", alignItems: "flex-end" }}>
      <button ref={buttonRef} style={{ background: "green", color: "white" }} onClick={handleSummarize}>
        Summarize
      </button>
      {showPopup && <SummarizePopup comment={comment} onClose={handlePopupClose} buttonRef={buttonRef} summary={summary} reviewId={reviewId}  />}
    </div>
  );
};

export default SummarizeButton;
