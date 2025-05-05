import { Injectable } from '@nestjs/common';
import { Databases, Models, Query, Client } from 'node-appwrite';
import { AppwriteService } from '../appwrite/appwrite.service';

@Injectable()
export class DatabaseService {
    private readonly dbId: string = process.env.APPWRITE_DATABASE_ID!;
    private readonly teamColId: string = process.env.TEAM_COLLECTION_ID!;
    private readonly userColId: string = process.env.USER_COLLECTION_ID!;
    private readonly deviceColId: string = process.env.DEVICE_COLLECTION_ID!;
    private readonly containerColId: string = process.env.CONTAINER_COLLECTION_ID!;


    constructor(private readonly appwrite: AppwriteService) {
    }

    private databases(client: Client): Databases {
        return new Databases(client);
    }

    async listDevicesByTeamId(teamId: string): Promise<Models.DocumentList<Models.Document>> {
        return this.databases(this.appwrite.getServerClient()).listDocuments(
            this.dbId,
            this.deviceColId,
            [Query.equal('team', teamId)],
        );
    }

    async getDeviceById(client: Client, deviceId: string): Promise<Models.Document> {
        return this.databases(client).getDocument(
            this.dbId,
            this.deviceColId,
            deviceId,
        )
    }

    async listContainersByTeamId(teamId: string, sort: string, order: string, limit: number): Promise<Models.DocumentList<Models.Document>> {
        const orderQuery = order === 'asc'
            ? Query.orderAsc(sort)
            : Query.orderDesc(sort);
        return this.databases(this.appwrite.getServerClient()).listDocuments(
            this.dbId,
            this.containerColId,
            [
                Query.equal('team', teamId),
                orderQuery,
                Query.limit(limit)
            ]
        )
    }

    async getContainerById(client: Client, containerId: string): Promise<Models.Document> {
        return this.databases(client).getDocument(
            this.dbId,
            this.containerColId,
            containerId,
        )
    }

    async registerTeamId(teamId: string): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).createDocument(
            this.dbId,
            this.teamColId,
            teamId,
            {},
        )
    }

    async registerUserId(userId: string): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).createDocument(
            this.dbId,
            this.userColId,
            userId,
            {}
        )
    }
}

