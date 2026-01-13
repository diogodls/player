export type CoachDashboardData = {
  averageTeamCards: TeamCard[];
  players: Player[];
}

export type AverageCard = {
  name: string;
  color: string;
  value: string;
  icon: string;
}

export type Player = {
  id: number;
  name: string;
  overall: number;
  position: string;
  minutes: number;
  defensiveActions: number;
  offensiveActions: number;
  goalsTaken: number;
  goals: number;
}