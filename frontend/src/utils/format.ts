export const formatDuration = (seconds: number): string => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTotalDuration = (seconds: number): string => {
  if (!seconds) return '--';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const calculateAverageBPM = (tracks: any[]): number => {
  const tracksWithBPM = tracks.filter(t => t.bpm);
  if (tracksWithBPM.length === 0) return 0;

  const sum = tracksWithBPM.reduce((acc, t) => acc + (t.bpm || 0), 0);
  return Math.round(sum / tracksWithBPM.length);
};

export const calculateAverageEnergy = (tracks: any[]): number => {
  const tracksWithEnergy = tracks.filter(t => t.energy);
  if (tracksWithEnergy.length === 0) return 0;
  const sum = tracksWithEnergy.reduce((acc, t) => acc + (t.energy || 0), 0);
  return Math.round(sum / tracksWithEnergy.length * 10) / 10;
};
