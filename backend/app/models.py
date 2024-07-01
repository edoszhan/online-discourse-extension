from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from .utils.database import Base
from sqlalchemy.orm import relationship
import datetime  

class Log(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String, index=True)
    folder_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow) #have to be update this to korean time
    
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

    thread = relationship("Thread", back_populates="comments")
