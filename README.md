# MixOS - Professional DJ Setlist Builder

A modern, AI-powered DJ setlist management application with audio analysis, song search, and professional mixing tools.

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

## Phase 2 Features (Complete)

- **Manual setlist builder** — upload local files or search songs to build setlists by hand
- **Local audio file upload** — drag-and-drop or file picker for MP3, WAV, FLAC
- **Audio analysis with Essentia** — professional-grade BPM, key (Camelot), and energy detection
  - RhythmExtractor2013 multi-feature BPM detection with octave correction
  - KeyExtractor with HPCP for accurate key detection in Camelot notation
  - Energy analysis mapped to 1–10 scale
- **iTunes/Apple Music search** — free song search with 30-second preview playback
  - Preview clips analyzed with Essentia for BPM/key/energy
  - In-browser audio playback for previews and local files
- **Spotify search** — search the Spotify catalog (optional, requires credentials)
  - Spotify lookup for uploaded local files to match metadata
- **Smart metadata extraction** — reads ID3/Vorbis/FLAC tags via Mutagen, falls back to filename parsing
- **Interactive setlist panel** — slide-in panel with drag-to-add tracks, aggregate metrics (duration, avg BPM, avg energy)

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- FFmpeg (`brew install ffmpeg` on macOS)
- Anthropic API key (for AI generation)
- Spotify Developer Account (optional, for Spotify search)

## Quick Start

### 1. Get API Credentials

**Anthropic (required):**
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an API key

**Spotify (optional):**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app and copy your **Client ID** and **Client Secret**

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# ANTHROPIC_API_KEY=your_anthropic_key
# SPOTIFY_CLIENT_ID=your_client_id       (optional)
# SPOTIFY_CLIENT_SECRET=your_client_secret (optional)

# Run the backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
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
2. **AI Generate** — Describe the vibe you want, pick a duration, and generate a full setlist with transition guides
3. **Refine** — Use the bottom bar on the results page to tweak the setlist with follow-up instructions
4. **Version History** — Click the version badge to browse and revert to previous versions
5. **Manual Build** — Upload local audio files or search songs to build a setlist by hand
   - Import MP3/WAV/FLAC files for automatic BPM, key, and energy analysis
   - Search songs via iTunes/Apple Music with 30-second preview playback
   - Add tracks to your setlist with the + button

## Project Structure

```
mixos/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx      # Home page with AI generator + manual build
│   │   │   ├── AIResults.tsx        # Generated setlist display, refinement, version history
│   │   │   ├── ManualBuilder.tsx    # Manual setlist builder with upload + search
│   │   │   ├── Dashboard.tsx        # Overview dashboard
│   │   │   ├── TrackSearch.tsx      # Track search
│   │   │   └── TrackCard.tsx        # Track display card
│   │   ├── services/api.ts         # Backend API calls
│   │   ├── store/                   # Zustand state management
│   │   ├── types/                   # TypeScript types
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── ai.py               # AI generation + refinement endpoints
│   │   │   ├── spotify.py          # Spotify search endpoints
│   │   │   ├── itunes.py           # iTunes/Apple Music search + analysis
│   │   │   └── tracks.py           # Local file upload, library, audio streaming
│   │   ├── services/
│   │   │   ├── ai_service.py       # Claude API integration, prompt building
│   │   │   ├── spotify_service.py  # Spotify API client
│   │   │   ├── itunes_service.py   # iTunes search + Essentia preview analysis
│   │   │   └── audio_service.py    # Local file analysis + metadata extraction
│   │   ├── models/
│   │   │   ├── ai_schemas.py       # AI request/response models
│   │   │   └── schemas.py          # Track, Setlist, and shared data models
│   │   └── main.py                 # FastAPI app
│   ├── uploads/                     # Uploaded audio files (git-ignored)
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
| `/api/spotify/track/{id}` | GET | Get Spotify track details |
| `/api/itunes/search?q={query}` | GET | Search iTunes/Apple Music |
| `/api/itunes/analyze` | POST | Analyze track preview for BPM/key/energy |
| `/api/tracks/upload` | POST | Upload and analyze a local audio file |
| `/api/tracks/library` | GET | List all uploaded tracks |
| `/api/tracks/{id}/audio` | GET | Stream uploaded audio file |
| `/api/tracks/{id}` | DELETE | Remove track from library |
| `/api/ai/generate-setlist` | POST | Generate AI setlist from natural language |
| `/api/ai/refine-setlist` | POST | Refine an existing setlist with follow-up |
| `/docs` | GET | Interactive API documentation (Swagger UI) |

## Tech Stack

**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS
- Zustand for state management
- Lucide React icons
- HTML5 Audio API for playback

**Backend:**
- Python 3.10+, FastAPI, Uvicorn
- Anthropic Claude API (AI setlist generation)
- Essentia (professional audio analysis — BPM, key, energy)
- Spotipy (Spotify integration)
- Mutagen (audio metadata / ID3 tag reading)
- Pydub + FFmpeg (audio format handling)
- Pydantic for data validation
- iTunes Search API (free, no auth required)

## Roadmap

Phases 1–2 deliver AI generation and manual building. Upcoming:
- **Phase 3**: Drag-and-drop reordering, BPM transition visualization
- **Phase 4**: Camelot wheel harmonic mixing recommendations
- **Phase 5**: Export/import, sharing, and templates
- **Phase 6**: Mobile support and cloud sync

## Troubleshooting

**Backend won't start:**
- Make sure you've added credentials to `backend/.env`
- Check that port 8000 is not in use
- Ensure FFmpeg is installed (`brew install ffmpeg`)

**AI generation fails:**
- Verify your Anthropic API key is set in `.env`
- Check the backend console for error details

**Audio analysis issues:**
- Ensure Essentia is installed (`pip install essentia`)
- Ensure FFmpeg is installed for MP3/M4A support
- Python 3.10+ is required (Essentia supports 3.10–3.13)

**Song search returns no results:**
- iTunes search requires no credentials and should work out of the box
- For Spotify search, verify credentials are correct and restart the server

**Frontend can't connect:**
- Ensure the backend is running on port 8000
- Check browser console for errors

## License

This is a personal project for portfolio development.

---

**Built for DJs, by DJs**
