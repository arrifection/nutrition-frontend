# Health Application

A full-stack health/nutrition application with a React frontend and FastAPI backend.

## Project Structure

```
├── Frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── Backend/           # FastAPI backend
│   ├── app.py         # Main entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...routers & modules
│
└── .gitignore
```

## Getting Started

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn app:app --reload
```

## Deployment

- **Frontend**: Deploy via Vercel (set root directory to `Frontend`)
- **Backend**: Deploy via Hugging Face Spaces (Docker)
