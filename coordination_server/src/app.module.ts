import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { AppwriteModule } from './appwrite/appwrite.module';
import { ContainersModule } from './containers/containers.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DevicesModule,
    AppwriteModule,
    ContainersModule,
    AuthModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
