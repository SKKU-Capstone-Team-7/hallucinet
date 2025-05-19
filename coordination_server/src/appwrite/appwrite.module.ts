import { Module } from '@nestjs/common';
import { AppwriteService } from './appwrite.service';
import { AppwriteController } from './appwrite.controller';

@Module({
  providers: [AppwriteService],
  controllers: [AppwriteController],
  exports: [AppwriteService],
})
export class AppwriteModule {}
