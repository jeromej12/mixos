import React, { useState, useRef } from 'react';
import { Music, Zap, TrendingUp, Clock, Disc, Sparkles, Send, AlertCircle, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

interface AITrack {
  title: string;
  artist: string;
  bpm?: number | null;
  key?: string | null;
  energy?: number | null;
  position?: string | null;
  reasoning?: string | null;
}

interface AIPlaylist {
  name: string;
  description: string;
  bpm_range: string;
  energy_progression: string;
  recommended_track_count: number;
  total_duration_estimate: number;
  genres: string[];
  key_characteristics: string[];
  tracks: AITrack[];
  transition_notes: string[];
}

interface VersionEntry {
  playlists: AIPlaylist[];
  label: string;
}

interface AIResultsProps {
  playlists: AIPlaylist[];
  onBack: () => void;
}

export const AIResults: React.FC<AIResultsProps> = ({ playlists: initialPlaylists, onBack }) => {
  const [playlists, setPlaylists] = useState<AIPlaylist[]>(initialPlaylists);
  const [refinement, setRefinement] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [history, setHistory] = useState<VersionEntry[]>([
    { playlists: initialPlaylists, label: 'Original' }
  ]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleRefine = async () => {
    if (!refinement.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
      const result = await api.refineSetlist(refinement, { playlists });

      // Slide out old content
      setAnimationClass('slide-out-left');

      // After slide-out, update content and slide in
      setTimeout(() => {
        const newPlaylists = result.playlists;
        setPlaylists(newPlaylists);

        // Add to history (trim any forward history if we refined from a past version)
        const newHistory = [
          ...history.slice(0, currentVersion + 1),
          { playlists: newPlaylists, label: refinement }
        ];
        setHistory(newHistory);
        setCurrentVersion(newHistory.length - 1);

        setAnimationClass('slide-in-right');
        setRefinement('');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => setAnimationClass(''), 350);
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to refine setlist. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const goToVersion = (index: number) => {
    if (index === currentVersion) return;
    const goingBack = index < currentVersion;

    setAnimationClass(goingBack ? 'slide-out-left' : 'slide-out-left');
    setTimeout(() => {
      setPlaylists(history[index].playlists);
      setCurrentVersion(index);
      setAnimationClass('slide-in-right');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setAnimationClass(''), 350);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRefine();
    }
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'opener': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'build': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'peak': 'bg-red-500/10 text-red-400 border-red-500/20',
      'transition': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      'closer': 'bg-purple-500/10 text-purple-300 border-purple-500/20'
    };
    return colors[position.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-black p-8 pb-36">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <button
              onClick={onBack}
              className="mb-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">AI Generated Setlist</h1>
            <p className="text-gray-500">Refine it until it's perfect</p>
          </div>

          {/* Version History Toggle */}
          {history.length > 1 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showHistory
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-gray-900 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm">v{currentVersion + 1} of {history.length}</span>
            </button>
          )}
        </div>

        {/* Version History Panel */}
        {showHistory && history.length > 1 && (
          <div className="mb-6 bg-gray-900/80 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-500" />
              Version History
            </h3>
            <div className="space-y-2">
              {history.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => goToVersion(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                    idx === currentVersion
                      ? 'bg-purple-500/10 border-purple-500/30 text-white'
                      : 'bg-gray-950 border-gray-700/30 text-gray-400 hover:border-gray-600/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      idx === currentVersion ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      v{idx + 1}
                    </span>
                    <span className="text-sm truncate max-w-md">
                      {entry.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {entry.playlists[0]?.tracks.length || 0} tracks
                  </span>
                </button>
              ))}
            </div>

            {/* Quick nav */}
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-gray-800">
              <button
                onClick={() => goToVersion(Math.max(0, currentVersion - 1))}
                disabled={currentVersion === 0}
                className="p-1.5 rounded-lg bg-gray-950 border border-gray-700/30 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500">
                Version {currentVersion + 1} of {history.length}
              </span>
              <button
                onClick={() => goToVersion(Math.min(history.length - 1, currentVersion + 1))}
                disabled={currentVersion === history.length - 1}
                className="p-1.5 rounded-lg bg-gray-950 border border-gray-700/30 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Playlists (animated) */}
        <div ref={contentRef} className={`space-y-8 ${animationClass}`}>
          {playlists.map((playlist, idx) => (
            <div key={idx} className="bg-gray-900/80 rounded-2xl p-8 border border-gray-700/50">
              {/* Playlist Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{playlist.name}</h2>
                    <p className="text-gray-400 text-lg">{playlist.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">{playlist.tracks.length}</div>
                    <div className="text-sm text-gray-500">tracks</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-700/40">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Zap className="w-4 h-4 text-purple-500" />
                      BPM Range
                    </div>
                    <div className="text-white font-semibold">{playlist.bpm_range}</div>
                  </div>
                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-700/40">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Duration
                    </div>
                    <div className="text-white font-semibold">{playlist.total_duration_estimate} min</div>
                  </div>
                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-700/40">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      Energy
                    </div>
                    <div className="text-white font-semibold text-sm">{playlist.energy_progression}</div>
                  </div>
                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-700/40">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Disc className="w-4 h-4 text-purple-500" />
                      Genres
                    </div>
                    <div className="text-white font-semibold text-sm">{playlist.genres.slice(0, 2).join(', ')}</div>
                  </div>
                </div>

                {/* Key Characteristics */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 text-sm">Key Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {playlist.key_characteristics.map((char, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracks */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Track Suggestions ({playlist.tracks.length})
                </h3>
                <div className="space-y-3">
                  {playlist.tracks.map((track, trackIdx) => (
                    <div
                      key={trackIdx}
                      className="bg-gray-950/80 rounded-lg p-4 hover:bg-gray-800/40 border border-gray-700/30 hover:border-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-gray-600 font-mono text-sm">{String(trackIdx + 1).padStart(2, '0')}</span>
                            <h4 className="text-white font-semibold">{track.title}</h4>
                            {track.position && (
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getPositionColor(track.position)}`}>
                                {track.position}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm ml-8">{track.artist}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {track.bpm != null && (
                            <div className="text-center">
                              <div className="text-purple-400 font-semibold">{track.bpm}</div>
                              <div className="text-gray-600 text-xs">BPM</div>
                            </div>
                          )}
                          {track.key && (
                            <div className="text-center">
                              <div className="text-red-400 font-semibold">{track.key}</div>
                              <div className="text-gray-600 text-xs">Key</div>
                            </div>
                          )}
                          {track.energy != null && (
                            <div className="text-center">
                              <div className="text-blue-400 font-semibold">{track.energy}/10</div>
                              <div className="text-gray-600 text-xs">Energy</div>
                            </div>
                          )}
                        </div>
                      </div>
                      {track.reasoning && <p className="text-gray-500 text-sm italic ml-8">{track.reasoning}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transition Notes */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Transition Guide
                </h3>
                <div className="space-y-2">
                  {playlist.transition_notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-purple-500 mt-0.5">→</span>
                      <span className="text-gray-400">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 via-red-600 to-blue-600 hover:from-purple-500 hover:via-red-500 hover:to-blue-500 rounded-lg text-white font-semibold transition-all">
                  Use This Setlist Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Refinement Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-lg border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          {error && (
            <div className="mb-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <input
              type="text"
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Refine your setlist... e.g. 'add more techno tracks' or 'make it a 2 hour set'"
              disabled={isRefining}
              className="flex-1 px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleRefine}
              disabled={!refinement.trim() || isRefining}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 rounded-xl text-white font-medium transition-all flex items-center gap-2"
            >
              {isRefining ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
