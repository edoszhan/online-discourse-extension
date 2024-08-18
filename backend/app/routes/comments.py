from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session, attributes
from typing import List
from app.utils.database import get_db
from app.models import Comment
from app.schemas import CommentCreate, CommentResponse, CommentUpdate
from app.models import Thread, Comment, Review, Topic
from app.schemas import ThreadCreate, ThreadResponse, CommentCreate, CommentResponse, ReviewCreate, ReviewResponse, ReviewUpdate
from datetime import datetime
from urllib.parse import urlparse, unquote
from pydantic import BaseModel

router = APIRouter()

@router.get("/articles/{article_id}/comments/{thread_id}", response_model=List[CommentResponse])
async def read_comments(article_id: int, thread_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.article_id == article_id, Comment.thread_id == thread_id).order_by(Comment.id).all()
    return comments

@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(comment_id: int, comment_update: CommentUpdate, db: Session = Depends(get_db)):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment_update.text is not None:
        db_comment.text = comment_update.text
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(db_comment)
    db.commit()
    return {"message": "Comment deleted successfully"}


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
    
    for comment_dict in review.new_order_dicts:
        comment_dict['timestamp'] = comment_dict['timestamp'].isoformat()
    
    try:
        db_review = Review(
            article_id=article_id,
            thread_id=thread_id,
            prev_order=review.prevOrder,
            new_order=review.newOrder,
            source_id=review.sourceId,
            destination_id=review.destinationId,
            pending_review=review.pendingReview,
            accepted_by=review.acceptedBy,
            denied_by=review.deniedBy,
            author=review.author,
            timestamp=datetime.now()
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

    if updated_review.acceptedBy is not None:
        review.accepted_by = updated_review.acceptedBy
    if updated_review.deniedBy is not None:
        review.denied_by = updated_review.deniedBy
    if updated_review.summary is not None:
        review.summary = updated_review.summary

    if len(review.accepted_by) >= 3:
        review.pending_review = False
    elif len(review.denied_by) >= 3:
        review.pending_review = True
    else:
        review.pending_review = None

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
        return {
            "exists": True,
            "topics": thread.topics,
            "questions": thread.questions,
            "article_id": thread.id,
            "extracted_text": thread.extracted_text,
            "suggested_topic_question": thread.suggested_topic_question
        }
    
    return {"exists": False,"website_url": decoded_url, "message": "Discussion not found probably due to link"}

class TopicUpdateRequest(BaseModel):
    topic: str

@router.put("/website_check/{website_url:path}")
async def update_topics_by_url(website_url: str, request: TopicUpdateRequest, db: Session = Depends(get_db)):
    decoded_url = unquote(website_url)
    
    thread = db.query(Thread).filter(Thread.website_url == decoded_url).first()
    if thread:
        if thread.topics:
            updated_topics = thread.topics + [request.topic]
        else:
            updated_topics = [request.topic]
        thread.topics = updated_topics
        db.commit()
        return {"message": "Topic updated successfully", "topics": thread.topics}

    raise HTTPException(status_code=404, detail="Thread not found")


class TopicCreate(BaseModel):
    author: str
    suggested_topic: str
    suggested_question: str

class TopicUpdate(BaseModel):
    acceptedBy: List[str] = []
    deniedBy: List[str] = []
    
    
@router.get("/topics/{article_id}")
async def get_topics(article_id: int, current_user_id: str, db: Session = Depends(get_db)):
    topics = db.query(Topic).filter(Topic.article_id == article_id, Topic.author != current_user_id).all()
    return topics

@router.get("/topicsAll/{article_id}")
async def get_topics(article_id: int, db: Session = Depends(get_db)):
    topics = db.query(Topic).filter(Topic.article_id == article_id).all()
    return topics

@router.post("/topics/{article_id}")
async def create_topic(article_id: int, topic: TopicCreate, db: Session = Depends(get_db)):
    new_topic = Topic(
        article_id=article_id,
        author=topic.author,
        suggested_topic=topic.suggested_topic,
        suggested_question=topic.suggested_question,
        timestamp=datetime.now(),
        acceptedBy=[topic.author],
        deniedBy=[],
        final_status="pending"
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.put("/topics/{article_id}/{topic_id}")
async def update_topic(article_id: int, topic_id: int, topic_update: TopicUpdate, db: Session = Depends(get_db)):
    db_topic = db.query(Topic).filter(Topic.id == topic_id, Topic.article_id == article_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    if topic_update.acceptedBy and topic_update.acceptedBy[0] not in db_topic.acceptedBy + db_topic.deniedBy:
        db_topic.acceptedBy = db_topic.acceptedBy + topic_update.acceptedBy
    elif topic_update.deniedBy and topic_update.deniedBy[0] not in db_topic.acceptedBy + db_topic.deniedBy:
        db_topic.deniedBy = db_topic.deniedBy + topic_update.deniedBy

    if len(db_topic.acceptedBy) >= 3:
        db_topic.final_status = "accepted"
        thread = db.query(Thread).filter(Thread.id == article_id).first()
        if thread:
            if db_topic.suggested_topic not in thread.topics:
                thread.topics = thread.topics + [db_topic.suggested_topic]
                attributes.flag_modified(thread, "topics")
            if db_topic.suggested_question not in thread.questions:
                thread.questions = thread.questions + [db_topic.suggested_question]
                attributes.flag_modified(thread, "questions")
    elif len(db_topic.deniedBy) >= 3:
        db_topic.final_status = "denied"
    else: 
        db_topic.final_status = "pending"

    db.commit()
    db.refresh(db_topic)
    return db_topic