import type {Player} from "../CoachDashboard";

export type ActionTagged = {
  id: string;
  time: string;
  title: string;
  type: "good" | "bad" | "neutral";
  player: Player;
};