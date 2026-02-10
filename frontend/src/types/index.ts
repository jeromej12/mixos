export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  bpm?: number;
  key?: string; // Camelot notation (e.g., "8A", "5B")
  energy?: number; // 1-10 scale
  duration: number; // seconds
  genre?: string;
  source: 'spotify' | 'local';
  spotifyId?: string;
  previewUrl?: string;
  audioFeatures?: SpotifyAudioFeatures;
}

export interface SpotifyAudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  timeSignature: number;
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  totalDuration: number;
  averageBPM?: number;
  createdAt: Date;
  tags?: string[];
}

export interface SpotifySearchResult {
  tracks: Track[];
  total: number;
}
