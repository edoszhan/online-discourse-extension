import React from 'react';

const SummaryContext = React.createContext();

export const SummaryProvider = ({ children }) => {
  const [summaryUpdated, setSummaryUpdated] = React.useState(false);
  const [commentDeleted, setCommentDeleted] = React.useState(false);
  const [reviewUpdated, setReviewUpdated] = React.useState(false);
  const [commentUpvoted, setCommentUpvoted] = React.useState(false);

  const resetAll = () => {
    setSummaryUpdated(false);
    setCommentDeleted(false);
    setReviewUpdated(false);
    setCommentUpvoted(false);
  };

  const updateSummary = () => {
    setSummaryUpdated(true);
  };

  const updateCommentDeleted = () => {
    setCommentDeleted(true);
  };

  const updateReview = () => {
    setReviewUpdated(true);
  };

  const updateCommentUpvoted = () => {
    setCommentUpvoted(true);
  };

  return (
    <SummaryContext.Provider value={{ 
      summaryUpdated, 
      updateSummary, 
      commentDeleted, 
      updateCommentDeleted,
      reviewUpdated,
      updateReview,
      commentUpvoted,
      updateCommentUpvoted,
      resetAll
    }}>
      {children}
    </SummaryContext.Provider>
  );
};

export default SummaryContext;
