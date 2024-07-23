import React, { useState, useEffect} from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';
import axios from 'axios';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
`;

const RefreshIcon = styled.span`
  margin-right: 5px;
  font-size: 15px;
`;

function CommentSection({userId, level}) {
  const [topics, setTopics] = useState([]);
  const [articleId, setArticleId] = useState(null);
  const colors = ["#5D6BE5", "#84D2C4", "#FC9CF2", "#2596be"];
  const [selectedThread, setSelectedThread] = useState(null);
  const [questions, setQuestions] = useState([]);

  // for new discussion thread
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  const [summaries, setSummaries] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/website_check/${encodedUrl}`);
        setTopics(response.data.topics || []);
        setQuestions(response.data.questions|| [])
        setArticleId(response.data.article_id);
      } catch (error) {
        console.error('Error fetching topics and questions:', error);
      }
    };
  
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchAllAcceptedReviews = async () => {
      const summariesTemp = [];
      const timestampsTemp = [];
      for (let threadId = 1; threadId <= 4; threadId++) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`);
          const reviews = response.data.filter((review) => !review.pendingReview).map(review => ({
            summary: review.summary,
            timestamp: new Date(review.timestamp).toLocaleString('default', { month: 'long', day: 'numeric' })
          }));
          summariesTemp[threadId] = reviews.filter((review) => review.summary != null).map(review => review.summary);
          timestampsTemp[threadId] = reviews.map(review => review.timestamp);
        } catch (error) {
          console.error(`Error fetching accepted reviews for threadId ${threadId}:`, error);
          summariesTemp[threadId] = [];
          timestampsTemp[threadId] = [];
        }
      }
      setSummaries(summariesTemp);
      setTimestamps(timestampsTemp);
    };

    if (articleId) {
      fetchAllAcceptedReviews();
    }
  }, [articleId]);


  const handleThreadClick = (topic) => {
    setSelectedThread({ id: topic.id, topic: topic.text, question: questions[topic.id-1] || "Question Placeholder", color: topic.color || "#FFFFFF" });
  };

  const handleRefresh= async () => {
    try {
      await fetchAllAcceptedReviews();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  }

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
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/website_check/${currentUrl}`, { topic: newTopicText });

        // Refetch the updated topics list
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/website_check/${encodeURIComponent(currentUrl)}`);
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
          <HeaderContainer>
            <div style={{ padding: "15px" }}><b>Discussions About the Article</b></div>
            <RefreshButton onClick={handleRefresh}>
              <RefreshIcon>&#8635;</RefreshIcon>
              Refresh
            </RefreshButton>
          </HeaderContainer>
          <div className="thread-list" style={{ display: 'flex' }}>
            {topics.map((topic, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", width: topicWidth, margin: "5px" }}>
                <div style={{ display: "flex", borderBottom: `3px solid ${colors[idx % colors.length]}`, height: "50px", alignItems: "center", marginBottom: "15px" }}>
                  {topic}
                </div>
                <div
                  className={`thread-box ${!summaries[idx + 1] || summaries[idx + 1].length === 0 ? 'no-comments' : ''}`}
                  onClick={() => handleThreadClick({ id: idx + 1, text: topic, color: colors[idx % colors.length] })}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: '100%', height: '400px', backgroundColor: "#E9E9E9" }}
                >
                  {summaries[idx + 1] && summaries[idx + 1].length > 0 ? (
                     <div className="timeline">
                     {summaries[idx + 1].map((summary, index) => (
                       summary ? (
                        <div key={index} className="timeline-item" style={{ position: 'relative', paddingLeft: '20px', marginBottom: '10px' }}>
                        <div className="timeline-date" style={{ padding: '5px 10px', background: colors[idx % colors.length], color: 'white', borderRadius: '5px', marginBottom: '5px' }}>
                          {timestamps[idx + 1][index]}
                        </div>
                        <div className="timeline-content">{summary}</div>
                        <div style={{ position: 'absolute', left: '-12px', top: '0', width: '6px', height: '100%', backgroundColor: colors[idx % colors.length] }}></div>
                      </div>
                       ) : null
                     ))}
                   </div>
                  ) : (
                    <>
                      <b>No Comments</b>
                      <br />
                      Click here to write comments
                    </>
                  )}
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
