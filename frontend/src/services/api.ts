import { Track, SpotifySearchResult } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Spotify search
  searchTracks: async (query: string): Promise<Track[]> => {
    const response = await fetch(`${API_BASE_URL}/spotify/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data: SpotifySearchResult = await response.json();
    return data.tracks;
  },

  // Get track details
  getTrack: async (spotifyId: string): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/spotify/track/${spotifyId}`);
    if (!response.ok) throw new Error('Failed to get track');
    return response.json();
  },

  // AI setlist generation
  generateSetlist: async (query: string, numPlaylists: number = 2, targetDuration?: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/ai/generate-setlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        num_playlists: numPlaylists,
        target_duration: targetDuration
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'AI generation failed');
    }
    
    return response.json();
  },

  // AI setlist refinement
  refineSetlist: async (refinement: string, currentPlaylist: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/ai/refine-setlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refinement,
        current_playlist: currentPlaylist
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'AI refinement failed');
    }

    return response.json();
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
