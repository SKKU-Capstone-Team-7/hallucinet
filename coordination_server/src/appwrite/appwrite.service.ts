import { Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Account, Client } from 'node-appwrite';

@Injectable()
export class AppwriteService {
  private endpoint: string;
  private project: string;
  private apiKey: string;
  private serverClient: Client;

  constructor(private configService: ConfigService) {
    this.endpoint = configService.get<string>('APPWRITE_ENDPOINT')!;
    this.project = configService.get<string>('APPWRITE_PROJECT')!;
    this.apiKey = configService.get<string>('APPWRITE_API_KEY')!;
  }

  getServerClient(): Client {
    if (this.serverClient) {
      return this.serverClient;
    }

    const client = new Client();

    client
      .setEndpoint(this.endpoint)
      .setProject(this.project)
      .setKey(this.apiKey);

    this.serverClient = client;
    return client;
  }
}
