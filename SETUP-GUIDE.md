# 🎧 MixOS - Phase 1 Complete Setup Guide

## 📦 What You Have

Phase 1 of your MixOS is complete! Here's what's included:

### Frontend (React + TypeScript)
- ✅ Beautiful dashboard with gradient UI
- ✅ Spotify track search
- ✅ Track display cards with album art, BPM, key
- ✅ Zustand state management
- ✅ Local storage for setlists
- ✅ Responsive design

### Backend (FastAPI + Python)
- ✅ Spotify API integration
- ✅ Track search endpoint
- ✅ Audio features (BPM, key, energy)
- ✅ Camelot wheel key notation
- ✅ CORS enabled
- ✅ Interactive API docs

## 🚀 Getting Started

### Step 1: Get Spotify API Credentials (5 minutes)

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account (create one if needed - it's free!)
3. Click **"Create App"**
4. Fill in:
   - **App name:** MixOS
   - **App description:** Setlist management tool
   - **Redirect URI:** http://localhost:8000
   - Check the box agreeing to terms
5. Click **"Save"**
6. On your app page, click **"Settings"**
7. Copy your **Client ID**
8. Click **"View client secret"** and copy it

### Step 2: Setup Backend (5 minutes)

```bash
# Navigate to backend folder
cd mixos/backend

# Install Python dependencies
pip install -r requirements.txt --break-system-packages

# Create .env file from template
cp .env.example .env

# Edit .env file and add your credentials:
# Replace 'your_client_id_here' with your actual Client ID
# Replace 'your_client_secret_here' with your actual Client Secret

# Start the backend
python -m app.main
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Setup Frontend (5 minutes)

Open a NEW terminal window:

```bash
# Navigate to frontend folder
cd mixos/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

### Step 4: Test It Out! 🎉

1. Open your browser to **http://localhost:3000**
2. Click **"Search Tracks"** in the navigation
3. Try searching for:
   - "Daft Punk"
   - "house music"
   - "techno 2024"
4. See the tracks with BPM, key, and energy info!

## 🎨 What You Can Do Now

### Dashboard View
- See your saved setlists (empty for now)
- View stats (total setlists, tracks, duration)
- Quick action cards for future features

### Search View
- Search Spotify's entire catalog
- View track information:
  - Title, artist, album
  - Album artwork
  - Duration
  - BPM (beats per minute)
  - Key in Camelot notation (e.g., 8A, 5B)
  - Energy level (1-10 scale)

## 🔧 Technical Details

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (super fast!)
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching

### Backend Stack
- **FastAPI** - Python web framework
- **Spotipy** - Spotify API wrapper
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Key Features Implemented

#### Camelot Wheel Integration
The backend automatically converts Spotify's musical key data to Camelot notation:
- Major keys → B (e.g., 8B, 5B)
- Minor keys → A (e.g., 8A, 5A)
- Used for harmonic mixing (Phase 4)

#### Audio Analysis
Every track includes:
- **BPM**: Extracted from Spotify's audio analysis
- **Energy**: 1-10 scale based on Spotify's energy metric
- **Key**: Camelot notation for easy mixing

## 📁 Project Structure

```
mixos/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── TrackSearch.tsx     # Search interface
│   │   │   └── TrackCard.tsx       # Track display
│   │   ├── store/
│   │   │   └── setlistStore.ts     # State management
│   │   ├── services/
│   │   │   └── api.ts              # Backend API calls
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript types
│   │   ├── utils/
│   │   │   └── format.ts           # Helper functions
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   └── spotify.py          # Spotify endpoints
│   │   ├── services/
│   │   │   └── spotify_service.py  # Spotify logic
│   │   ├── models/
│   │   │   └── schemas.py          # Data models
│   │   └── main.py                 # FastAPI app
│   ├── requirements.txt
│   ├── .env.example
│   └── start.sh
│
└── README.md
```

## 🌐 API Endpoints

Once backend is running, visit http://localhost:8000/docs for interactive API documentation!

Available endpoints:
- `GET /api/health` - Check if API is running
- `GET /api/spotify/search?q={query}` - Search tracks
- `GET /api/spotify/track/{id}` - Get detailed track info

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'app'"
**Solution:** Make sure you're running from the `backend` directory:
```bash
cd backend
python -m app.main
```

### "Spotify credentials not found"
**Solution:** 
1. Make sure `.env` file exists in `backend/` folder
2. Check that you replaced the placeholder values with actual credentials
3. No quotes needed around the values

### "Failed to search tracks"
**Solution:**
1. Check backend is running (http://localhost:8000/docs should load)
2. Verify Spotify credentials are correct
3. Check browser console for specific error

### Frontend shows blank page
**Solution:**
1. Check browser console for errors
2. Make sure you ran `npm install`
3. Try `npm run dev` again

### Port already in use
**Solution:**
- Backend (8000): Kill the process using port 8000
- Frontend (3000): Vite will automatically try port 3001

## 🎯 What's Next - Phase 2

In Phase 2 (Weeks 3-4), we'll add:
- **Drag-and-drop** setlist builder
- **Setlist canvas** to arrange tracks
- **Add/remove** tracks to setlists
- **Save/load** setlists
- **Track reordering**
- **BPM compatibility** indicators

## 💡 Tips

1. **API Rate Limits:** Spotify has rate limits. If searches stop working, wait a few minutes.

2. **Local Storage:** Your setlists are saved in your browser's localStorage. Clear browser data = lost setlists (we'll add cloud sync later).

3. **Preview URLs:** Some tracks have preview URLs - we'll add audio playback in future phases.

4. **Dark Mode:** The UI is designed for dark environments (like DJ booths!).

## 📸 Screenshots

### Dashboard
- Clean, gradient background
- Quick action cards
- Stats overview
- Recent setlists

### Search
- Real-time Spotify search
- Album artwork
- BPM, key, and energy display
- Clean track cards

## ✅ Phase 1 Checklist

- [x] Project setup (React + TypeScript + FastAPI)
- [x] Spotify API integration
- [x] Track search functionality
- [x] Display track metadata (BPM, key, energy)
- [x] Beautiful UI with Tailwind CSS
- [x] Local storage setup
- [x] Camelot key notation
- [x] Audio features extraction
- [x] Navigation between views
- [x] Responsive design

## 🎓 Learning Resources

If you want to modify or extend the code:

- **React Docs:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **FastAPI:** https://fastapi.tiangolo.com
- **Spotify API:** https://developer.spotify.com/documentation/web-api

## 🚀 Deployment (Future)

Phase 1 is for local development. In later phases, we'll deploy to:
- **Frontend:** Vercel or Netlify
- **Backend:** Railway, Render, or AWS
- **Database:** PostgreSQL for cloud storage

## 📝 Notes

- **Keys are Camelot notation:** Makes harmonic mixing easier (8A → 9A, 8A → 8B are compatible)
- **BPM is rounded:** Spotify gives decimal BPM, we round for simplicity
- **Energy is 1-10:** Converted from Spotify's 0-1 scale
- **Search limit:** Currently 20 tracks per search (configurable)

## 🎉 Congratulations!

You've completed Phase 1! You now have a working DJ setlist builder with Spotify integration.

Ready for Phase 2? Let me know and we'll add the drag-and-drop setlist builder! 🎵
