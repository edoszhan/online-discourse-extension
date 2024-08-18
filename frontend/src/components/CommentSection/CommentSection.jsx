import React, { useState, useEffect} from 'react';
import CommentThread from '../CommentThread/CommentThread';
import './CommentSection.css';
import axios from 'axios';
import styled from 'styled-components';
import { AiFillCheckSquare, AiFillCloseSquare, AiOutlineClockCircle} from "react-icons/ai";
import moment from 'moment-timezone';
import { SummaryProvider } from './SummaryContext';
import { logEvent } from '../../utils/logger';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  font-weight: bold;
`;

const RefreshIcon = styled.span`
  margin-right: 5px;
  font-size: 15px;
`;

const FloatingMessage = styled.div`
  position: fixed;
  bottom: 40px;
  right: 380px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 10000;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
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

  const [allPendingTopics, setAllPendingTopics] = useState([]);
  const [pendingTopics, setPendingTopics] = useState([]);
  const [topicActions, setTopicActions] = useState({});

  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const [floatingMessage, setFloatingMessage] = useState('');
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);

  const [commentCounts, setCommentCounts] = useState({});

  const [currentUserPendingTopics, setCurrentUserPendingTopics] = useState([]);

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
    const commentCountsTemp = {};

    for (let threadId = 1; threadId <= 6; threadId++) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/reviews/${threadId}`);
        const reviews = response.data.filter((review) => !review.pendingReview).map(review => ({
          summary: review.summary,
          timestamp: moment.utc(review.timestamp).format('MMMM D, HH:mm')
        }));
        summariesTemp[threadId] = reviews.filter((review) => review.summary != null).map(review => review.summary);
        timestampsTemp[threadId] = reviews.map(review => review.timestamp);

        const commentCount = await fetchCommentCount(threadId);
        commentCountsTemp[threadId] = commentCount;
      } catch (error) {
        console.error(`Error fetching accepted reviews for threadId ${threadId}:`, error);
        summariesTemp[threadId] = [];
        timestampsTemp[threadId] = [];
        commentCountsTemp[threadId] = 0;
      }
    }
    setSummaries(summariesTemp);
    setTimestamps(timestampsTemp);
    setCommentCounts(commentCountsTemp);
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

      const allPendingTopics = await fetchAllPendingTopics(); 

      const topicExists = allPendingTopics.some(topic => {
        return topic.suggested_topic.toLowerCase() === newTopicText.toLowerCase();
      });

      if (topicExists) {
        setFloatingMessage('Duplicate topic names are not possible. Please check topics in Review Threads section.');
        setShowFloatingMessage(true);
        setTimeout(() => setFloatingMessage(false), 5000); // Clear message after 5 seconds
        return;
      }

      try {
        logEvent(
          `User suggested new thread: ${newTopicText}`,
          userId,
          'thread_suggested'
        );

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${articleId}`, {
          author: userId,
          suggested_topic: newTopicText,
          suggested_question: newQuestionText
        });
        setConfirmationMessage('Thank you! Your suggestion has been submitted successfully. Your suggestion will only be displayed to other people.');
      } catch (error) {
          console.error('Error creating new discussion thread:', error);
          setConfirmationMessage('An error occurred while submitting your suggestion. Please try again.');
        }
    
      setIsPopupOpen(false);
      setShowConfirmationMessage(true);
      setTimeout(() => setShowConfirmationMessage(false), 7000);
    }
  };

  const fetchPendingTopics = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${articleId}?current_user_id=${userId}`);
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

  const fetchAllPendingTopics = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/topicsAll/${articleId}`);
      if (response.data && Array.isArray(response.data)) {
        const filteredTopics = response.data.filter(topic => topic.final_status === "pending");
        setAllPendingTopics(filteredTopics);

        const currentUserTopics = filteredTopics.filter(topic => topic.author === userId);
        setCurrentUserPendingTopics(currentUserTopics);

        return filteredTopics;
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending topics:', error);
      return [];
    }
  };

  useEffect(() => {
    if (isReviewPopupOpen) {
      fetchPendingTopics();
      fetchAllPendingTopics();
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

      setConfirmationMessage('Thank you! Your choices have been saved successfully.');
      setShowConfirmationMessage(true);
      setTimeout(() => setShowConfirmationMessage(false), 7000);
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

  const fetchCommentCount = async (threadId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
    const data = response.data || [];
    return data.length;
  } catch (error) {
    console.error(`Error fetching comment count for threadId ${threadId}:`, error);
    return 0;
  }
};



  const topicWidth = `${100 / topics.length}%`;

  return (
    <div className="comment-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedThread ? (
        <div className="discussion-threads" style={{ width: '100%' }}>
          <HeaderContainer>
            <div className="header-title"><b>Discussions About the Article</b></div>
            <RefreshButton onClick={handleRefresh}>
              <RefreshIcon>&#8635;</RefreshIcon>
              Refresh
            </RefreshButton>
          </HeaderContainer>
          <div className="thread-list" No Summaries style={{ display: 'flex' }}>
            {topics.map((topic, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", width: topicWidth, margin: "5px" }}>
                <div className="topic-heading" style={{ display: "flex", borderBottom: `3px solid ${colors[idx % colors.length]}`, height: "50px", alignItems: "center", marginBottom: "15px"}}>
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
                      <b className="no-comments">No Summaries</b>
                      <br />
                      <span className="click-here">View all {commentCounts[idx + 1] || 0} comments</span>
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
              onClick={() => {
                if (level === "L2") {
                  setIsReviewPopupOpen(true);
                }
              }}
            >
              Review Threads
            </button>

          </div>
          <br />
          <br />
          {showConfirmationMessage && (
            <FloatingMessage show={showConfirmationMessage}>
              {confirmationMessage}
            </FloatingMessage>
          )}
        {floatingMessage && <FloatingMessage show={showFloatingMessage}>{floatingMessage}</FloatingMessage>}
        </div>
      ) : (
        <SummaryProvider>
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
        </SummaryProvider>
      )}



      {isPopupOpen && (
        <div className="popup-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="popup-content" style={{
            background: 'white', padding: '20px', borderRadius: '10px', width: '500px', zIndex: 10000, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px' }}>
              <span>Suggest New Discussion Thread</span>
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
              <p>Write down new topic</p>
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
        <div style={{ marginBottom: '20px' }}>
          <h3>Your Pending Topics</h3>
          {currentUserPendingTopics && currentUserPendingTopics.length > 0 ? (
            currentUserPendingTopics.map((topic) => (
              <div key={topic.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flexGrow: 1, textAlign: 'left', marginRight: '10px' }}>
                  <strong>{topic.suggested_topic}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                  <span style={{ marginRight: '10px' }}>Waiting for approval</span>
                  <AiOutlineClockCircle style={{ color: 'black', fontSize: '30px' }} />
                </div>
              </div>
            ))
          ) : (
            <div>No pending topics submitted by you.</div>
          )}
        </div>
        <div>
          <h3>Other Users' Pending Topics</h3>
          {allPendingTopics.filter(topic => topic.author !== userId).length > 0 ? (
            allPendingTopics
              .filter(topic => topic.author !== userId)
              .map((topic) => (
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
            <div>No pending topics submitted by other users.</div>
          )}
        </div>
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
