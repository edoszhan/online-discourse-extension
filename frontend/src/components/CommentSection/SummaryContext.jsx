import React from 'react';

const SummaryContext = React.createContext();

export const SummaryProvider = ({ children }) => {
  const [summaryUpdated, setSummaryUpdated] = React.useState(false);
  const [commentDeleted, setCommentDeleted] = React.useState(false);


  const updateSummary = () => {
    setSummaryUpdated(true);
  };

  const updateCommentDeleted = () => {
    setCommentDeleted(true);
  };

  return (
    <SummaryContext.Provider value={{ summaryUpdated, updateSummary, commentDeleted, updateCommentDeleted }}>
      {children}
    </SummaryContext.Provider>
  );
};

export default SummaryContext;
