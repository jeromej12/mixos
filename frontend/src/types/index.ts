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
  source: 'local' | 'itunes' | 'ai';
  previewUrl?: string;
  position?: string;
  reasoning?: string;
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  totalDuration: number;
  createdAt: Date;
}

export interface SearchResult {
  tracks: Track[];
  total: number;
}
