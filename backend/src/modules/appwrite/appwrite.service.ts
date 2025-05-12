import { Injectable } from '@nestjs/common';
import { Account, Client } from 'node-appwrite';

@Injectable()
export class AppwriteService {
    private readonly endpoint: string = process.env.APPWRITE_ENDPOINT!;
    private readonly project: string = process.env.APPWRITE_PROJECT!;
    private readonly apiKey: string = process.env.APPWRITE_API_KEY!;
    private serverClient: Client;

    constructor() {
        // new appwrite server client 
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
