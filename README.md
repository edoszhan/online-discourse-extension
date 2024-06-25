# Project Setup
This project consists of a backend and a frontend. Follow the instructions below to set up and run both components.

# Backend Setup
1. Navigate to the Backend Directory:
```bash
cd backend
```
2. Activate the Virtual Environment
```bash
source venv/bin/activate
```
3. Start the backend server:
```bash
uvicorn app.main:app --reload
```

# Frontend Setup
1. Navigate to the Frontend Directory:
```bash
cd frontend
```
2. Install Dependencies:
```bash
npm install
```
3. Run the Frontend in Development Mode:
```bash
npm run dev
```
or 

3. Build the Extension
```bash
npm run build
```
This will create the dist folder containing the built files for the Chrome extension.
