# MixOS - Professional DJ Setlist Builder

A modern, AI-powered DJ setlist management application with Spotify integration and professional mixing tools.

## 🎯 Phase 1 Features

- ✅ React + TypeScript frontend with Tailwind CSS
- ✅ FastAPI backend with Spotify integration
- ✅ Search tracks via Spotify API
- ✅ Display track information (title, artist, album, BPM, key)
- ✅ Camelot wheel key notation
- ✅ Energy level analysis
- ✅ Local storage for setlists
- ✅ Beautiful gradient UI with dark theme

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Spotify Developer Account (free)

## 🚀 Quick Start

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the details:
   - App name: "MixOS"
   - App description: "DJ Setlist management tool"
   - Redirect URI: `http://localhost:8000`
5. Click "Create"
6. Copy your **Client ID** and **Client Secret**

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt --break-system-packages

# Create .env file
cp .env.example .env

# Edit .env and add your Spotify credentials
# SPOTIFY_CLIENT_ID=your_client_id_here
# SPOTIFY_CLIENT_SECRET=your_client_secret_here

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

## 🎨 Usage

1. Open `http://localhost:3000` in your browser
2. Click "Search Tracks" in the navigation
3. Search for any track, artist, or album
4. View track details including BPM, key (Camelot notation), and energy level

## 📁 Project Structure

```
mixos/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routers/         # API routes
│   │   ├── services/        # Business logic
│   │   ├── models/          # Pydantic models
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `GET /api/spotify/search?q={query}` - Search tracks
- `GET /api/spotify/track/{id}` - Get track details with audio features
- `GET /docs` - Interactive API documentation (Swagger UI)

## 🎵 Features

### Track Analysis
- **BPM Detection**: Automatic tempo detection from Spotify
- **Camelot Key**: Musical key in Camelot notation (8A, 5B, etc.)
- **Energy Level**: 1-10 scale for set flow planning
- **Audio Features**: Danceability, valence, acousticness, and more

### User Interface
- Modern gradient design optimized for dark environments
- Responsive layout
- Real-time search
- Album artwork display
- Clean, professional aesthetic

## 🚧 Coming Next - Phase 2

- Drag-and-drop setlist builder
- Manual track arrangement
- Save/load setlists
- Track compatibility indicators
- BPM transition analysis
- Energy flow visualization

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure you've added Spotify credentials to `.env`
- Check that port 8000 is not in use
- Verify Python dependencies are installed

**Frontend can't connect:**
- Ensure backend is running on port 8000
- Check browser console for errors
- Clear browser cache

**No search results:**
- Verify Spotify credentials are correct
- Check API rate limits
- Ensure you have internet connection

## 📝 Development Notes

- Search results limited to 20 tracks (configurable)
- Keys automatically converted to Camelot notation
- BPM rounded to nearest integer
- Energy converted from 0-1 to 1-10 scale
- All data stored in browser localStorage

## 🎓 Tech Stack

**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS for styling
- Zustand for state management
- React Query for data fetching

**Backend:**
- FastAPI (Python)
- Spotipy for Spotify integration
- Pydantic for data validation
- Uvicorn ASGI server

## 🎉 What's Next

Phase 1 establishes the foundation. In upcoming phases:
- **Phase 2**: Drag-and-drop setlist builder
- **Phase 3**: Audio analysis for local files
- **Phase 4**: Camelot wheel and harmonic mixing
- **Phase 5**: AI-powered playlist generation with Claude
- **Phase 6**: Polish, export/import, waveforms
- **Phase 7**: Advanced features and templates
- **Phase 8**: Mobile app and cloud sync

## 📄 License

This is a personal project for portfolio development.

## 🙋 Support

For detailed setup instructions, see `SETUP-GUIDE.md`

---

**Built with ❤️ for DJs by DJs**
