import React, { useState, useEffect} from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';
import axios from 'axios';

function CommentSection({userId, level}) {
  const [topics, setTopics] = useState([]);
  const [articleId, setArticleId] = useState(null);
  const colors = ["#5D6BE5", "#84D2C4", "#FC9CF2"];
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const currentUrl = window.location.href;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/${encodeURIComponent(currentUrl)}`);
        setTopics(response.data.topics);
        console.log("response article_id:", response.data.article_id);
        setArticleId(response.data.article_id);
      } catch (error) {
        console.error('Error fetching topics and questions:', error);
      }
    };
  
    fetchTopics();
  }, []);

  const handleThreadClick = (topic) => {
    setSelectedThread({ id: topic.id, topic: topic.text });
  };


  return (
    <div className="comment-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedThread ? (
        <div className="discussion-threads" style={{ width: '100%' }}>
          <div style={{ padding: "15px" }}><b>Discussions About the Article</b></div>
          <div className="thread-list" style={{ display: 'flex' }}>
            {topics.map((topic, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", width: '33%', margin: "5px" }}>
                <div style={{ display: "flex", borderBottom: `3px solid ${colors[idx]}`, height: "50px", alignItems: "center", marginBottom: "15px" }}>
                  {topic}
                </div>
                <div
                  className="thread-box"
                  onClick={() => handleThreadClick({ id: idx, text: topic })}
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
         articleId={articleId} 
         question={selectedThread.question}
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
