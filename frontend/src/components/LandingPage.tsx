import React, { useState } from 'react';
import { Sparkles, ListMusic, Music, Zap, TrendingUp, Radio, AlertCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { AIResults } from './AIResults';

export const LandingPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [aiQuery, setAiQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<any>(null);
  const [targetDuration, setTargetDuration] = useState<number | undefined>(undefined);

  const handleAIGenerate = async () => {
    if (!aiQuery.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await api.generateSetlist(aiQuery, 1, targetDuration);
      setAiResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate setlist. Make sure the backend is running with Claude API key configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualCreate = () => {
    onNavigate('manual-builder');
  };

  const handleBackToLanding = () => {
    setAiResults(null);
    setAiQuery('');
    setError(null);
    setTargetDuration(undefined);
  };

  // Show AI results if we have them
  if (aiResults) {
    return <AIResults playlists={aiResults.playlists} onBack={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Music className="w-16 h-16 text-purple-500" />
              <Zap className="w-6 h-6 text-red-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
            Mix<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-red-500 to-blue-500">OS</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            AI-Powered DJ Setlist Builder
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Create the perfect setlist with intelligent AI suggestions or craft your own with professional mixing tools
          </p>
        </div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {/* AI Generation Card */}
          <div className="glow-border-hover">
            <div className="relative bg-gray-900 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-red-600 rounded-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">AI Generate</h2>
                  <p className="text-purple-400 text-sm">Let AI craft your perfect set</p>
                </div>
              </div>

              {/* AI Input */}
              <div className="mb-6">
                <label className="block text-gray-400 mb-3 font-medium">
                  Describe your vibe
                </label>
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g., 'upbeat progressive house for peak time' or 'chill downtempo opener with melodic vibes'"
                  className="w-full px-4 py-4 bg-gray-950 border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                  rows={4}
                />
              </div>

              {/* Examples */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Peak time techno",
                    "Sunset deep house",
                    "Warm-up progressive",
                    "High energy closing"
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setAiQuery(example)}
                      className="px-3 py-1 bg-gray-950 hover:bg-purple-500/10 border border-gray-700/50 hover:border-purple-500/30 rounded-full text-xs text-gray-400 hover:text-purple-300 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set Duration */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-400 mb-3 font-medium">
                  <Clock className="w-4 h-4" />
                  Set Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Auto', value: undefined },
                    { label: '30 min', value: 30 },
                    { label: '1 hr', value: 60 },
                    { label: '1.5 hr', value: 90 },
                    { label: '2 hr', value: 120 },
                    { label: '3 hr', value: 180 },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setTargetDuration(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                        targetDuration === option.value
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : 'bg-gray-950 border-gray-700/50 text-gray-400 hover:border-purple-500/30 hover:text-purple-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-semibold mb-1">Generation Failed</p>
                    <p className="text-red-300/70 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleAIGenerate}
                disabled={!aiQuery.trim() || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-red-600 to-purple-600 hover:from-purple-500 hover:via-red-500 hover:to-purple-500 disabled:from-gray-800 disabled:via-gray-800 disabled:to-gray-800 rounded-xl text-white font-semibold text-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed disabled:text-gray-500 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Setlist
                  </>
                )}
              </button>

              {/* Features */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span>Energy flow</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Radio className="w-4 h-4 text-red-500" />
                    <span>BPM matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Music className="w-4 h-4 text-blue-500" />
                    <span>Key harmony</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Smart transitions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Builder Card */}
          <div className="glow-border-hover">
            <div className="relative bg-gray-900 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <ListMusic className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Manual Build</h2>
                  <p className="text-blue-400 text-sm">Full control with pro tools</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Craft your setlist from scratch with professional DJ tools. Search your library, analyze tracks, and build the perfect flow.
                </p>

                <div className="bg-gray-950 rounded-xl p-4 mb-4">
                  <h3 className="text-white font-semibold mb-3 text-sm">You get:</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>Drag-and-drop track arrangement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>BPM and key compatibility checking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>Camelot wheel harmonic mixing guide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>Energy flow visualization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>Real-time duration tracking</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleManualCreate}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-semibold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <ListMusic className="w-5 h-5" />
                Start Building
              </button>

              {/* Best For */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Perfect for:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Custom sets",
                    "Venue-specific",
                    "Special events",
                    "Precise control"
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-xs text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gray-900/80/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <h3 className="text-white font-bold text-xl mb-6 text-center">
            Powered by Professional DJ Tools
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-white font-semibold mb-1">Song Search</h4>
              <p className="text-gray-500 text-sm">Search and preview tracks</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Radio className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-white font-semibold mb-1">BPM Analysis</h4>
              <p className="text-gray-500 text-sm">Automatic tempo detection</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="text-white font-semibold mb-1">Camelot Wheel</h4>
              <p className="text-gray-500 text-sm">Harmonic mixing guide</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-white font-semibold mb-1">Energy Flow</h4>
              <p className="text-gray-500 text-sm">Visualize set dynamics</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Built for DJs, by DJs
          </p>
        </div>
      </div>
    </div>
  );
};
