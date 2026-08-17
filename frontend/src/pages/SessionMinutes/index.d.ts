export type PlayerSessionMinutes = {
  playerId: string;
  name: string;
  position: string | null;
  totalSeconds: number;
  activeSince: string | null;
  isActive: boolean;
};
