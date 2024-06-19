from pydantic import BaseModel
from datetime import datetime

class LogEntry(BaseModel):
    id: str
    user_id: str
    action: str
    folder_name: str
    timestamp: datetime

    class Config:
        orm_mode = True
