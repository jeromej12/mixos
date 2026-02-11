import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Music, Plus, Trash2, Clock, Zap,
  TrendingUp, Loader2, AlertCircle, X, FileAudio, Search,
  Play, Pause, Volume2
} from 'lucide-react';
import { api } from '../services/api';
import { Track } from '../types';
import { useSetlistStore } from '../store/setlistStore';
import { formatDuration, formatTotalDuration, calculateAverageBPM, calculateAverageEnergy } from '../utils/format';

export const ManualBuilder: React.FC = () => {
  const [library, setLibrary] = useState<Track[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showSetlist, setShowSetlist] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [analyzingTrackId, setAnalyzingTrackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentSetlist,
    createNewSetlist,
    addTrackToSetlist,
    removeTrackFromSetlist,
  } = useSetlistStore();

  useEffect(() => {
    if (!currentSetlist) {
      createNewSetlist('New Setlist');
    }
  }, []);

  useEffect(() => {
    loadLibrary();
    // Create shared audio element
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setPlayingTrackId(null);
      setPlaybackProgress(0);
    });
    audioRef.current.addEventListener('timeupdate', () => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const loadLibrary = async () => {
    try {
      const tracks = await api.getLibrary();
      setLibrary(tracks);
    } catch {
      // Library empty on fresh start
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(`Analyzing ${file.name} (${i + 1}/${fileArray.length})...`);

      try {
        const track = await api.uploadTrack(file);
        setLibrary(prev => [...prev, track]);
      } catch (err: any) {
        setError(`Failed to analyze ${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDeleteTrack = async (trackId: string) => {
    // Stop playback if deleting the playing track
    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      setPlaybackProgress(0);
    }
    try {
      await api.deleteTrack(trackId);
      setLibrary(prev => prev.filter(t => t.id !== trackId));
    } catch (err: any) {
      setError(`Failed to delete track: ${err.message}`);
    }
  };

  const handleAddToSetlist = (track: Track) => {
    addTrackToSetlist(track);
    setShowSetlist(true);
  };

  const handlePlayPause = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingTrackId === track.id) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      // Local tracks use our streaming endpoint, others use preview URL
      if (track.source === 'local') {
        audio.src = `/api/tracks/${track.id}/audio`;
      } else if (track.previewUrl) {
        audio.src = track.previewUrl;
      } else {
        return; // No audio available
      }
      audio.play();
      setPlayingTrackId(track.id);
      setPlaybackProgress(0);
    }
  }, [playingTrackId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const results = await api.searchTracks(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setError(`Search failed: ${err.message}`);
    }
    setSearching(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAddSearchTrack = async (track: Track) => {
    setAnalyzingTrackId(track.id);
    try {
      // Analyze preview for BPM/key/energy
      const analyzed = await api.analyzeTrack(track);
      setLibrary(prev => [...prev, analyzed]);
    } catch (err: any) {
      // Fallback: add without analysis
      setLibrary(prev => [...prev, track]);
    }
    setAnalyzingTrackId(null);
  };

  const setlistTracks = currentSetlist?.tracks || [];
  const allTracks = [...library, ...searchResults];
  const nowPlaying = allTracks.find(t => t.id === playingTrackId);

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 pointer-events-none" />

      <div className={`max-w-7xl mx-auto px-4 py-8 relative z-10 ${nowPlaying ? 'pb-28' : ''}`}>
        {/* Source Buttons */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-semibold transition-all"
          >
            <Upload className="w-5 h-5" />
            Import Local Files
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
              showSearch
                ? 'bg-pink-600 hover:bg-pink-500 text-white'
                : 'bg-gray-900 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            Search Songs
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".mp3,.wav,.flac"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Panel */}
        {showSearch && (
          <div className="mb-6 bg-gray-900/80 rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for a song..."
                className="flex-1 px-4 py-3 bg-gray-950 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-5 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-xl text-white font-medium transition-all flex items-center gap-2"
              >
                {searching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults.map((track) => {
                  const alreadyAdded = library.some(t => t.id === track.id);
                  const isAnalyzing = analyzingTrackId === track.id;
                  return (
                    <div
                      key={track.id}
                      className="bg-gray-950/80 rounded-lg p-3 border border-gray-700/30 flex items-center gap-3"
                    >
                      {/* Play Preview */}
                      {track.previewUrl ? (
                        <button
                          onClick={() => handlePlayPause(track)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            playingTrackId === track.id
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                          }`}
                          title={playingTrackId === track.id ? 'Pause' : 'Preview'}
                        >
                          {playingTrackId === track.id ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3 ml-0.5" />
                          )}
                        </button>
                      ) : (
                        <div className="w-8 h-8 flex-shrink-0" />
                      )}
                      {/* Album Art */}
                      {track.albumArt ? (
                        <img src={track.albumArt} alt="" className="w-10 h-10 rounded-md flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{track.title}</p>
                        <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                      </div>
                      <span className="text-gray-500 text-xs flex-shrink-0">{formatDuration(track.duration)}</span>
                      {/* Add Button */}
                      <button
                        onClick={() => handleAddSearchTrack(track)}
                        disabled={alreadyAdded || isAnalyzing}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${
                          alreadyAdded
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : isAnalyzing
                            ? 'bg-gray-800 text-gray-400 cursor-wait'
                            : 'bg-green-600 hover:bg-green-500 text-white'
                        }`}
                      >
                        {alreadyAdded ? (
                          <>&#10003; Added</>
                        ) : isAnalyzing ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Plus className="w-3 h-3" /> Add</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Left: Track Library */}
          <div className="flex-1">
            {/* Upload Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
                dragOver
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700/50 hover:border-gray-600 bg-gray-900/40'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                  <p className="text-gray-400">{uploadProgress || 'Analyzing...'}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-gray-600" />
                  <p className="text-gray-400 font-medium">
                    Drop audio files here or click to browse
                  </p>
                  <p className="text-gray-600 text-sm">MP3, WAV, FLAC up to 50MB</p>
                </div>
              )}
            </div>

            {/* Your Songs */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-purple-500" />
                Your Songs
                {library.length > 0 && (
                  <span className="text-gray-500 text-sm font-normal">({library.length})</span>
                )}
              </h2>

              {library.length === 0 && !uploading ? (
                <div className="text-center py-12 bg-gray-900/40 rounded-xl border border-gray-800/50">
                  <Music className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No songs yet. Import some tracks to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {library.map((track) => {
                    const isInSetlist = setlistTracks.some(t => t.id === track.id);
                    const isPlaying = playingTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`bg-gray-900/80 rounded-lg p-4 border transition-colors flex items-center gap-4 ${
                          isPlaying
                            ? 'border-purple-500/50 bg-purple-950/20'
                            : 'border-gray-700/30 hover:border-gray-700/50'
                        }`}
                      >
                        {/* Play/Pause Button */}
                        {track.source === 'local' || track.previewUrl ? (
                          <button
                            onClick={() => handlePlayPause(track)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isPlaying
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                            }`}
                            title={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-800/50 text-gray-600 cursor-not-allowed"
                            title="No preview available"
                          >
                            <Play className="w-4 h-4 ml-0.5" />
                          </div>
                        )}

                        {/* Add Button */}
                        <button
                          onClick={() => handleAddToSetlist(track)}
                          disabled={isInSetlist}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isInSetlist
                              ? 'bg-green-500/20 text-green-400 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-500 text-white'
                          }`}
                          title={isInSetlist ? 'Already in setlist' : 'Add to setlist'}
                        >
                          {isInSetlist ? (
                            <span className="text-xs font-bold">&#10003;</span>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">{track.title}</h3>
                          <p className="text-gray-500 text-sm truncate">{track.artist}</p>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-4 text-sm flex-shrink-0">
                          <div className="text-center">
                            <div className="text-gray-300 font-mono">{formatDuration(track.duration)}</div>
                            <div className="text-gray-600 text-xs">Duration</div>
                          </div>
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

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
                          className="p-2 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove from library"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Setlist Panel (slides in) */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showSetlist ? 'w-96 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="w-96 bg-gray-900/80 rounded-xl border border-gray-700/50 p-6 sticky top-24">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Setlist</h2>
                <button
                  onClick={() => setShowSetlist(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
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
                    {calculateAverageBPM(setlistTracks)}
                  </div>
                  <div className="text-gray-600 text-xs">Avg BPM</div>
                </div>
                <div className="bg-gray-950 rounded-lg p-3 border border-gray-700/40 text-center">
                  <TrendingUp className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <div className="text-white font-semibold text-sm">
                    {calculateAverageEnergy(setlistTracks)}/10
                  </div>
                  <div className="text-gray-600 text-xs">Energy</div>
                </div>
              </div>

              {/* Setlist Tracks */}
              {setlistTracks.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-lg">
                  <Plus className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Add tracks from your library</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {setlistTracks.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="bg-gray-950/80 rounded-lg p-3 border border-gray-700/30 flex items-center gap-3"
                    >
                      <span className="text-gray-600 font-mono text-sm w-6 text-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{track.title}</p>
                        <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs flex-shrink-0">
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

              {/* Track count */}
              {setlistTracks.length > 0 && (
                <p className="text-gray-600 text-xs mt-3 text-center">
                  {setlistTracks.length} track{setlistTracks.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Now Playing Bar */}
      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-lg border-t border-gray-700/50">
          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-200"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => handlePlayPause(nowPlaying)}
              className="w-10 h-10 bg-purple-500 hover:bg-purple-400 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              {playingTrackId ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{nowPlaying.title}</p>
              <p className="text-gray-500 text-sm truncate">{nowPlaying.artist}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400 flex-shrink-0">
              {nowPlaying.bpm != null && <span className="text-purple-400">{nowPlaying.bpm} BPM</span>}
              {nowPlaying.key && <span className="text-red-400">{nowPlaying.key}</span>}
              <Volume2 className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
