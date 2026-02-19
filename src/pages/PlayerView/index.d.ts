import type {Player, Team} from "../CoachDashboard";

export type PlayerViewData = {
  player: Player;
  team: Team;
  metrics: string[];
}