import { uid } from "uid";
import type {
  ActionTagged,
  CatalogAction,
  CatalogGroup,
  TeamActionContext,
} from "../../../pages/Analysis";
import type { Session } from "../../../pages/Sessions";

export function createTeamTaggedAction(
  action: CatalogAction,
  group: CatalogGroup,
  context: TeamActionContext,
  session: Session,
  capturedTime: string,
): ActionTagged {
  return {
    id: uid(),
    sessionId: session.id,
    catalogActionId: action.id,
    teamContextId: context.id,
    goodAction: action.impact === "POSITIVE",
    impact: action.impact,
    title: action.name,
    key: action.key,
    category: group.title,
    contextName: context.name,
    time: capturedTime,
    type: "team",
  };
}
