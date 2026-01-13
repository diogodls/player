import type {Icon} from "@fortawesome/fontawesome-svg-core";

export type CoachDashboard = {
  averageTeamCards: TeamCard[];
}

export type TeamCard = {
  name: string;
  color: string;
  value: string;
  icon: Icon;
}