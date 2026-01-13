export type CoachDashboard = {
  averageTeamCards: TeamCard[];
}

export type TeamCard = {
  name: string;
  color: string;
  value: string;
  icon: string;
}