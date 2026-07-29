import { uid } from "uid";
import type {
  ActionTagged,
  AnalysisPlayer,
  CatalogAction,
} from "../../../pages/Analysis";
import type { Session } from "../../../pages/Sessions";

export function createIndividualTaggedAction(
  action: CatalogAction,
  category: string,
  session: Session,
  player: AnalysisPlayer | null,
  time: string,
): ActionTagged {
  return {
    id: uid(),
    catalogActionId: action.id,
    sessionId: session.id,
    goodAction: action.impact === "POSITIVE",
    impact: action.impact,
    title: action.name,
    key: action.key,
    category,
    time,
    type: "individual",
    player: player ?? undefined,
  };
}
