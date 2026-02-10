import React, { useEffect } from 'react';
import { Music, Sparkles, ListMusic, Library } from 'lucide-react';
import { useSetlistStore } from '../store/setlistStore';

export const Dashboard: React.FC = () => {
  const { setlists, loadSetlists } = useSetlistStore();

  useEffect(() => {
    loadSetlists();
  }, [loadSetlists]);

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-purple-500" />
            <h1 className="text-5xl font-bold text-white">MixOS</h1>
          </div>
          <p className="text-xl text-gray-400">
            Create perfect setlists with AI-powered suggestions and professional mixing tools
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <ActionCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI Generate"
            description="Let AI create the perfect setlist based on your vibe"
            color="from-purple-600 to-red-600"
            comingSoon={true}
          />
          <ActionCard
            icon={<ListMusic className="w-8 h-8" />}
            title="Manual Build"
            description="Craft your setlist with professional DJ tools"
            color="from-blue-600 to-purple-600"
            comingSoon={true}
          />
          <ActionCard
            icon={<Library className="w-8 h-8" />}
            title="Browse Library"
            description="Search and explore your music collection"
            color="from-purple-600 to-blue-600"
            comingSoon={false}
          />
        </div>

        {/* Recent Setlists */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Setlists</h2>
          {setlists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No setlists yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {setlists.slice(0, 5).map((setlist) => (
                <div
                  key={setlist.id}
                  className="bg-gray-950 rounded-lg p-4 hover:bg-gray-800/50 border border-gray-700/40 transition-colors cursor-pointer"
                >
                  <h3 className="text-white font-semibold text-lg">{setlist.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {setlist.tracks.length} tracks • {Math.floor(setlist.totalDuration / 60)} minutes
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <StatCard label="Total Setlists" value={setlists.length} />
          <StatCard
            label="Total Tracks"
            value={setlists.reduce((sum, s) => sum + s.tracks.length, 0)}
          />
          <StatCard
            label="Total Duration"
            value={`${Math.floor(setlists.reduce((sum, s) => sum + s.totalDuration, 0) / 3600)}h`}
          />
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  comingSoon?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, color, comingSoon }) => (
  <div className={`relative bg-gradient-to-br ${color} rounded-lg p-6 text-white hover:scale-105 transition-transform cursor-pointer`}>
    {comingSoon && (
      <span className="absolute top-2 right-2 bg-black/40 text-xs px-2 py-1 rounded-full font-semibold">
        Coming Soon
      </span>
    )}
    <div className="mb-3">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-white/80 text-sm">{description}</p>
  </div>
);

interface StatCardProps {
  label: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-gray-900/80 backdrop-blur-lg rounded-lg p-6 text-center border border-gray-700/50">
    <p className="text-gray-500 text-sm mb-2">{label}</p>
    <p className="text-white text-3xl font-bold">{value}</p>
  </div>
);
