import {
  createContext,
  useState,
  useMemo,
  type Dispatch,
  type SetStateAction,
  type ReactNode, type RefObject, useRef,
} from "react";
import type {Player} from "../../pages/CoachDashboard";
import type {ActionTagged} from "../../pages/Analysis";

type ActionsContextValue = {
  selectedPlayer: Player | null;
  setSelectedPlayer: Dispatch<SetStateAction<Player | null>>;
  individualActions: ActionTagged[];
  setIndividualActions: Dispatch<SetStateAction<ActionTagged[]>>;
  teamActions: ActionTagged[];
  setTeamActions: Dispatch<SetStateAction<ActionTagged[]>>;
  actionTagged: ActionTagged | null;
  setActionTagged: Dispatch<SetStateAction<ActionTagged | null>>;
  currentVideoTime: string;
  setCurrentVideoTime: Dispatch<SetStateAction<string>>;
  isTagging: boolean;
  setIsTagging: Dispatch<SetStateAction<boolean>>;
  videoRef: RefObject<HTMLVideoElement | null>
};

type ActionsProviderProps = {
  children: ReactNode;
};

const ActionsContext = createContext<ActionsContextValue>({} as ActionsContextValue);

const ActionsProvider = ({children}: ActionsProviderProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [individualActions, setIndividualActions] = useState<ActionTagged[]>([]);
  const [teamActions, setTeamActions] = useState<ActionTagged[]>([]);
  const [actionTagged, setActionTagged] = useState<ActionTagged | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState('0');
  const [isTagging, setIsTagging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const value = useMemo(
    () => ({
      selectedPlayer,
      setSelectedPlayer,
      individualActions,
      setIndividualActions,
      teamActions,
      setTeamActions,
      actionTagged,
      setActionTagged,
      currentVideoTime,
      setCurrentVideoTime,
      isTagging,
      setIsTagging,
      videoRef
    }),
    [
      selectedPlayer,
      individualActions,
      teamActions,
      actionTagged,
      currentVideoTime,
      isTagging,
      videoRef,
    ]
  );

  return (
    <ActionsContext.Provider value={value}>
      {children}
    </ActionsContext.Provider>
  );
};

export {ActionsContext, ActionsProvider};