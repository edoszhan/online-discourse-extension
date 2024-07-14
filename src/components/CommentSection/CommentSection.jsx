import React, { useState } from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';

function CommentSection({userId, level}) {

  console.log('User ID in section:', userId);
  console.log('User Level in section:', level);
  const topiclist = [
    { id: 1, topic: "Impact of Resident Absence on Healthcare Services" },
    { id: 2, topic: "Government's Response to Collective Action" },
    { id: 3, topic: "Patient Inconvenience and Anxiety" },
  ];
  const colors = ["#5D6BE5", "#84D2C4", "#FC9CF2"];

  const [selectedThread, setSelectedThread] = useState(null);

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
    console.log('Selected thread:', thread);
  };

  return (
    <div className="comment-section css-s2htvn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedThread ? (
        <div className="discussion-threads" style={{ width: '100%' }}>
          <div style={{ padding: "15px" }}><b>Discussions About the Article</b></div>
          <div className="thread-list" style={{ display: 'flex' }}>
            {topiclist.map((thread, idx) => (
              <div key={thread.id} style={{ display: "flex", flexDirection: "column", width: '33%', margin: "5px" }}>
                <div style={{ display: "flex", borderBottom: `3px solid ${colors[idx]}`, height: "50px", alignItems: "center", marginBottom: "15px" }}>
                  {thread.topic}
                </div>
                <div
                  className="thread-box"
                  onClick={() => handleThreadClick(thread)}
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
        <CommentThread
         threadId={selectedThread.id}
         topic={selectedThread.topic} 
         onBack={() => setSelectedThread(null)}
         level={level}
         userId={userId}/>
      )}
    </div>
  );
}

export default CommentSection;
