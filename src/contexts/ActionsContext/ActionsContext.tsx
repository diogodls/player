import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode, useMemo,
} from "react";
import type {Player} from "../../pages/CoachDashboard";
import type {ActionTagged} from "../../pages/IndividualAnalysis";
import type {TeamActionTagged} from "../../pages/TeamAnalysis";

type ActionsContextValue = {
  selectedPlayer: Player | null;
  setSelectedPlayer: Dispatch<SetStateAction<Player | null>>;
  actions: ActionTagged[];
  setActions: Dispatch<SetStateAction<ActionTagged[]>>;
  teamActions: TeamActionTagged[];
  setTeamActions: Dispatch<SetStateAction<TeamActionTagged[]>>;
  actionTagged: ActionTagged | null;
  setActionTagged: Dispatch<SetStateAction<ActionTagged | null>>;
};

type ActionsProviderProps = {
  children: ReactNode;
};

const ActionsContext = createContext<ActionsContextValue>({} as ActionsContextValue);

const ActionsProvider = ({children}: ActionsProviderProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [actions, setActions] = useState<ActionTagged[]>([]);
  const [teamActions, setTeamActions] = useState<TeamActionTagged[]>([]);
  const [actionTagged, setActionTagged] = useState<ActionTagged | null>(null);

  const value = useMemo(
    () => ({
      selectedPlayer,
      setSelectedPlayer,
      actions,
      setActions,
      teamActions,
      setTeamActions,
      actionTagged,
      setActionTagged,
    }),
    [selectedPlayer, actions, actionTagged, teamActions]
  );

  return (
    <ActionsContext.Provider value={value}>
      {children}
    </ActionsContext.Provider>
  );
};

export {ActionsContext, ActionsProvider};