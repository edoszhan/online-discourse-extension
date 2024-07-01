from fastapi import FastAPI
from .routes import logs  # Import the logs route module
from .utils.database import engine, Base
import logging

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(logs.router)  # Include the logs router

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
