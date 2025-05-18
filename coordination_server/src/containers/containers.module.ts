import { Module } from '@nestjs/common';
import { ContainersController } from './containers.controller';
import { ContainersService } from './containers.service';
import { AppwriteModule } from 'src/appwrite/appwrite.module';
import { TokenModule } from 'src/token/token.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AppwriteModule, TokenModule, ConfigModule],
  controllers: [ContainersController],
  providers: [ContainersService],
  exports: [ContainersService],
})
export class ContainersModule {}
