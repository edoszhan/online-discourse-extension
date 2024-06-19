from fastapi import FastAPI
from .routes import logs  # Import the logs route module
from .utils.database import engine, Base

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(logs.router)  # Include the logs router

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
