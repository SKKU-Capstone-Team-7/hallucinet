import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { AppwriteModule } from './appwrite/appwrite.module';
import { ContainersModule } from './containers/containers.module';
import { ControllerService } from './controller/controller.service';

@Module({
  imports: [DevicesModule, AppwriteModule, ContainersModule],
  controllers: [AppController],
  providers: [AppService, ControllerService],
})
export class AppModule {}
