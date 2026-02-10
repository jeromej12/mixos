import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Track } from '../types';
import { TrackCard } from './TrackCard';

export const TrackSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const tracks = await api.searchTracks(query);
      setResults(tracks);
    } catch (err) {
      setError('Failed to search tracks. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-white mb-8">Search Tracks</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for tracks, artists, or albums..."
              className="w-full px-4 py-4 pl-12 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-md text-white font-medium transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Results ({results.length})
            </h2>
            <div className="grid gap-4">
              {results.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};
