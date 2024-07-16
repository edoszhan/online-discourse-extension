from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Boolean
from .utils.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta

class Log(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String, index=True)
    folder_name = Column(String, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=9))))
    
class Thread(Base):
    __tablename__ = "threads"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String)

    comments = relationship("Comment", back_populates="thread")
    
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    text = Column(String)
    author = Column(String, default="admin")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=9))))
    upvotes = Column(Integer, default=0)
    children = Column(JSON, default=[])
    cluster_id = Column(Integer, nullable=True) 

    thread = relationship("Thread", back_populates="comments")
    
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    prev_order = Column(JSON)
    new_order = Column(JSON)
    source_id = Column(Integer)
    destination_id = Column(Integer)
    pending_review = Column(Boolean, default=True)
