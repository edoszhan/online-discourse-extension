import React, { useState, useEffect} from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';
import axios from 'axios';

function CommentSection({userId, level}) {
  const [topics, setTopics] = useState([]);
  const [articleId, setArticleId] = useState(null);
  const colors = ["#5D6BE5", "#84D2C4", "#FC9CF2", "#2596be"];
  const [selectedThread, setSelectedThread] = useState(null);
  const [questions, setQuestions] = useState([]);

  // for new discussion thread
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const currentUrl = window.location.href;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/${encodeURIComponent(currentUrl)}`);
        setTopics(response.data.topics || []);
        setQuestions(response.data.questions|| [])
        setArticleId(response.data.article_id);
      } catch (error) {
        console.error('Error fetching topics and questions:', error);
      }
    };
  
    fetchTopics();
  }, []);

  const handleThreadClick = (topic) => {
    setSelectedThread({ id: topic.id, topic: topic.text, question: questions[topic.id-1] || "Question Placeholder", color: topic.color || "#FFFFFF" });
  };

  const addNewThread = async () => {
    if (level === "L2") {
      let newTopicText = '';

      // Check if the suggested topic checkbox is checked
      const suggestedTopicCheckbox = document.getElementById('suggested-topic');
      if (suggestedTopicCheckbox && suggestedTopicCheckbox.checked) {
        newTopicText = `This feature is not yet supported: Please manually add the topic below`;
      } else {
        newTopicText = newTopic;
      }

      try {
        // Update the backend with the new topic
        const currentUrl = window.location.href;
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/${encodeURIComponent(currentUrl)}`, { topic: newTopicText });

        // Refetch the updated topics list
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/${encodeURIComponent(currentUrl)}`);
        setTopics(response.data.topics);
      } catch (error) {
        console.error('Error creating new discussion thread:', error);
      }

      setIsPopupOpen(false);
    }
  };

  const topicWidth = `${100 / topics.length}%`;

  return (
    <div className="comment-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedThread ? (
        <div className="discussion-threads" style={{ width: '100%' }}>
          <div style={{ padding: "15px" }}><b>Discussions About the Article</b></div>
          <div className="thread-list" style={{ display: 'flex' }}>
            {topics.map((topic, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", width: topicWidth, margin: "5px" }}>
                <div style={{ display: "flex", borderBottom: `3px solid ${colors[idx % colors.length]}`, height: "50px", alignItems: "center", marginBottom: "15px" }}>
                  {topic}
                </div>
                <div
                  className="thread-box"
                  onClick={() => handleThreadClick({ id: idx + 1, text: topic, color: colors[idx % colors.length] })}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: '100%', height: '400px', backgroundColor: "#E9E9E9" }}
                >
                  <b>No Comments</b>
                  <br />
                  Click here to write comments
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              style={{ padding: "10px 20px", marginTop: "20px", backgroundColor: "#5D6BE5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              onClick={() => level === "L2" && setIsPopupOpen(true)}
            >
              Create New Discussion Thread
            </button>
          </div>
          <br />
        </div>
      ) : (
        <CommentThread
          articleId={articleId}
          question={selectedThread.question}
          threadId={selectedThread.id}
          topic={selectedThread.topic}
          onBack={() => setSelectedThread(null)}
          level={level}
          userId={userId}
          color={selectedThread.color}
        />
      )}

      {isPopupOpen && (
        <div className="popup-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="popup-content" style={{
            background: 'white', padding: '20px', borderRadius: '10px', width: '400px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Create New Discussion Threads</span>
              <button onClick={() => setIsPopupOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ margin: '20px 0' }}>
              <b>Suggested Topics:</b>
                <div style={{ marginTop: '10px' }}>
                  <input type="checkbox" id="suggested-topic" name="suggested-topic" />
                  <label htmlFor="suggested-topic" style={{ marginLeft: '10px' }}>
                  <b>This feature is not yet supported</b>: Please manually add the topic below
                  </label>
                </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Write down new topic"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <button
              onClick={addNewThread}
              style={{
                padding: '10px 20px',
                backgroundColor: level === "L2" ? '#5D6BE5' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: level === "L2" ? 'pointer' : 'not-allowed'
              }}
            >
              Create New Discussion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentSection;
