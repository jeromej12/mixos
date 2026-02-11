import { Track } from '../types';

interface AITrack {
  title: string;
  artist: string;
  bpm?: number | null;
  key?: string | null;
  energy?: number | null;
  position?: string | null;
  reasoning?: string | null;
}

export const convertAITrack = (aiTrack: AITrack): Track => ({
  id: crypto.randomUUID(),
  title: aiTrack.title,
  artist: aiTrack.artist,
  bpm: aiTrack.bpm ?? undefined,
  key: aiTrack.key ?? undefined,
  energy: aiTrack.energy ?? undefined,
  duration: 0,
  source: 'ai',
  position: aiTrack.position ?? undefined,
  reasoning: aiTrack.reasoning ?? undefined,
});
