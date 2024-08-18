import React, { useState, useRef} from "react";
import SummarizePopup from "./SummarizePopup";
import axios from "axios";

const SummarizeButton = ({ articleId, threadId, comment, clusteredComments, childrenComments, reviewId,  onSummarySaved, allComments}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [summary, setSummary] = useState(null);
  const buttonRef = useRef(null);

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const findClusteredComments = (clusteredCommentId) => {
    const clusteredComments = allComments.filter((c) => c.children_id === clusteredCommentId);
    return clusteredComments;
  };

  const handleSummarize = async () => {
    try {
      const allComments = [
        comment.text,
        ...childrenComments.map(comment => comment.text),
        ...clusteredComments.map(comment => comment.text),
        ...clusteredComments.flatMap(comment => findClusteredComments(comment.id).map(child => child.text))
      ];
      const commentsString = allComments.join('\n');

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/summarize`, {
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
      {showPopup && <SummarizePopup articleId={articleId} threadId={threadId}
      comment={comment} onClose={handlePopupClose} buttonRef={buttonRef} summary={summary} reviewId={reviewId}  onSummarySaved={onSummarySaved} />}
    </div>
  );
};

export default SummarizeButton;
