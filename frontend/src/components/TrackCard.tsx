import React from 'react';
import { Music, Plus } from 'lucide-react';
import { Track } from '../types';
import { formatDuration } from '../utils/format';
import { useSetlistStore } from '../store/setlistStore';

interface TrackCardProps {
  track: Track;
  showAddButton?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, showAddButton = true }) => {
  const { addTrackToSetlist, currentSetlist } = useSetlistStore();

  const handleAdd = () => {
    if (currentSetlist) {
      addTrackToSetlist(track);
    }
  };

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-4 hover:border-gray-700 transition-colors flex items-center gap-4">
      {/* Album Art */}
      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
        {track.albumArt ? (
          <img src={track.albumArt} alt={track.album} className="w-full h-full object-cover rounded-md" />
        ) : (
          <Music className="w-8 h-8 text-white" />
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-lg truncate">{track.title}</h3>
        <p className="text-gray-500 truncate">{track.artist}</p>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <span>{formatDuration(track.duration)}</span>
          {track.bpm && <span>{track.bpm} BPM</span>}
          {track.key && <span>Key: {track.key}</span>}
        </div>
      </div>

      {/* Add Button */}
      {showAddButton && currentSetlist && (
        <button
          onClick={handleAdd}
          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-full transition-colors"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};
