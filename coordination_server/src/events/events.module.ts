import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TokenModule } from 'src/token/token.module';
import { AppwriteModule } from 'src/appwrite/appwrite.module';

@Module({
  imports: [TokenModule, AppwriteModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
