import { Injectable } from '@nestjs/common';
import { Databases, Models, Query, Client, Permission, Role } from 'node-appwrite';
import { AppwriteService } from '../appwrite/appwrite.service';
import { UpdateDeviceInfoDto } from '../device/dto/update-device-info.dto';
import { UpdateContainerInfoDto } from '../container/dto/update-container-info.dto';
import { CreateContainerDto } from '../container/dto/create-container.dto';

@Injectable()
export class DatabaseService {
    private readonly dbId: string = process.env.APPWRITE_DATABASE_ID!;
    private readonly teamColId: string = process.env.TEAM_COLLECTION_ID!;
    private readonly userColId: string = process.env.USER_COLLECTION_ID!;
    private readonly deviceColId: string = process.env.DEVICE_COLLECTION_ID!;
    private readonly containerColId: string = process.env.CONTAINER_COLLECTION_ID!;
    private readonly invitationColId: string = process.env.INVITATION_COLLECTION_ID!;


    constructor(private readonly appwrite: AppwriteService) {
    }

    private databases(client: Client): Databases {
        return new Databases(client);
    }

    async fetchUsedOctets(teamId: string): Promise<Set<number>> {
        const docs = await this.listDevicesByTeamId(teamId);

        const set = new Set<number>();
        for (const doc of docs.documents) {
            const octet = Number(doc.ipBlock24.split('.')[2]);
            if (!isNaN(octet)) set.add(octet);
        }

        return set;
    }


    //async getRegistrationExpiresAt(client: Client, deviceId: string): Promise<Date> {
    //    const doc = await this.getDeviceById(client, deviceId);
    //    return new Date(doc.registrationExpiresAt);
    //}

    async getRegistrationExpiresAt(client: Client, deviceId: string): Promise<Date> {
        const doc = await this.getDeviceById(deviceId);
        return new Date(doc.registrationExpiresAt);
    }

    async updateDevice(deviceId: string, updateDeviceInfoDto:UpdateDeviceInfoDto): Promise<Models.Document> {
        const doc = await this.databases(this.appwrite.getServerClient()).updateDocument(
            this.dbId,
            this.deviceColId,
            deviceId,
            updateDeviceInfoDto
        );
        return doc;
    }

    async confirmDevice(client: Client, deviceId: string, userId: string, teamId: string, ipBlock24: string, date: Date): Promise<Models.Document> {
        const doc = await this.databases(client).updateDocument(
            this.dbId,
            this.deviceColId,
            deviceId,
            {
                "status": false,
                "ipBlock24": ipBlock24,
                "lastActivatedAt": date,
                "user": userId,
                "team": teamId,
                "address": "0.0.0.0",
                "confirmed": true
            },
            [
                Permission.read(Role.team(teamId)),
                Permission.delete(Role.team(teamId)),
                Permission.read(Role.user(userId)), 
                Permission.update(Role.user(userId)),  
                Permission.delete(Role.user(userId))
            ]
        )
        // console.log(doc);
        return doc;
    }

    async createDevice(expiresAt: Date, deviceId: string, deviceName: string): Promise<Models.Document> {
        //console.log(expiresAt);
        //console.log(deviceId);
        //console.log(deviceName);
        return this.databases(this.appwrite.getServerClient()).createDocument(
            this.dbId,
            this.deviceColId,
            deviceId,
            {   "name" : deviceName,
                "confirmed" : false,
                "registrationExpiresAt": expiresAt
            },
            [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
            ]
        )
    }

    async listDevicesByTeamId(teamId: string): Promise<Models.DocumentList<Models.Document>> {
        return this.databases(this.appwrite.getServerClient()).listDocuments(
            this.dbId,
            this.deviceColId,
            [Query.equal('team', teamId)],
        );
    }

    //async getDeviceById(client: Client, deviceId: string): Promise<Models.Document> {
    //    return this.databases(client).getDocument(
    //        this.dbId,
    //       this.deviceColId,
    //        deviceId,
    //    )
    //}

    async getDeviceById(deviceId: string): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).getDocument(
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

    //async getContainerById(client: Client, containerId: string): Promise<Models.Document> {
    //    return this.databases(client).getDocument(
    //        this.dbId,
    //        this.containerColId,
    //        containerId,
    //    )
    //}

    async getContainerById(containerId: string): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).getDocument(
            this.dbId,
            this.containerColId,
            containerId,
        )
    }

    async updateContainer(containerId: string, updateContainerInfoDto: UpdateContainerInfoDto): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).updateDocument(
            this.dbId,
            this.containerColId,
            containerId,
            updateContainerInfoDto
        );
    }

    async createContainer(containerId: string, createContainerDto: CreateContainerDto, teamId: string, userId: string, lastAccessed: Date): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).createDocument(
            this.dbId,
            this.containerColId,
            containerId,
            {
                "name": createContainerDto.name,
                "ip": createContainerDto.ip,
                "image": createContainerDto.image,
                "lastAccessed": lastAccessed,
                "team": teamId,
                "user": userId,
                "device": createContainerDto.deviceId
            }
        )
    }

    async delContainerById(containerId: string) {
        return this.databases(this.appwrite.getServerClient()).deleteDocument(
            this.dbId,
            this.containerColId,
            containerId
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

    async createInvitation(inviterId: string, inviteeId: string, teamId: string, inviteId: string): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).createDocument(
            this.dbId,
            this.invitationColId,
            inviteId,
            {   "status" : 'pending',
                "inviterId" : inviterId,
                "inviteeId": inviteeId,
                "team": teamId
            }
        )
    }

    async listInvitation(userId: string, status: string): Promise<Models.DocumentList<Models.Document>> {
        return this.databases(this.appwrite.getServerClient()).listDocuments(
            this.dbId,
            this.invitationColId,
            [
                Query.equal('inviteeId', userId),
                Query.equal('status', status)
            ]
        )
    }

    async handleInvitation(inviteId: string, status: string): Promise<Models.Document> {
        return this.databases(this.appwrite.getServerClient()).updateDocument(
            this.dbId,
            this.invitationColId,
            inviteId,
            {
                status: status
            }
        )
    }
}

