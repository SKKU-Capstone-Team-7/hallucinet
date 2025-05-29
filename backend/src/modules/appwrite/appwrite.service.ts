import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account, Client } from 'node-appwrite';

@Injectable()
export class AppwriteService {
    private readonly endpoint
    private readonly project
    private readonly apiKey
    private serverClient: Client;

    constructor(private configService: ConfigService) {
        // new appwrite server client 
        this.endpoint = this.configService.get<string>('APPWRITE_ENDPOINT');
        if (!this.endpoint) throw new Error('APPWRITE_ENDPOINT is not defined'); 
        this.project = this.configService.get<string>('APPWRITE_PROJECT');
        if (!this.project) throw new Error('APPWRITE_PROJECT is not defined'); 
        this.apiKey = this.configService.get<string>('APPWRITE_API_KEY');
        if (!this.apiKey) throw new Error('APPWRITE_API_KEY is not defined'); 
        this.serverClient = new Client()
            .setEndpoint(this.endpoint)
            .setProject(this.project)
            .setKey(this.apiKey);
    }

    /**
       * Returns an Appwrite client using the user's JWT.
       * This client operates within the user's permission scope after client-side login.
       */
    getClient(jwtToken: string): Client {
        return new Client()
            .setEndpoint(this.endpoint)
            .setProject(this.project)
            .setJWT(jwtToken);
    }

    /**
       * Returns a server-only client.
       * It is initialized using sensitive information like the API key,
       * and can operate with higher privileges (e.g. admin rights) compared to a user JWT.
       */
    getServerClient(): Client {
        return this.serverClient;
    }
}
