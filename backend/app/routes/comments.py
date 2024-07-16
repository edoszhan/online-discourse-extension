from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from app.utils.database import get_db
from app.models import Comment
from app.schemas import CommentCreate, CommentResponse
from app.models import Thread, Comment, Review
from app.schemas import ThreadCreate, ThreadResponse, CommentCreate, CommentResponse, ReviewCreate, ReviewResponse

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
    db.query(Comment).filter(Comment.id == comment_id).delete()
    db.commit()
    return {"message": "Comment deleted 2 successfully"}

@router.put("/comments/{thread_id}/{comment_id}", response_model=CommentResponse)
async def update_comment(thread_id: int, comment_id: int, update_data: dict, db: Session = Depends(get_db)):
    db_comment = db.query(Comment).filter(Comment.thread_id == thread_id, Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    print(f"Updating comment: {db_comment.id} with data: {update_data}")
    print(f"Before update - Comment ID: {db_comment.id}, Cluster ID: {db_comment.cluster_id}")

    # Only update the cluster_id field
    if 'cluster_id' in update_data:
        db_comment.cluster_id = update_data['cluster_id']
        print(f"After update - Comment ID: {db_comment.id}, Cluster ID: {db_comment.cluster_id}")
    else:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    db.commit()
    db.refresh(db_comment)

    print(f"Updated comment: {db_comment.id}, Cluster ID: {db_comment.cluster_id}")

    return db_comment


@router.get("/comments/{thread_id}/{comment_id}", response_model=CommentResponse)
async def read_comment(thread_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.thread_id == thread_id, Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.post("/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    print(f"Received review data: {review}")

    db_review = Review(
        prev_order=review.prevOrder,
        new_order=review.newOrder,
        source_id=review.sourceId,
        destination_id=review.destinationId,
        pending_review=review.pendingReview
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return ReviewResponse(
        id=db_review.id,
        prevOrder=db_review.prev_order,
        newOrder=db_review.new_order,
        sourceId=db_review.source_id,
        destinationId=db_review.destination_id,
        pendingReview=db_review.pending_review
    )

@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return ReviewResponse(
        id=review.id,
        prevOrder=review.prev_order,
        newOrder=review.new_order,
        sourceId=review.source_id,
        destinationId=review.destination_id,
        pendingReview=review.pending_review
    )