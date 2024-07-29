import React, { useState, useEffect} from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';
import axios from 'axios';
import styled from 'styled-components';
import { AiFillCheckSquare, AiFillCloseSquare } from "react-icons/ai";
import moment from 'moment-timezone';

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
  const colors = ["#5D6BE5", "#84D2C4", "#FC9CF2", "#2596be", "red", "green", "yellow"];
  const [selectedThread, setSelectedThread] = useState(null);
  const [questions, setQuestions] = useState([]);

  // for new discussion thread
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);

  const [summaries, setSummaries] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  // everything is used for suggest topic button
  const [suggestedMaterials, setSuggestedMaterials] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const isButtonEnabled = (isCheckboxChecked || (newTopic.trim() !== '' && newQuestion.trim() !== '')) && level === "L2";


  const [pendingTopics, setPendingTopics] = useState([]);
  const [topicActions, setTopicActions] = useState({});

  const fetchTopics = async () => {
    try {
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/website_check/${encodedUrl}`);
      setTopics(response.data.topics || []);
      setQuestions(response.data.questions|| [])
      setSuggestedMaterials(response.data.suggested_topic_question || []);
      setArticleId(response.data.article_id);
    } catch (error) {
      console.error('Error fetching topics and questions:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchAllAcceptedReviews = async () => {
    const summariesTemp = [];
    const timestampsTemp = [];
    for (let threadId = 1; threadId <= 6; threadId++) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`);
        const reviews = response.data.filter((review) => !review.pendingReview).map(review => ({
          summary: review.summary,
          timestamp: moment.utc(review.timestamp).format('MMMM D, HH:mm')
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
  
  useEffect(() => {
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
      await fetchTopics();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  }

  const addNewThread = async () => {
    if (isButtonEnabled) {
      let newTopicText = '';
      let newQuestionText = '';
  
      if (isCheckboxChecked) {
        newTopicText = suggestedMaterials[0];
        newQuestionText = suggestedMaterials[1];
      } else {
        newTopicText = newTopic;
        newQuestionText = newQuestion;
      }

      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${articleId}`, {
          author: userId,
          suggested_topic: newTopicText,
          suggested_question: newQuestionText
        }) } catch (error) {
          console.error('Error creating new discussion thread:', error);
        }
    
      setIsPopupOpen(false);
    }
  };

  const fetchPendingTopics = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${articleId}`);
      if (response.data && Array.isArray(response.data)) {
        const filteredTopics = response.data.filter(topic => topic.final_status === "pending");
        setPendingTopics(filteredTopics);
        setTopicActions(prevActions => {
          const newActions = { ...prevActions };
          filteredTopics.forEach(topic => {
            if (topic.acceptedBy && topic.acceptedBy.includes(userId)) {
              newActions[topic.id] = 'accept';
            } else if (topic.deniedBy && topic.deniedBy.includes(userId)) {
              newActions[topic.id] = 'reject';
            } else {
              newActions[topic.id] = null;
            }
          });
          return newActions;
        });
      }
    } catch (error) {
      console.error('Error fetching pending topics:', error);
    }
  };

  useEffect(() => {
    if (isReviewPopupOpen) {
      fetchPendingTopics();
    }
  }, [isReviewPopupOpen]);

  const handleTopicAction = (topicId, action) => {
    setTopicActions(prev => ({ ...prev, [topicId]: action }));
  };

  const handleSaveTopicReviews = async () => {
    try {
      const updatePromises = Object.entries(topicActions).map(([topicId, action]) => {
        if (action) {
          return axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${articleId}/${topicId}`, {
            acceptedBy: action === 'accept' ? [userId] : [],
            deniedBy: action === 'reject' ? [userId] : []
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      setIsReviewPopupOpen(false);
      fetchPendingTopics();
      setTopicActions({});
    } catch (error) {
      console.error('Error saving topic reviews:', error);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewTopic('');
    setNewQuestion('');
    setIsCheckboxChecked(false);
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
                <div style={{ display: "flex", borderBottom: `3px solid ${colors[idx % colors.length]}`, height: "50px", alignItems: "center", marginBottom: "15px"}}>
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
              style={{ padding: "10px 20px", marginTop: "20px", backgroundColor: level === "L2" ? "#5D6BE5" : "#E9E9E9", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              onClick={() => {
                if (level === "L2") {
                  setIsPopupOpen(true);
                  setNewTopic('');
                  setNewQuestion('');
                  setIsCheckboxChecked(false);
                }
              }}
            >
              Suggest New Thread
            </button>

            <button
              style={{
                padding: "10px 20px",
                marginTop: "20px",
                marginLeft: "10px",
                backgroundColor: level === "L2" ? "#5D6BE5" : "#E9E9E9",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
              onClick={() => setIsReviewPopupOpen(true)}
            >
              Review Threads
            </button>

          </div>
          <br />
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
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="popup-content" style={{
            background: 'white', padding: '20px', borderRadius: '10px', width: '500px', zIndex: 10000
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px' }}>
              <span>Suggest New Discussion Threads</span>
              <button onClick={handleClosePopup} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ margin: '20px 0' }}>
              {suggestedMaterials.length === 2 && (
                <div style={{ marginTop: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="suggested-topic" 
                    name="suggested-topic"
                    checked={isCheckboxChecked}
                    onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                    disabled={newTopic.trim() !== '' || newQuestion.trim() !== ''}
                  />
                  <label htmlFor="suggested-topic" style={{ marginLeft: '10px' }}>
                    <b>AI Topic:</b> {suggestedMaterials[0]}
                    <br />
                    <i> Question: </i> {suggestedMaterials[1]}
                  </label>
                </div>
              )}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p>Write down new topics</p>
              <textarea
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Topic"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
                disabled={isCheckboxChecked}
              />
              <p>Add supporting question to the topic</p>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                disabled={isCheckboxChecked}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <button
                onClick={addNewThread}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isButtonEnabled ? '#5D6BE5' : 'gray',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isButtonEnabled ? 'pointer' : 'not-allowed',
                  alignItems: 'center',
                  justifyContent: 'center', 
                }}
                disabled={!isButtonEnabled}
              >
              Suggest change
            </button>
            </div>
          </div>
        </div>
      )}


      {isReviewPopupOpen && (
        <div className="popup-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="popup-content" style={{
            background: 'white', padding: '20px', borderRadius: '10px', width: '500px', zIndex: 10000
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px' }}>
              <span>Review Suggested Threads</span>
              <button onClick={() => setIsReviewPopupOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              {pendingTopics.length > 0 ? (
                pendingTopics.map((topic) => (
                  <div key={topic.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flexGrow: 1, textAlign: 'left' }}>
                      <strong>{topic.suggested_topic}</strong>
                      <br />
                      <small>By: {topic.author}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => handleTopicAction(topic.id, 'accept')}
                        style={{ marginRight: '5px', cursor: 'pointer', border: 'none', background: 'none' }}
                      >
                        {topicActions[topic.id] === 'accept' ? (
                          <AiFillCheckSquare style={{ color: 'green', fontSize: '24px' }} />
                        ) : (
                          <div style={{ width: '24px', height: '24px', border: '2px solid green' }} />
                        )}
                      </button>
                      <button
                        onClick={() => handleTopicAction(topic.id, 'reject')}
                        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                      >
                        {topicActions[topic.id] === 'reject' ? (
                          <AiFillCloseSquare style={{ color: 'red', fontSize: '24px' }} />
                        ) : (
                          <div style={{ width: '24px', height: '24px', border: '2px solid red' }} />
                        )}
                      </button>
                    </div>
                  </div>
                )) 
              ) : (
                <div style={{ marginTop: '20px' }}>
                <p>No submitted topics by other users as of now</p>
              </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSaveTopicReviews}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#5D6BE5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Save My Choices
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CommentSection;
