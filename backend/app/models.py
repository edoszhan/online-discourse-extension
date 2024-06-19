from sqlalchemy import Column, String, DateTime
from .utils.database import Base
import datetime  # Add this import

class Log(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String, index=True)
    folder_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
