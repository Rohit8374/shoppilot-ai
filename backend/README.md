# ShopPilot AI — Backend

FastAPI backend powering the ShopPilot AI agentic commerce assistant.

## Quick Start

```bash
# 1. Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Set LLM_API_KEY in .env

# 4. Run the server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/analyze-intent` | Analyze shopping intent |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc API docs |

## Architecture

```
app/
├── main.py          # FastAPI app factory + CORS + lifespan
├── config.py        # Settings from env vars (pydantic-settings)
├── agents/
│   └── intent_agent.py    # Intent Agent (LLM-powered)
├── api/
│   └── routes.py          # REST route handlers
├── models/
│   └── intent.py          # Pydantic request/response models
└── services/
    └── llm_service.py     # LLM abstraction (Gemini / OpenAI / Anthropic)
```

## Changing LLM Provider

Set these in `.env`:

```env
LLM_PROVIDER=gemini       # or: openai, anthropic
LLM_MODEL=gemini-2.0-flash
LLM_API_KEY=your_key_here
```

No code changes needed — the factory in `llm_service.py` handles the switch.
