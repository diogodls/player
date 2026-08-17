export type CatalogImpact = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export class CatalogActionDto {
  id!: string;
  key!: string;
  name!: string;
  impact!: CatalogImpact;
  order!: number;
}

export class TeamActionContextDto {
  id!: string;
  key!: string;
  name!: string;
  order!: number;
}

export class CatalogGroupDto {
  key!: string;
  title!: string;
  order!: number;
  actions!: CatalogActionDto[];
  contexts?: TeamActionContextDto[];
}

export class IndividualCatalogResponseDto {
  analysisType!: 'INDIVIDUAL';
  groups!: CatalogGroupDto[];
}

export class TeamCatalogResponseDto {
  analysisType!: 'TEAM';
  groups!: CatalogGroupDto[];
}
