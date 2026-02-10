import { create } from 'zustand';
import { Track, Setlist } from '../types';

interface SetlistStore {
  currentSetlist: Setlist | null;
  setlists: Setlist[];
  searchResults: Track[];
  
  // Actions
  setCurrentSetlist: (setlist: Setlist | null) => void;
  addTrackToSetlist: (track: Track) => void;
  removeTrackFromSetlist: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
  saveSetlist: () => void;
  loadSetlists: () => void;
  createNewSetlist: (name: string, description?: string) => void;
  setSearchResults: (tracks: Track[]) => void;
}

export const useSetlistStore = create<SetlistStore>((set, get) => ({
  currentSetlist: null,
  setlists: [],
  searchResults: [],

  setCurrentSetlist: (setlist) => set({ currentSetlist: setlist }),

  addTrackToSetlist: (track) => set((state) => {
    if (!state.currentSetlist) return state;
    
    const updatedTracks = [...state.currentSetlist.tracks, track];
    const totalDuration = updatedTracks.reduce((sum, t) => sum + t.duration, 0);
    
    return {
      currentSetlist: {
        ...state.currentSetlist,
        tracks: updatedTracks,
        totalDuration
      }
    };
  }),

  removeTrackFromSetlist: (trackId) => set((state) => {
    if (!state.currentSetlist) return state;
    
    const updatedTracks = state.currentSetlist.tracks.filter(t => t.id !== trackId);
    const totalDuration = updatedTracks.reduce((sum, t) => sum + t.duration, 0);
    
    return {
      currentSetlist: {
        ...state.currentSetlist,
        tracks: updatedTracks,
        totalDuration
      }
    };
  }),

  reorderTracks: (startIndex, endIndex) => set((state) => {
    if (!state.currentSetlist) return state;
    
    const tracks = Array.from(state.currentSetlist.tracks);
    const [removed] = tracks.splice(startIndex, 1);
    tracks.splice(endIndex, 0, removed);
    
    return {
      currentSetlist: {
        ...state.currentSetlist,
        tracks
      }
    };
  }),

  saveSetlist: () => {
    const { currentSetlist, setlists } = get();
    if (!currentSetlist) return;
    
    const existingIndex = setlists.findIndex(s => s.id === currentSetlist.id);
    let updatedSetlists;
    
    if (existingIndex >= 0) {
      updatedSetlists = [...setlists];
      updatedSetlists[existingIndex] = currentSetlist;
    } else {
      updatedSetlists = [...setlists, currentSetlist];
    }
    
    set({ setlists: updatedSetlists });
    localStorage.setItem('mixos-setlists', JSON.stringify(updatedSetlists));
  },

  loadSetlists: () => {
    const stored = localStorage.getItem('mixos-setlists');
    if (stored) {
      try {
        const setlists = JSON.parse(stored);
        set({ setlists });
      } catch (error) {
        console.error('Failed to load setlists:', error);
      }
    }
  },

  createNewSetlist: (name, description) => {
    const newSetlist: Setlist = {
      id: crypto.randomUUID(),
      name,
      description,
      tracks: [],
      totalDuration: 0,
      createdAt: new Date(),
      tags: []
    };
    
    set({ currentSetlist: newSetlist });
  },

  setSearchResults: (tracks) => set({ searchResults: tracks })
}));
