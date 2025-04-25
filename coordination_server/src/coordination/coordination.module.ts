import { Module } from '@nestjs/common';
import { CoordinationController } from './coordination.controller';
import { CoordinationService } from './coordination.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CoordinationController],
  providers: [CoordinationService],
})
export class CoordinationModule {}
