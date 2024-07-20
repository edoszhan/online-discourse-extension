from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List  # Import List from typing
from app.utils.database import get_db
from app.models import Log
from app.schemas import LogEntry
from datetime import datetime
from pytz import timezone

router = APIRouter()

@router.post("/log", response_model=LogEntry)
async def create_log(log: LogEntry, db: Session = Depends(get_db)):
    db_log = Log(
        id=str(datetime.now(timezone('Asia/Seoul')).timestamp()),
        user_id=log.user_id,
        action=log.action,
        folder_name=log.folder_name,
        timestamp=datetime.now(timezone('Asia/Seoul'))
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/logs", response_model=List[LogEntry])  # Use List from typing
async def read_logs(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    logs = db.query(Log).offset(skip).limit(limit).all()
    return logs

@router.get("/log/{log_id}", response_model=LogEntry)
async def read_log(log_id: str, db: Session = Depends(get_db)):
    log = db.query(Log).filter(Log.id == log_id).first()
    if log is None:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@router.put("/log/{log_id}", response_model=LogEntry)
async def update_log(log_id: str, updated_log: LogEntry, db: Session = Depends(get_db)):
    log = db.query(Log).filter(Log.id == log_id).first()
    if log is None:
        raise HTTPException(status_code=404, detail="Log not found")
    
    log.user_id = updated_log.user_id
    log.action = updated_log.action
    log.folder_name = updated_log.folder_name
    log.timestamp = updated_log.timestamp

    db.commit()
    db.refresh(log)
    return log

@router.delete("/log/{log_id}", response_model=LogEntry)
async def delete_log(log_id: str, db: Session = Depends(get_db)):
    log = db.query(Log).filter(Log.id == log_id).first()
    if log is None:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(log)
    db.commit()
    return log



