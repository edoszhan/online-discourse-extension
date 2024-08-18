import React, { useState, useEffect, useRef, useContext} from 'react';
import styled from 'styled-components';
import CommentBoxBaseline from './CommentBoxBaseline';
import axios from 'axios';
import SummaryContext from './SummaryContextBaseline';

const CommentThreadBaseline = ({userId }) => {
  const [articleId, setArticleId] = useState(null);
  const threadId = 1000; //placeholder value 
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCounter, setCommentCounter] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const commentInputRef = useRef(null);
  const [allowComment, setAllowComment] = useState(true);

  const { commentDeleted, commentUpvoted, resetAll} = useContext(SummaryContext);

  const commentBoxContainerRef = useRef(null);

  useEffect(() => {
    fetchArticle();
  
    if (commentDeleted || commentUpvoted) {
      handleRefresh();
      resetAll();
    }
  
    if (replyingTo && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  
    if (articleId) {
      fetchComments();
    }
  }, [commentDeleted, commentUpvoted, replyingTo, articleId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (replyingTo && commentBoxContainerRef.current && !commentBoxContainerRef.current.contains(event.target)) {
        setReplyingTo(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyingTo]);

  const fetchArticle = async () => {
    try {
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/website_check/${encodedUrl}`);
      setArticleId(response.data.article_id);
    } catch (error) {
      console.error('Error fetching topics and questions:', error);
    }
  }

  const fetchComments = async () => {
    try {
      if (articleId === undefined) {
        throw new Error('Article ID or Thread ID is missing');
      }
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/comments/${threadId}`);
      const data = response.data || [];
      setComments(data);
      setCommentCounter(countAllComments(data));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const countAllComments = (comments) => {
    let count = 0;
    const countChildComments = (comment) => {
      count++;
      if (comment.children && comment.children.length > 0) {
        comment.children.forEach(countChildComments);
      }
    };
    comments.forEach(countChildComments);
    return count;
  };

  const handleAddComment = async () => {
    console.log("Replying to actually:", replyingTo);
    if (allowComment && newComment.trim()) {
      setAllowComment(false);
      try {
        const timestamp = new Date();
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${articleId}/${threadId}/comments`, {
          thread_id: threadId,
          text: newComment,
          author: userId,
          timestamp: timestamp,
          upvotes: [],
          children: [],
          cluster_id: null,
          article_id: articleId,
          children_id: replyingTo ? replyingTo : null,
          hasClusters: false,
        });
        setComments([...comments, response.data]);
        setNewComment('');
        setCommentCounter(commentCounter + 1);
        setReplyingTo(null);
        fetchComments();

        setTimeout(() => {
          setAllowComment(true);
        }, 2000);
      } catch (error) {
        console.error('Error adding comment:', error);
        setAllowComment(true);
      }
    }
  };

  const handleReplyClick = (commentId) => {
    console.log("replying to", commentId || null);
    setReplyingTo(commentId);
  };

  const handleRefresh = () => {
    fetchComments();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="comment-thread-container">
      <ButtonContainer>
        <RefreshButton onClick={handleRefresh}>
            <RefreshIcon>&#8635;</RefreshIcon>
          Refresh
        </RefreshButton>
      </ButtonContainer>
      <ThreadHeader className="thread-header">
        <h2>Discussion about the Article</h2>
      </ThreadHeader>
      <div className="heading-underline" style={{ backgroundColor: "#0000FF" }}></div>
      {comments && comments.length > 0 && <div className="comment-count">{commentCounter} comments</div>}
      {comments && comments.length === 0 ? (
        <div className="no-comments">
          <p>No Comments</p>
        </div>
      ) : (
        <CommentsContainer>
          {comments
            .filter((comment) => comment.children_id === null)
            .map((comment, index) => {
              const replies = comments.filter(
                (c) => c.children_id === comment.id
              );
              return (
                <CommentBoxBaseline
                  key={comment.id}
                  articleId={articleId}
                  threadId={threadId}
                  comment={comment}
                  index={index}
                  childrenComments={replies}
                  clusteredComments={[]}
                  userId={userId}
                  onReplyClick={handleReplyClick}
                  isReplyingTo={replyingTo === comment.id}
                />
              );
            })}
        </CommentsContainer>
      )}
      <Separator />
      <CommentBoxContainer ref={commentBoxContainerRef}>
        <UserProfile>{userId.charAt(0).toUpperCase() || 'A'}</UserProfile>
        <CommentInputContainer>
          <CommentInput
            ref={commentInputRef}
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <CommentActions>
            <AddCommentButton onClick={handleAddComment} disabled={!allowComment}>
              {allowComment ? 'POST' : 'Please wait...'}
            </AddCommentButton>
          </CommentActions>
        </CommentInputContainer>
      </CommentBoxContainer>
    </div>
  );
};

export default CommentThreadBaseline;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
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

const ThreadHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const CommentsContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: white; 
`;

const Separator = styled.hr`
  width: 100%;
  border: 0;
  height: 1px;
  background: #ccc;
  margin: 20px 0;
`;

const CommentBoxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  width: 100%;
`;

const UserProfile = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: black;
  font-weight: bold;
  margin-top: 10px;
  flex-shrink: 0;
`;

const CommentInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  width: 100%;
`;

const CommentInput = styled.textarea`
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
`;

const CommentActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const AddCommentButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;
  background-color: #5D6BE5;
`;

const CancelReplyButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;

  &:hover {
    text-decoration: underline;
  }
`;
