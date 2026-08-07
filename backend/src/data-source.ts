import { DataSource } from 'typeorm';
import {
  ActionCategoryEntity,
  AnalysisTypeEntity,
  CatalogActionEntity,
  ImpactEntity,
  PlayerEntity,
  PositionEntity,
  PreferredSideEntity,
  SessionCourtSizeEntity,
  SessionEntity,
  SessionLocationEntity,
  SessionTypeEntity,
  TaggedActionEntity,
  TeamEntity,
} from './entities';

export const databaseEntities = [
  TeamEntity,
  SessionTypeEntity,
  SessionLocationEntity,
  SessionCourtSizeEntity,
  PositionEntity,
  PreferredSideEntity,
  PlayerEntity,
  SessionEntity,
  AnalysisTypeEntity,
  ImpactEntity,
  ActionCategoryEntity,
  CatalogActionEntity,
  TaggedActionEntity,
];

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'player',
  password: process.env.DATABASE_PASSWORD ?? 'player',
  database: process.env.DATABASE_NAME ?? 'player',
  entities: databaseEntities,
  migrations: [__dirname + '/migrations/!(*.spec){.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  logging: false,
});
