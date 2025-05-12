import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { AppwriteModule } from './appwrite/appwrite.module';

@Module({
  imports: [DevicesModule, AppwriteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
