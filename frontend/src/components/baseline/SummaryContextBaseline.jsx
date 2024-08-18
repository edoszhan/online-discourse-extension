import React from 'react';

const SummaryContext = React.createContext();

export const SummaryProvider = ({ children }) => {
  const [commentDeleted, setCommentDeleted] = React.useState(false);
  const [commentUpvoted, setCommentUpvoted] = React.useState(false);

  const updateCommentDeleted = () => {
    setCommentDeleted(true);
  };

  const updateCommentUpvoted = () => {
    setCommentUpvoted(true);
  };

  const resetAll= () => {
    setCommentDeleted(false);
    setCommentUpvoted(false);
  };

  return (
    <SummaryContext.Provider value={{ commentDeleted, updateCommentDeleted, commentUpvoted, updateCommentUpvoted, resetAll}}>
      {children}
    </SummaryContext.Provider>
  );
};

export default SummaryContext;
