import { Module } from '@nestjs/common';
import { AppwriteService } from './appwrite.service';
import { AppwriteController } from './appwrite.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AppwriteService],
  controllers: [AppwriteController],
  exports: [AppwriteService],
})
export class AppwriteModule {}
