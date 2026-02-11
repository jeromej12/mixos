import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ManualBuilder } from './components/ManualBuilder';

type View = 'landing' | 'manual-builder';

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
                onClick={() => setCurrentView('manual-builder')}
                className="px-4 py-2 rounded-md transition-colors bg-purple-600 text-white"
              >
                Builder
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === 'manual-builder' && <ManualBuilder />}
    </div>
  );
}

export default App;
