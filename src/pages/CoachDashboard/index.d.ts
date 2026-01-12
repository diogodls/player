import type {Icon} from "@fortawesome/fontawesome-svg-core";

export type CoachDashboard = {
  averageTeamCard: AverageTeamCard[];
}

export type AverageTeamCard = {
  name: string;
  color: string;
  value: string;
  icon: Icon;
}