export class TaggedActionResponseDto {
  id!: string;
  sessionId!: string;
  catalogActionId!: string;
  playerId!: string | null;
  teamContextId!: string | null;
  timestampSeconds!: number;
}

export class CreateSessionActionsResponseDto {
  actions!: TaggedActionResponseDto[];
}
