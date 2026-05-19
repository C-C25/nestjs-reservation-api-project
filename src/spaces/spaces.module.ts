import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesEntity } from './entities/spaces.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpacesEntity]),
  ],
  exports: [SpacesService],
  controllers: [SpacesController],
  providers: [SpacesService],
})
export class SpacesModule { }
