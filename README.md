# MixOS - Professional DJ Setlist Builder

A modern, AI-powered DJ setlist management application with Spotify integration and professional mixing tools.

## Phase 1 Features (Complete)

- React + TypeScript frontend with Tailwind CSS
- FastAPI backend with Spotify integration
- Search tracks via Spotify API
- Display track information (title, artist, album, BPM, key)
- Camelot wheel key notation
- Energy level analysis
- Local storage for setlists
- Dark theme UI with purple/red/blue accent gradients
- **AI-powered setlist generation** using Claude API
  - Natural language input ("peak time techno", "sunset deep house", etc.)
  - Dynamic track count based on set duration and context
  - Configurable set duration (30 min to 3 hrs)
  - BPM, key (Camelot), and energy data for every track
  - Transition guide with mixing notes
- **AI setlist refinement** — refine generated setlists with follow-up prompts
  - Slide animation when setlist updates
  - Version history with ability to revert to any previous version

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Spotify Developer Account (free)
- Anthropic API key (for AI generation)

## Quick Start

### 1. Get API Credentials

**Spotify:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app and copy your **Client ID** and **Client Secret**

**Anthropic:**
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an API key

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# SPOTIFY_CLIENT_ID=your_client_id
# SPOTIFY_CLIENT_SECRET=your_client_secret
# ANTHROPIC_API_KEY=your_anthropic_key

# Run the backend
python -m app.main
```

The backend will start at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will start at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000`
2. **AI Generate** — Describe the vibe you want, pick a duration, and generate a full setlist
3. **Refine** — Use the bottom bar on the results page to tweak the setlist with follow-up instructions
4. **Version History** — Click the version badge to browse and revert to previous versions
5. **Search Tracks** — Search Spotify for individual tracks with BPM, key, and energy data

## Project Structure

```
mixos/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx    # Home page with AI generator + manual build
│   │   │   ├── AIResults.tsx      # Generated setlist display, refinement, version history
│   │   │   ├── Dashboard.tsx      # Overview dashboard
│   │   │   ├── TrackSearch.tsx    # Spotify search
│   │   │   └── TrackCard.tsx      # Track display card
│   │   ├── services/api.ts       # Backend API calls
│   │   ├── store/                 # Zustand state management
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── ai.py             # AI generation + refinement endpoints
│   │   │   └── spotify.py        # Spotify search endpoints
│   │   ├── services/
│   │   │   ├── ai_service.py     # Claude API integration, prompt building
│   │   │   └── spotify_service.py
│   │   ├── models/
│   │   │   ├── ai_schemas.py     # AI request/response models
│   │   │   └── schemas.py        # Spotify data models
│   │   └── main.py               # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/spotify/search?q={query}` | GET | Search Spotify tracks |
| `/api/spotify/track/{id}` | GET | Get track details with audio features |
| `/api/ai/generate-setlist` | POST | Generate AI setlist from natural language query |
| `/api/ai/refine-setlist` | POST | Refine an existing setlist with follow-up instructions |
| `/docs` | GET | Interactive API documentation (Swagger UI) |

## Tech Stack

**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS
- Zustand for state management

**Backend:**
- FastAPI (Python)
- Anthropic Claude API (AI generation)
- Spotipy (Spotify integration)
- Pydantic for data validation
- Uvicorn ASGI server

## Roadmap

Phase 1 delivers the AI-powered generation core. Upcoming phases:
- **Phase 2**: Drag-and-drop manual setlist builder
- **Phase 3**: Audio analysis and BPM transition visualization
- **Phase 4**: Camelot wheel harmonic mixing tools
- **Phase 5**: Export/import, sharing, and templates
- **Phase 6**: Mobile support and cloud sync

## Troubleshooting

**Backend won't start:**
- Make sure you've added credentials to `backend/.env`
- Check that port 8000 is not in use

**AI generation fails:**
- Verify your Anthropic API key is set in `.env`
- Check the backend console for error details
- Restart the backend after making changes

**Frontend can't connect:**
- Ensure the backend is running on port 8000
- Check browser console for errors

**No Spotify search results:**
- Verify Spotify credentials are correct
- Check API rate limits

## License

This is a personal project for portfolio development.

---

**Built for DJs, by DJs**
