import { Injectable } from '@nestjs/common';
import { Databases, Models, Query } from 'node-appwrite';
import { AppwriteService } from '../appwrite/appwrite.service';

@Injectable()
export class DatabaseService {
    private readonly databases: Databases;
    private readonly dbId: string = process.env.APPWRITE_DATABASE_ID!;
    private readonly teamColId: string = process.env.TEAM_COLLECTION_ID!;
    private readonly userColId: string = process.env.USER_COLLECTION_ID!;
    private readonly deviceColId: string = process.env.DEVICE_COLLECTION_ID!;
    private readonly containerColId: string = process.env.CONTAINER_COLLECTION_ID!;


    constructor(private readonly appwrite: AppwriteService) {
        this.databases = new Databases(this.appwrite.getServerClient());
    }

    async listDevicesByTeamId(teamId: string): Promise<Models.DocumentList<Models.Document>> {
        return this.databases.listDocuments(
            this.dbId,
            this.deviceColId,
            [Query.equal('team', teamId)],
        );
    }
}