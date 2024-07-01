from pydantic import BaseModel
from datetime import datetime
from typing import List;

class LogEntry(BaseModel):
    id: str
    user_id: str
    action: str
    folder_name: str
    timestamp: datetime

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    thread_id: int

class CommentResponse(CommentBase):
    id: int
    thread_id: int

    class Config:
        from_attributes = True
        

class ThreadBase(BaseModel):
    topic: str

class ThreadCreate(ThreadBase):
    pass

class ThreadResponse(ThreadBase):
    id: int
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True