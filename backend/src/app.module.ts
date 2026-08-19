import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ActionCategoryEntity,
  AnalysisTypeEntity,
  CatalogActionEntity,
  ImpactEntity,
  PlayerEntity,
  PlayerSessionMinutesEntity,
  PositionEntity,
  PreferredSideEntity,
  SessionCourtSizeEntity,
  SessionEntity,
  SessionLocationEntity,
  SessionTypeEntity,
  TaggedActionEntity,
  TeamActionContextEntity,
  TeamEntity,
  UserEntity,
} from './entities';
import { PlayersModule } from './players/players.module';
import { SessionsModule } from './sessions/sessions.module';
import { CatalogModule } from './catalog/catalog.module';
import { TaggedActionsModule } from './tagged-actions/tagged-actions.module';
import { CoachDashboardModule } from './coach-dashboard/coach-dashboard.module';
import { AuthModule } from './auth/auth.module';
import { PlayerSessionMinutesModule } from './player-session-minutes/player-session-minutes.module';

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
        SessionCourtSizeEntity,
        PositionEntity,
        PreferredSideEntity,
        PlayerEntity,
        PlayerSessionMinutesEntity,
        SessionEntity,
        AnalysisTypeEntity,
        ImpactEntity,
        ActionCategoryEntity,
        CatalogActionEntity,
        TeamActionContextEntity,
        TaggedActionEntity,
        UserEntity,
      ],
      synchronize: false,
      migrations: [__dirname + '/migrations/!(*.spec){.ts,.js}'],
      migrationsRun: true,
      logging: false,
    }),
    AuthModule,
    PlayersModule,
    SessionsModule,
    CatalogModule,
    TaggedActionsModule,
    CoachDashboardModule,
    PlayerSessionMinutesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
