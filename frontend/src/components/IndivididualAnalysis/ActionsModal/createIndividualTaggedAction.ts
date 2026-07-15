import { uid } from 'uid';
import type { ActionTagged, IndividualCatalogAction } from '../../../pages/Analysis';
import type { Player } from '../../../pages/CoachDashboard';
import type { Session } from '../../../pages/Sessions';

export function createIndividualTaggedAction(
  action: IndividualCatalogAction,
  category: string,
  session: Session,
  player: Player | null,
  time: string,
): ActionTagged {
  return {
    id: uid(),
    sessionId: session.id,
    goodAction: action.impact === 'POSITIVE',
    title: action.name,
    key: action.key,
    category,
    time,
    type: 'individual',
    player: player ?? undefined,
  };
}
