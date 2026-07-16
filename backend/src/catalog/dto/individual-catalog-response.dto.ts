export type CatalogImpact = 'POSITIVE' | 'NEGATIVE';

export class IndividualCatalogActionDto {
  id!: string;
  key!: string;
  name!: string;
  impact!: CatalogImpact;
  order!: number;
}

export class IndividualCatalogGroupDto {
  key!: string;
  title!: string;
  order!: number;
  actions!: IndividualCatalogActionDto[];
}

export class IndividualCatalogResponseDto {
  analysisType!: 'INDIVIDUAL';
  groups!: IndividualCatalogGroupDto[];
}

export class TeamCatalogResponseDto {
  analysisType!: 'TEAM';
  groups!: IndividualCatalogGroupDto[];
}
