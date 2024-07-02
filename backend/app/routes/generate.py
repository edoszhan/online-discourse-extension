from fastapi import APIRouter
from pydantic import BaseModel
from .open_ai import generate_topics
router = APIRouter()

class ArticleText(BaseModel):
    text: str

@router.post("/generate-topics")
async def generate_topics_endpoint(article: ArticleText):
    extracted_text = article.text
    print("Received extracted text:", extracted_text)

    generated_topics = generate_topics(extracted_text)

    return {"topics": generated_topics}