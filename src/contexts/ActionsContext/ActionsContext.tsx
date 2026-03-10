import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode, useMemo,
} from "react";
import type {Player} from "../../pages/CoachDashboard";
import type {ActionTagged} from "../../pages/Analysis";

type ActionsContextValue = {
  selectedPlayer: Player | null;
  setSelectedPlayer: Dispatch<SetStateAction<Player | null>>;
  actions: ActionTagged[];
  setActions: Dispatch<SetStateAction<ActionTagged[]>>;
  actionTagged: ActionTagged | null;
  setActionTagged: Dispatch<SetStateAction<ActionTagged | null>>;
  currentVideoTime: string;
  setCurrentVideoTime: Dispatch<SetStateAction<string>>;
  isTagging: boolean;
  setIsTagging: Dispatch<SetStateAction<boolean>>;
};

type ActionsProviderProps = {
  children: ReactNode;
};

const ActionsContext = createContext<ActionsContextValue>({} as ActionsContextValue);

const ActionsProvider = ({children}: ActionsProviderProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [actions, setActions] = useState<ActionTagged[]>([]);
  const [actionTagged, setActionTagged] = useState<ActionTagged | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState('0');
  const [isTagging, setIsTagging] = useState(false);

  const value = useMemo(
    () => ({
      selectedPlayer,
      setSelectedPlayer,
      actions,
      setActions,
      actionTagged,
      setActionTagged,
      currentVideoTime,
      setCurrentVideoTime,
      isTagging,
      setIsTagging
    }),
    [selectedPlayer, actions, actionTagged, currentVideoTime, isTagging]
  );

  return (
    <ActionsContext.Provider value={value}>
      {children}
    </ActionsContext.Provider>
  );
};

export {ActionsContext, ActionsProvider};