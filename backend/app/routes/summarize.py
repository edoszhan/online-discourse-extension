from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .open_ai_2 import generate_summary

router = APIRouter()

class SummarizeRequest(BaseModel):
    comments: str

class SummarizeResponse(BaseModel):
    summary: str

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_comments(request: SummarizeRequest):
    try:
        summary = generate_summary(request.comments)
        return SummarizeResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))