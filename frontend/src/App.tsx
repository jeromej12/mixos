import { useState, useEffect } from 'react';
import { ListMusic } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { ManualBuilder } from './components/ManualBuilder';
import { SetlistPanel } from './components/SetlistPanel';
import { useSetlistStore } from './store/setlistStore';

type View = 'landing' | 'manual-builder';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [showSetlist, setShowSetlist] = useState(false);
  const { currentSetlist, createNewSetlist } = useSetlistStore();

  // Auto-create a setlist on first load if none exists (after persist rehydration)
  useEffect(() => {
    // Small delay to allow persist middleware to rehydrate
    const timer = setTimeout(() => {
      if (!useSetlistStore.getState().currentSetlist) {
        createNewSetlist('New Setlist');
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };

  const handleShowSetlist = () => {
    setShowSetlist(true);
  };

  const trackCount = currentSetlist?.tracks.length || 0;

  // Render based on current view
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage onNavigate={handleNavigate} onShowSetlist={handleShowSetlist} />

        {/* Floating Setlist Button */}
        <button
          onClick={() => setShowSetlist(!showSetlist)}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full shadow-lg shadow-purple-500/25 flex items-center justify-center text-white transition-all hover:scale-110"
          title="Open Setlist"
        >
          <ListMusic className="w-6 h-6" />
          {trackCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
              {trackCount}
            </span>
          )}
        </button>

        {/* Slide-out Setlist Panel */}
        {showSetlist && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSetlist(false)} />
            <div className="relative z-10 animate-slide-in-right">
              <SetlistPanel onClose={() => setShowSetlist(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  // For other views, show navigation bar
  return (
    <>
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
        {currentView === 'manual-builder' && (
          <ManualBuilder onBack={() => setCurrentView('landing')} onShowSetlist={handleShowSetlist} />
        )}
      </div>

      {/* Floating Setlist Button */}
      <button
        onClick={() => setShowSetlist(!showSetlist)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full shadow-lg shadow-purple-500/25 flex items-center justify-center text-white transition-all hover:scale-110"
        title="Open Setlist"
      >
        <ListMusic className="w-6 h-6" />
        {trackCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
            {trackCount}
          </span>
        )}
      </button>

      {/* Slide-out Setlist Panel */}
      {showSetlist && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSetlist(false)} />
          <div className="relative z-10 animate-slide-in-right">
            <SetlistPanel onClose={() => setShowSetlist(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
