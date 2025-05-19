import { Injectable } from '@nestjs/common';
import { Account, Client } from 'node-appwrite';

@Injectable()
export class AppwriteService {
  private readonly endpoint: string = process.env.APPWRITE_ENDPOINT!;
  private readonly project: string = process.env.APPWRITE_PROJECT!;
  private readonly apiKey: string = process.env.APPWRITE_API_KEY!;
  private serverClient: Client;

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
