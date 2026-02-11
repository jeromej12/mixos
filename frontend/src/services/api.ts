import { Track, SearchResult } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // iTunes/Apple Music search
  searchTracks: async (query: string): Promise<Track[]> => {
    const response = await fetch(`${API_BASE_URL}/itunes/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data: SearchResult = await response.json();
    return data.tracks;
  },

  // Analyze track preview for BPM/key/energy
  analyzeTrack: async (track: Track): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/itunes/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(track),
    });
    if (!response.ok) throw new Error('Failed to analyze track');
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

  // Upload local audio file for analysis
  uploadTrack: async (file: File): Promise<Track> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/tracks/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  // List all tracks in the library
  getLibrary: async (): Promise<Track[]> => {
    const response = await fetch(`${API_BASE_URL}/tracks/library`);
    if (!response.ok) throw new Error('Failed to load library');
    return response.json();
  },

  // Delete a track from the library
  deleteTrack: async (trackId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tracks/${trackId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete track');
  },

};
