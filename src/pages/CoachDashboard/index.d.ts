export type CoachDashboardData = {
  averageTeamCards: TeamCard[];
  players: Player[];
}

export type TeamCard = {
  name: string;
  color: string;
  value: string;
  icon: string;
}

export type Player = {
  id: string;
  name: string;
  position: string;
  overall: number;
  off: number;
  def: number;
};