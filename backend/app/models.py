from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Boolean, TIMESTAMP
from .utils.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
from pytz import timezone

class Log(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String, index=True)
    folder_name = Column(String, index=True)
    timestamp = Column(TIMESTAMP, default=datetime.now(timezone('Asia/Seoul')))
    
class Thread(Base):
    __tablename__ = "threads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    website_url = Column(String, index=True)
    topics = Column(JSON)
    questions = Column(JSON)
    extracted_text = Column(String)
    suggested_topic_question = Column(JSON, default = [])

    comments = relationship("Comment", back_populates="thread")
    topic = relationship("Topic", back_populates="thread")
    
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    text = Column(String)
    author = Column(String, default="admin")
    timestamp = Column(TIMESTAMP, default=datetime.now(timezone('Asia/Seoul')))
    upvotes = Column(JSON, default=[])
    children = Column(JSON, default=[])
    cluster_id = Column(Integer, nullable=True) 
    article_id = Column(Integer, nullable=True)
    children_id = Column(Integer, nullable=True)
    hasClusters = Column(Boolean, default=False)

    thread = relationship("Thread", back_populates="comments")
    
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prev_order = Column(JSON, default = [])
    new_order = Column(JSON, default = [])
    source_id = Column(Integer)
    destination_id = Column(Integer)
    pending_review = Column(Boolean, nullable=True)
    accepted_by = Column(JSON, default=[])
    denied_by = Column(JSON, default=[])
    author = Column(String)
    timestamp = Column(TIMESTAMP, default=datetime.now(timezone('Asia/Seoul')))
    summary = Column(String)
    article_id= Column(Integer)
    thread_id= Column(Integer)


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    article_id = Column(Integer, ForeignKey("threads.id"))
    author = Column(String)
    suggested_topic = Column(String)
    suggested_question = Column(String)
    timestamp = Column(TIMESTAMP, default=datetime.now(timezone('Asia/Seoul')))
    acceptedBy = Column(JSON, default=[])
    deniedBy = Column(JSON, default=[])
    final_status = Column(String, default="pending")

    thread = relationship("Thread", back_populates="topic")