from fastapi import FastAPI
from .routes import logs  
from .utils.database import engine, Base
import logging
from app.routes import comments
from fastapi.middleware.cors import CORSMiddleware
from app.routes import generate
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create the database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(logs.router)  
app.include_router(comments.router, prefix="/api")
app.include_router(generate.router)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/log")
async def log_event(log: dict):
    logger.info(f"Received log: {log}")
    return {"message": "Log received"}

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
