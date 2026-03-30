type Session = {
  id: number; //unique identifier for the session
  type: SessionType; //the type of session, e.g., "Treino" or "Jogo"
  date: string; //the date when the session took place
  local: string; //the location where the session took place
  description?: string; //a brief description of the session (optional, only for "Treino" type)
  opponent?: string; //the opponent team (optional, only for "Jogo" type)
  players: SessionAnalysisItem[]; //the list of players involved in the session, along with their actions and metrics
  totalIndividualPositiveActions: number; //the total number of positive actions performed by all players in the session
  totalIndividualNegativeActions: number; //the total number of negative actions performed by all players in the session
  team: SessionAnalysisItem; //the team involved in the session, along with its actions and metrics
  totalTeamPositiveActions: number; //the total number of positive actions performed by the team in the session
  totalTeamNegativeActions: number; //the total number of negative actions performed by the team in the session
}

interface SessionAnalysisItem extends Item {
  actions: SessionItemAction;
}

type SessionItemAction = {
  key: string; //the type of action performed in the session, e.g., "GM" or "PP"
  label: string; //the action performed in the session, e.g., "Passe Certo", "Falta Cometida", etc.
  time: string; //the time when the action was performed in the session
  category: string; //offensive or defensive
  goodAction: boolean; //good or bad action
}

type Item = {
  name: string; //the name of the player or team
  totalOffensiveActions: number; //the total number of offensive actions performed by the player or team in the session
  totalDefensiveActions: number; //the total number of defensive actions performed by the player or team in the session
}