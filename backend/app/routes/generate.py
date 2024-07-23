from fastapi import APIRouter, Depends
from pydantic import BaseModel
from .open_ai import generate_topics_and_questions
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.models import Thread
from app.schemas import ThreadCreate

router = APIRouter()

class ArticleText(BaseModel):
    text: str
    url: str

class GenerateResponse(BaseModel):
    topics: list
    questions: list

@router.post("/generate-topics", response_model=GenerateResponse)
async def generate_topics_endpoint(article: ArticleText, db: Session = Depends(get_db)):
    extracted_text = article.text
    website_url = article.url

    existing_thread = db.query(Thread).filter(Thread.website_url.startswith(website_url)).first()
    if existing_thread:
        print("Found existing thread")
        return GenerateResponse(topics=existing_thread.topics, questions=existing_thread.questions)

    topics, questions = generate_topics_and_questions(extracted_text)

    # Store the generated topics and questions in the threads table
    new_thread = ThreadCreate(website_url=website_url, topics=topics, questions=questions)
    db_thread = Thread(**new_thread.model_dump())
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)

    return GenerateResponse(topics=topics, questions=questions)
