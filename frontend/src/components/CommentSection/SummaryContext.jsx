import React from 'react';

const SummaryContext = React.createContext();

export const SummaryProvider = ({ children }) => {
  const [summaryUpdated, setSummaryUpdated] = React.useState(false);

  const updateSummary = () => {
    setSummaryUpdated(true);
  };

  return (
    <SummaryContext.Provider value={{ summaryUpdated, updateSummary }}>
      {children}
    </SummaryContext.Provider>
  );
};

export default SummaryContext;
