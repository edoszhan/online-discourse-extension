from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from typing import List
from app.utils.database import get_db
from app.models import Comment
from app.schemas import CommentCreate, CommentResponse
from app.models import Thread, Comment, Review
from app.schemas import ThreadCreate, ThreadResponse, CommentCreate, CommentResponse, ReviewCreate, ReviewResponse, ReviewUpdate
from datetime import datetime
from urllib.parse import urlparse, unquote
from pydantic import BaseModel

router = APIRouter()

@router.get("/articles/{article_id}/comments/{thread_id}", response_model=List[CommentResponse])
async def read_comments(article_id: int, thread_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.article_id == article_id, Comment.thread_id == thread_id).order_by(Comment.id).all()
    return comments

@router.get("/articles/{article_id}/reviews/{thread_id}", response_model=List[ReviewResponse]) #updated
async def get_reviews(article_id: int, thread_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.article_id== article_id, Review.thread_id == thread_id).order_by(Review.id).all()
    return [
        ReviewResponse(
            id=review.id,
            prevOrder=review.prev_order,
            newOrder=review.new_order,
            sourceId=review.source_id,
            destinationId=review.destination_id,
            pendingReview=review.pending_review,
            acceptedBy=review.accepted_by,
            deniedBy=review.denied_by,
            author=review.author,
            timestamp=review.timestamp,
            summary=review.summary,
            article_id = review.article_id,
            thread_id=review.thread_id
        )
        for review in reviews
    ]


@router.options("/api/comments")
async def comments_options():
    return Response(status_code=200)

@router.post("/threads", response_model=ThreadResponse) #updated
async def create_thread(thread: ThreadCreate, db: Session = Depends(get_db)):
    db_thread = Thread(
        website_url=thread.website_url,
        topics=thread.topics,
        questions=thread.questions
    )
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread


