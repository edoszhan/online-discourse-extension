from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from app.utils.database import get_db
from app.models import Comment
from app.schemas import CommentCreate, CommentResponse
from app.models import Thread, Comment
from app.schemas import ThreadCreate, ThreadResponse, CommentCreate, CommentResponse

router = APIRouter()

@router.options("/api/comments")
async def comments_options():
    return Response(status_code=200)

@router.post("/threads", response_model=ThreadResponse)
async def create_thread(thread: ThreadCreate, db: Session = Depends(get_db)):
    db_thread = Thread(topic=thread.topic)
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread

@router.get("/threads/{thread_id}", response_model=ThreadResponse)
async def read_thread(thread_id: int, db: Session = Depends(get_db)):
    db_thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if db_thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return db_thread

@router.post("/comments", response_model=CommentResponse)
async def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    db_comment = Comment(
        thread_id=comment.thread_id,
        text=comment.text,
        author=comment.author,
        timestamp=comment.timestamp,
        upvotes=comment.upvotes,
        children=comment.children
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/comments/{thread_id}", response_model=List[CommentResponse])
async def read_comments(thread_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.thread_id == thread_id).all()
    return comments


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    # Delete the comment with the specified ID from the database
    db.query(Comment).filter(Comment.id == comment_id).delete()
    db.commit()
    return {"message": "Comment deleted 2 successfully"}

@router.get("/comments/{thread_id}/{comment_id}", response_model=CommentResponse)
async def read_comment(thread_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.thread_id == thread_id, Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment
