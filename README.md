# MixOS

DJ setlist builder with AI generation and manual tools. Describe a vibe, get a full setlist back with BPM/key/energy data, then tweak it or mix in your own tracks. Everything lives in one persistent setlist you can access from anywhere in the app.

## What it does

**AI side** -- Type something like "peak time techno 2 hours" and it generates a full setlist with real track suggestions, Camelot keys, BPM, energy levels, and transition notes. You can refine it with follow-up prompts ("make it darker", "swap out track 5") and browse version history to go back to earlier iterations. It also pulls in iTunes previews automatically so you can actually listen to the suggestions.

**Manual side** -- Upload your own MP3/WAV/FLAC files or search iTunes. Uploaded tracks get analyzed with Essentia for BPM, key (Camelot), and energy. iTunes results come with 30-second previews you can play in the browser.

**The setlist** -- There's a floating button on every page that opens a slide-out panel with your current setlist. You can add tracks from AI results (one at a time or the whole template), from manual uploads, or from search -- they all end up in the same place. It saves to localStorage so it survives page refreshes.

## Setup

You'll need Node 18+, Python 3.10+, FFmpeg, and an Anthropic API key.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# put your Anthropic key in .env
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## How to use it

1. On the landing page, type a description and hit generate
2. Listen to the previews as they load in, add individual tracks with "+" or grab the whole setlist with "Use This Setlist Template"
3. Refine with the text bar at the bottom -- it keeps version history so you can go back
4. Switch to Manual Build to upload your own files or search for songs
5. The floating button in the bottom-right shows your setlist from any page

## Project structure

```
mixos/
├── frontend/                    React + TypeScript + Vite
│   └── src/
│       ├── App.tsx              Global layout, setlist button/panel
│       ├── components/
│       │   ├── LandingPage.tsx  AI prompt + manual build entry
│       │   ├── AIResults.tsx    Generated setlist, refinement, previews
│       │   ├── ManualBuilder.tsx File upload + song search
│       │   └── SetlistPanel.tsx Slide-out setlist panel
│       ├── services/api.ts     API client
│       ├── store/setlistStore.ts Zustand + localStorage persistence
│       ├── types/index.ts
│       └── utils/
│           ├── format.ts       Duration/BPM formatting
│           └── convertAITrack.ts AI track conversion
│
├── backend/                     Python + FastAPI
│   ├── app/
│   │   ├── main.py             App entry, CORS, routing
│   │   ├── routers/
│   │   │   ├── ai.py           Generation + refinement endpoints
│   │   │   ├── itunes.py       iTunes search + analysis
│   │   │   └── tracks.py       Upload, library, audio streaming
│   │   ├── services/
│   │   │   ├── ai_service.py   Claude API + prompt engineering
│   │   │   ├── itunes_service.py iTunes + Essentia analysis
│   │   │   └── audio_service.py Local file analysis + metadata
│   │   └── models/
│   │       ├── schemas.py      Track model
│   │       └── ai_schemas.py   AI request/response models
│   ├── uploads/                Audio files (gitignored)
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

## API

| Endpoint | Method | What it does |
|----------|--------|--------------|
| `/api/ai/generate-setlist` | POST | Generate setlist from a text prompt |
| `/api/ai/refine-setlist` | POST | Refine existing setlist with feedback |
| `/api/itunes/search?q=` | GET | Search iTunes |
| `/api/itunes/analyze` | POST | Analyze a track preview (BPM/key/energy) |
| `/api/tracks/upload` | POST | Upload + analyze a local audio file |
| `/api/tracks/library` | GET | List uploaded tracks |
| `/api/tracks/{id}/audio` | GET | Stream audio |
| `/api/tracks/{id}` | DELETE | Delete a track |
| `/api/health` | GET | Health check |
| `/docs` | GET | Swagger docs |

## Tech

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Lucide icons

**Backend:** Python 3.10+, FastAPI, Uvicorn, Anthropic Claude API, Essentia (audio analysis), Mutagen (metadata), NumPy, iTunes Search API

## Troubleshooting

- **Backend won't start** -- check your API key in `backend/.env`, make sure port 8000 is free, make sure FFmpeg is installed
- **AI generation fails** -- check the backend terminal for errors, make sure your Anthropic key is valid
- **Audio analysis not working** -- need Essentia (`pip install essentia`) and FFmpeg for MP3/M4A
- **Setlist gone after refresh** -- it's in localStorage, clearing browser data resets it