# COMMENTS CALLS
@router.post("/articles/{article_id}/{thread_id}/comments", response_model=CommentResponse) #updated
async def create_comment(article_id: int, thread_id: int, comment: CommentCreate, db: Session = Depends(get_db)):
    db_comment = Comment(
        thread_id=comment.thread_id,
        text=comment.text,
        author=comment.author,
        timestamp=comment.timestamp,
        upvotes=comment.upvotes,
        children=comment.children,
        cluster_id=comment.cluster_id,
        article_id=article_id,
        children_id =comment.children_id,
        hasClusters=comment.hasClusters
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/articles/{article_id}/comments/{thread_id}", response_model=List[CommentResponse]) #updated
async def read_comments(article_id: int, thread_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.article_id == article_id, Comment.thread_id == thread_id).all()
    return comments


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db.query(Comment).filter(Comment.id == comment_id).delete()
    db.commit()
    return {"message": "Comment deleted 2 successfully"}

# @router.put("/articles/{article_id}/comments/{thread_id}/{comment_id}", response_model=CommentResponse) #updated
# async def update_comment(article_id: int, thread_id: int, comment_id: int, update_data: dict, db: Session = Depends(get_db)):
#     db_comment = db.query(Comment).filter(
#         Comment.article_id == article_id,
#         Comment.thread_id == thread_id,
#         Comment.id == comment_id
#     ).first()
#     if db_comment is None:
#         raise HTTPException(status_code=404, detail="Comment not found")

#     print(f"Updating comment: {db_comment.id} with data: {update_data}")
#     print(f"Before update - Comment ID: {db_comment.id}, Cluster ID: {db_comment.cluster_id}")

#     # Only update the cluster_id field
#     if 'cluster_id' in update_data:
#         db_comment.cluster_id = update_data['cluster_id']
#         print(f"After update - Comment ID: {db_comment.id}, Cluster ID: {db_comment.cluster_id}")
#     else:
#         raise HTTPException(status_code=400, detail="No valid fields provided for update")

#     db.commit()
#     db.refresh(db_comment)

#     print(f"Updated comment: {db_comment.id}, Cluster ID: {db_comment.cluster_id}")

#     return db_comment

@router.put("/articles/{article_id}/comments/{thread_id}/{comment_id}", response_model=CommentResponse) # here, we can update cluster_id, children_id, upvotes
async def update_comment(article_id: int, thread_id: int, comment_id: int, update_data: dict, db: Session = Depends(get_db)):
    db_comment = db.query(Comment).filter(
        Comment.article_id == article_id,
        Comment.thread_id == thread_id,
        Comment.id == comment_id
    ).first()

    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    updated = False

    if 'cluster_id' in update_data:
        db_comment.cluster_id = update_data['cluster_id']
        updated = True

    if 'children_id' in update_data:
        if db_comment.children_id is None:
            db_comment.children_id = update_data['children_id']
            updated = True

    if 'upvotes' in update_data:
        print('Received upvotes:', update_data['upvotes'])
        if isinstance(update_data['upvotes'], list):
            db_comment.upvotes = update_data['upvotes']
            updated = True
    
    if 'hasClusters' in update_data:
        db_comment.hasClusters = update_data['hasClusters']
        updated = True

    if not updated:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    db.commit()
    db.refresh(db_comment)

    return db_comment



@router.get("/articles/{article_id}/comments/{thread_id}/{comment_id}", response_model=CommentResponse) #updated
async def read_comment(article_id: int, thread_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.thread_id == thread_id, Comment.id == comment_id, Comment.article_id == article_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


# REVIEWS CALLS
@router.post("/articles/{article_id}/reviews/{thread_id}", response_model=ReviewResponse) #updated
async def create_review(article_id: int, thread_id: int, review: ReviewCreate, db: Session = Depends(get_db)):
    print(f"Received review data: {review}")
    
    review.new_order_dicts = [comment.model_dump() for comment in review.newOrder]
    for comment_dict in review.new_order_dicts:
        comment_dict['timestamp'] = comment_dict['timestamp'].isoformat()
    
    try:
        db_review = Review(
            article_id=article_id,
            thread_id=thread_id,
            prev_order=review.prevOrder,
            new_order=review.new_order_dicts,
            source_id=review.sourceId,
            destination_id=review.destinationId,
            pending_review=review.pendingReview,
            accepted_by=review.acceptedBy,
            denied_by=review.deniedBy,
            author=review.author,
            timestamp=review.timestamp
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
            pendingReview=db_review.pending_review,
            acceptedBy=db_review.accepted_by,
            deniedBy=db_review.denied_by,
            author=db_review.author,
            timestamp=db_review.timestamp,
            article_id=db_review.article_id,
            thread_id=db_review.thread_id
        )
    except Exception as e:
        print(f"Error creating review: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    
@router.get("/articles/{article_id}/{thread_id}/reviews/{review_id}", response_model=ReviewResponse) #updated
async def get_review(article_id: int, thread_id: int, review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id,
                                     Review.article_id == article_id,
                                     Review.thread_id == thread_id
                                     ).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return ReviewResponse(
        id=review.id,
        prevOrder=review.prev_order,
        newOrder=review.new_order,
        sourceId=review.source_id,
        destinationId=review.destination_id,
        pendingReview=review.pending_review,
        acceptedBy=review.accepted_by,
        deniedBy=review.denied_by,
        author=review.author,
        timestamp=review.timestamp,
        summary=review.summary,
        article_id=review.article_id,
        thread_id=review.thread_id
    )
    
@router.delete("/articles/{article_id}/{thread_id}/reviews/{review_id}")
async def delete_review(article_id: int, thread_id: int, review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.article_id == article_id,
        Review.thread_id == thread_id
    ).first()
    
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}

@router.put("/articles/{article_id}/{thread_id}/reviews/{review_id}", response_model=ReviewResponse) #updated
async def update_review(article_id: int, thread_id: int, review_id: int, updated_review: ReviewUpdate, db: Session = Depends(get_db)):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.article_id == article_id,
        Review.thread_id == thread_id
    ).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    print(f"Updating review with ID: {review_id}")
    print(f"Updated review data: {updated_review}")

    if updated_review.acceptedBy is not None:
        review.accepted_by = updated_review.acceptedBy
        review.pending_review = len(updated_review.acceptedBy) < 2
    if updated_review.deniedBy is not None:
        review.denied_by = updated_review.deniedBy
    if updated_review.summary is not None:
        review.summary = updated_review.summary

    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        prevOrder=review.prev_order,
        newOrder=review.new_order,
        sourceId=review.source_id,
        destinationId=review.destination_id,
        pendingReview=review.pending_review,
        acceptedBy=review.accepted_by,
        deniedBy=review.denied_by,
        author=review.author,
        timestamp=review.timestamp,
        summary=review.summary,
        article_id=review.article_id,
        thread_id=review.thread_id
    )

@router.get("/website_check/{website_url:path}")
async def get_topics_by_url(website_url: str, db: Session = Depends(get_db)):
    decoded_url = unquote(website_url)
    
    thread = db.query(Thread).filter(Thread.website_url == decoded_url).first()
    if thread:
        print(f"Thread found: {thread.id}")
        print(f"Website link found: {thread.website_url}")
        return {"topics": thread.topics, "questions": thread.questions, "article_id": thread.id}
    
    return {"website_url": decoded_url, "message": "Discussion not found probably due to link"}

class TopicUpdateRequest(BaseModel):
    topic: str

@router.put("/{website_url:path}")
async def update_topics_by_url(website_url: str, request: TopicUpdateRequest, db: Session = Depends(get_db)):
    print("Received URL:", website_url)
    print("Received topic:", request.topic)
    
    thread = db.query(Thread).filter(Thread.website_url == website_url).first()
    if thread:
        if thread.topics:
            updated_topics = thread.topics + [request.topic]
        else:
            updated_topics = [request.topic]
        thread.topics = updated_topics
        db.commit()
        return {"message": "Topic updated successfully", "topics": thread.topics}

    raise HTTPException(status_code=404, detail="Thread not found")