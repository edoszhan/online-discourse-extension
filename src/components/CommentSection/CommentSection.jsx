import React, { useState } from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';

function CommentSection() {
  const topiclist = [
    "Impact of Resident Absence on Healthcare Services",
    "Government's Response to Collective Action",
    "Patient Inconvenience and Anxiety"
  ];
  const colors = ["#5D6BE5", "#84D2C4", "#FC9CF2"];

  const [selectedThread, setSelectedThread] = useState(null);

  const handleThreadClick = (topic) => {
    setSelectedThread(topic);
  };

  const handleBackClick = () => {
    setSelectedThread(null);
  };

  return (
    <div className="comment-section css-s2htvn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedThread ? (
        <div className="discussion-threads" style={{ width: '100%' }}>
          <div style={{ padding: "15px" }}><b>Discussions About the Article</b></div>
          <div className="thread-list" style={{ display: 'flex' }}>
            {topiclist.map((item, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", width: '33%', margin: "5px" }}>
                <div style={{ display: "flex", borderBottom: `3px solid ${colors[idx]}`, height: "50px", alignItems: "center", marginBottom: "15px" }}>
                  {item}
                </div>
                <div
                  className="thread-box"
                  onClick={() => handleThreadClick(item)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: '100%', height: '400px', backgroundColor: "#E9E9E9" }}
                >
                  <b>No Comments</b>
                  <br />
                  Click here to write comments
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CommentThread topic={selectedThread} onBack={handleBackClick} userLevel={1}/>
      )}
    </div>
  );
}

export default CommentSection;
