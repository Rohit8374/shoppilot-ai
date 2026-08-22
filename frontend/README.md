# ShopPilot AI — Frontend

React + TypeScript + Vite + Tailwind CSS frontend for ShopPilot AI.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env
cp .env.example .env

# Start dev server
npm run dev
```

Opens at: `http://localhost:5173`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## Structure

```
src/
├── components/
│   ├── Header.tsx          # Top navigation + API status
│   ├── SearchInput.tsx     # Auto-resize query textarea
│   ├── ExamplePrompts.tsx  # Clickable example chips
│   ├── IntentResultCard.tsx # Structured result display
│   ├── LoadingSpinner.tsx  # Animated loading state
│   └── ErrorMessage.tsx   # Error banner + retry
├── pages/
│   └── HomePage.tsx        # Main landing page
├── services/
│   └── api.ts              # Typed fetch wrappers
├── types/
│   └── index.ts            # TypeScript interfaces
└── App.tsx
```

## Build for Production

```bash
npm run build
```

Output in `dist/`.
