import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, Setlist } from '../types';

interface SetlistStore {
  currentSetlist: Setlist | null;

  addTrackToSetlist: (track: Track) => void;
  addTracksToSetlist: (tracks: Track[]) => void;
  removeTrackFromSetlist: (trackId: string) => void;
  createNewSetlist: (name: string, description?: string) => void;
}

export const useSetlistStore = create<SetlistStore>()(
  persist(
    (set) => ({
      currentSetlist: null,

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

      addTracksToSetlist: (tracks) => set((state) => {
        if (!state.currentSetlist) return state;

        const updatedTracks = [...state.currentSetlist.tracks, ...tracks];
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

      createNewSetlist: (name, description) => {
        const newSetlist: Setlist = {
          id: crypto.randomUUID(),
          name,
          description,
          tracks: [],
          totalDuration: 0,
          createdAt: new Date()
        };

        set({ currentSetlist: newSetlist });
      },
    }),
    {
      name: 'mixos-setlist-store',
    }
  )
);
