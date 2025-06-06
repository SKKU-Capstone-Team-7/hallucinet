import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TokenModule } from 'src/token/token.module';
import { AppwriteModule } from 'src/appwrite/appwrite.module';
import { ContainersModule } from 'src/containers/containers.module';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [TokenModule, AppwriteModule, ContainersModule, DevicesModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
