# ShopPilot AI 🛍️

> An **AI-powered agentic commerce assistant** that understands your shopping requirements and finds the perfect product for you.

ShopPilot AI uses a multi-agent architecture to handle the full shopping journey — from understanding your natural-language query to delivering a personalized product recommendation.

---

## Architecture

```
User Query
    │
    ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Intent Agent│────▶│ Search Agent │────▶│Recommendation    │
│ (Phase 1 ✅)│     │ (Phase 2)    │     │Agent (Phase 2)   │
└─────────────┘     └──────────────┘     └──────────────────┘
                                                  │
                          ┌───────────────────────┘
                          ▼
               ┌──────────────────┐     ┌──────────────────┐
               │  Budget Agent    │────▶│ Decision Agent   │
               │  (Phase 2)       │     │ (Phase 2)        │
               └──────────────────┘     └──────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 3 |
| Backend | Python, FastAPI, Pydantic v2, Uvicorn |
| AI | Google Gemini (via `google-generativeai`) |
| Database | Supabase / PostgreSQL (Phase 2) |

---

## Folder Structure

```
shoppilot-ai/
├── frontend/             # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── services/     # API client
│   │   ├── types/        # TypeScript interfaces
│   │   └── App.tsx
│   └── package.json
│
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── agents/       # AI Agents (intent_agent.py)
│   │   ├── api/          # REST API routes
│   │   ├── models/       # Pydantic schemas
│   │   ├── services/     # LLM service abstraction
│   │   ├── config.py     # Settings (env-based)
│   │   └── main.py       # FastAPI app factory
│   └── requirements.txt
│
├── data/
│   └── products.json     # Sample product dataset (demo only)
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Google Gemini API key (get one at [aistudio.google.com](https://aistudio.google.com))

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and add your keys
cp .env.example .env
# Edit .env: set LLM_API_KEY=your_gemini_key_here
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Edit .env if your backend runs on a different port
```

---

## Running the Application

### Run Backend

```bash
cd backend
.\venv\Scripts\activate   # Windows
uvicorn app.main:app --reload --port 8000
```

Backend starts at: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### Run Frontend

```bash
cd frontend
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `LLM_PROVIDER` | LLM provider name | `gemini` |
| `LLM_MODEL` | Model to use | `gemini-2.0-flash` |
| `LLM_API_KEY` | Your API key | `AIza...` |
| `SUPABASE_URL` | Supabase project URL (Phase 2) | `https://...supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key (Phase 2) | `eyJ...` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL | `http://localhost:8000` |

---

## API Examples

### Health Check

```bash
curl http://localhost:8000/api/health
```

```json
{ "status": "ok", "app": "ShopPilot AI", "version": "0.1.0" }
```

### Analyze Intent

```bash
curl -X POST http://localhost:8000/api/analyze-intent \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a gaming phone under ₹25000 with a powerful processor and good camera"}'
```

```json
{
  "category": "smartphone",
  "budget": { "currency": "INR", "minimum": null, "maximum": 25000 },
  "preferences": ["gaming", "powerful processor", "good camera"],
  "must_have": [],
  "nice_to_have": [],
  "raw_query": "I need a gaming phone under ₹25000 with a powerful processor and good camera"
}
```

---

## Current Features (Phase 1)

- ✅ Intent Agent — converts natural-language queries to structured JSON
- ✅ REST API (`GET /api/health`, `POST /api/analyze-intent`)
- ✅ LLM service abstraction (swap providers via env var)
- ✅ Pydantic v2 validation throughout
- ✅ React/TypeScript/Vite frontend with Tailwind CSS
- ✅ Polished SaaS UI with loading/error states
- ✅ Sample product dataset (15 products, demo only)

---

## Planned Agent Architecture (Phase 2+)

| Agent | Responsibility |
|---|---|
| **Intent Agent** ✅ | Understands natural-language query |
| **Product Search Agent** | Queries product catalog & filters |
| **Recommendation Agent** | Compares and ranks products |
| **Budget Agent** | Validates value-for-money |
| **Decision Agent** | Produces final recommendation + explanation |

---

## Disclaimer

> Product data in `data/products.json` is **sample/demo data only**.  
> Prices are illustrative and do not reflect live market prices.  
> No web scraping is performed.
