# ParkWise Frontend

Next.js 15 command-center frontend for **ParkWise: AI-Powered Parking Intelligence System**.

This app consumes the existing FastAPI backend and presents parking enforcement analytics for Bengaluru traffic authorities. It does not modify or depend on any frontend code inside the backend.

## Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn-style local UI primitives
- TanStack React Query
- React Leaflet
- Recharts
- Lucide React

## Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Set the backend URL:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the backend first from `../backend`, then run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## API Usage

The frontend includes reusable wrappers for:

- `GET /health`
- `GET /api/summary`
- `GET /api/hotspots`
- `GET /api/emerging`
- `GET /api/planner`
- `GET /api/simulator`
- `GET /api/debug/weights`
- `GET /api/debug/confidence-distribution`
- `GET /api/debug/emerging-stats`
- `GET /api/dashboard`

React Query hooks provide loading, error, cache, and refetch behavior.

## Dashboard Sections

- Hero enforcement impact metric from `GET /api/simulator?wardens=20`
- KPI cards from summary data
- Interactive Bengaluru hotspot map
- Hotspot intelligence panel with TII breakdown
- Data Quality Engine confidence distribution
- Emerging hotspot alert panel
- Real-time warden simulator
- Deployment planner
- Top priority hotspot table with map selection
- AI Recommendation placeholder ready for future Groq integration
