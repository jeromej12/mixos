import React from 'react';
import { Music, Zap, TrendingUp, Clock, Disc } from 'lucide-react';

interface AITrack {
  title: string;
  artist: string;
  bpm: number;
  key: string;
  energy: number;
  position: string;
  reasoning: string;
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

interface AIResultsProps {
  playlists: AIPlaylist[];
  onBack: () => void;
}

export const AIResults: React.FC<AIResultsProps> = ({ playlists, onBack }) => {
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
    <div className="min-h-screen bg-black p-8">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">AI Generated Setlists</h1>
          <p className="text-gray-500">Choose the vibe that fits your vision</p>
        </div>

        {/* Playlists */}
        <div className="space-y-8">
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
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">{playlist.recommended_track_count}</div>
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
                  Track Suggestions
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
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${getPositionColor(track.position)}`}>
                              {track.position}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm ml-8">{track.artist}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-purple-400 font-semibold">{track.bpm}</div>
                            <div className="text-gray-600 text-xs">BPM</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-400 font-semibold">{track.key}</div>
                            <div className="text-gray-600 text-xs">Key</div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-semibold">{track.energy}/10</div>
                            <div className="text-gray-600 text-xs">Energy</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm italic ml-8">{track.reasoning}</p>
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
    </div>
  );
};
