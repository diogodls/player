export type CoachDashboardData = {
  averageTeamCards: AverageCard[];
  players: Player[];
  metrics: string[];
};

export type AverageCard = {
  name: string;
  color: string;
  value: string;
  icon: string;
};

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
};

export type Team = {
  defensiveActions: number;
  offensiveActions: number;
}