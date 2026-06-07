import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ActionCategoryEntity,
  AnalysisTypeEntity,
  CatalogActionEntity,
  ImpactEntity,
  OpponentEntity,
  PlayerEntity,
  PositionEntity,
  PreferredSideEntity,
  SessionEntity,
  SessionLocationEntity,
  SessionTypeEntity,
  TaggedActionEntity,
  TeamEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5432),
      username: process.env.DATABASE_USER ?? 'player',
      password: process.env.DATABASE_PASSWORD ?? 'player',
      database: process.env.DATABASE_NAME ?? 'player',
      entities: [
        TeamEntity,
        SessionTypeEntity,
        SessionLocationEntity,
        PositionEntity,
        PreferredSideEntity,
        OpponentEntity,
        PlayerEntity,
        SessionEntity,
        AnalysisTypeEntity,
        ImpactEntity,
        ActionCategoryEntity,
        CatalogActionEntity,
        TaggedActionEntity,
      ],
      synchronize: false,
      logging: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
