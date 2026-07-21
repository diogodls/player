import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaggedActionEntity } from '../entities';
import { TaggedActionsController } from './tagged-actions.controller';
import { TaggedActionsService } from './tagged-actions.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaggedActionEntity])],
  controllers: [TaggedActionsController],
  providers: [TaggedActionsService],
})
export class TaggedActionsModule {}
