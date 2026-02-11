import React from 'react';
import { X, Plus, Clock, Zap, TrendingUp, HardDrive, Globe, Sparkles } from 'lucide-react';
import { useSetlistStore } from '../store/setlistStore';
import { formatDuration, formatTotalDuration, calculateAverageBPM, calculateAverageEnergy } from '../utils/format';

interface SetlistPanelProps {
  onClose: () => void;
}

const sourceBadge = (source: string) => {
  switch (source) {
    case 'local':
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-400" title="Local file">
          <HardDrive className="w-2.5 h-2.5" />
        </span>
      );
    case 'itunes':
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded text-[10px] text-pink-400" title="iTunes search">
          <Globe className="w-2.5 h-2.5" />
        </span>
      );
    case 'ai':
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400" title="AI suggested">
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      );
    default:
      return null;
  }
};

export const SetlistPanel: React.FC<SetlistPanelProps> = ({ onClose }) => {
  const { currentSetlist, removeTrackFromSetlist } = useSetlistStore();
  const tracks = currentSetlist?.tracks || [];

  return (
    <div className="w-96 h-full bg-gray-900/95 backdrop-blur-lg border-l border-gray-700/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">Your Setlist</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 p-6 pb-4">
        <div className="bg-gray-950 rounded-lg p-3 border border-gray-700/40 text-center">
          <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-white font-semibold text-sm">
            {formatTotalDuration(currentSetlist?.totalDuration || 0)}
          </div>
          <div className="text-gray-600 text-xs">Duration</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-3 border border-gray-700/40 text-center">
          <Zap className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <div className="text-white font-semibold text-sm">
            {calculateAverageBPM(tracks)}
          </div>
          <div className="text-gray-600 text-xs">Avg BPM</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-3 border border-gray-700/40 text-center">
          <TrendingUp className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <div className="text-white font-semibold text-sm">
            {calculateAverageEnergy(tracks)}/10
          </div>
          <div className="text-gray-600 text-xs">Energy</div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {tracks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg">
            <Plus className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Add tracks from AI results or your library</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className="bg-gray-950/80 rounded-lg p-3 border border-gray-700/30 flex items-center gap-3"
              >
                <span className="text-gray-600 font-mono text-sm w-6 text-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-sm font-medium truncate">{track.title}</p>
                    {sourceBadge(track.source)}
                  </div>
                  <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2 text-xs flex-shrink-0">
                  <span className="text-gray-500">{formatDuration(track.duration)}</span>
                  {track.bpm != null && <span className="text-purple-400">{track.bpm}</span>}
                  {track.key && <span className="text-red-400">{track.key}</span>}
                  {track.energy != null && <span className="text-blue-400">{track.energy}</span>}
                </div>
                <button
                  onClick={() => removeTrackFromSetlist(track.id)}
                  className="p-1 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tracks.length > 0 && (
          <p className="text-gray-600 text-xs mt-3 text-center">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};
