export type NumericKeys<T> = {
  [Key in keyof T]-?: Exclude<T[Key], undefined> extends number ? Key : never;
}[keyof T];

export type RankingPlayerBase = {
  id?: number | string;
  name: string;
  position: string;
};
