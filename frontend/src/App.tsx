import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TrackSearch } from './components/TrackSearch';

type View = 'landing' | 'dashboard' | 'search' | 'manual-builder';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };

  // Render based on current view
  if (currentView === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  // For other views, show navigation bar
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-white font-bold text-xl">
                Mix<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-red-500 to-blue-500">OS</span>
              </span>
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('search')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === 'search'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setCurrentView('manual-builder')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === 'manual-builder'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Builder
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'search' && <TrackSearch />}
      {currentView === 'manual-builder' && (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Manual Builder</h1>
            <p className="text-gray-500">Coming in Phase 2!</p>
            <button
              onClick={() => setCurrentView('landing')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
