import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { AppwriteModule } from 'src/appwrite/appwrite.module';
import { TokenModule } from 'src/token/token.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AppwriteModule, TokenModule, ConfigModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
