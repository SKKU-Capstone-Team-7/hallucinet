import { Injectable, Req } from '@nestjs/common';
import { Client, Databases, Query } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DeviceInfoDto } from './device-info.dto';
import { ConfigService } from '@nestjs/config';
import { json } from 'stream/consumers';

@Injectable()
export class DevicesService {
  readonly deviceCollectionId: string;
  readonly databaseId: string;
  readonly teamCollectionId: string;

  constructor(
    private readonly appwriteService: AppwriteService,
    private readonly configService: ConfigService,
  ) {
    this.deviceCollectionId = configService.getOrThrow('DEVICE_COLLECTION_ID');
    this.teamCollectionId = configService.getOrThrow('TEAM_COLLECTION_ID');
    this.databaseId = configService.getOrThrow('APPWRITE_DATABASE_ID');
  }

  async getDevices(deviceId: string): Promise<DeviceInfoDto[]> {
    const client = this.appwriteService.getServerClient();
    const databases = new Databases(client);

    const deviceDoc = await databases.listDocuments(
      this.databaseId,
      this.deviceCollectionId,
      [Query.equal('$id', [deviceId])],
    );

    const teamId = deviceDoc.documents[0].team['$id'];
    const teamDevicesDocs = await databases.listDocuments(
      this.databaseId,
      this.deviceCollectionId,
      [Query.equal('team', [teamId])],
    );

    console.log(teamDevicesDocs);

    return [
      new DeviceInfoDto({
        name: 'clientA',
        subnet: '10.2.1.0/24',
        address: '192.168.100.2',
      }),
      new DeviceInfoDto({
        name: 'clientB',
        subnet: '10.2.2.0/24',
        address: '192.168.100.3',
      }),
    ];
  }
}

// async listDevices(client: Client,): Promise<DeviceInfoDto[]> {
//         const user = await this.userService.getCurrentUser(client);
//         const team = await this.teamService.getMyTeam(client);
//
//         const { documents } = await this.databaseService.listDevicesByTeamId(team.$id);
//
//         console.log(documents);
//
//         return documents.map(doc => new DeviceInfoDto({
//             $id: doc.$id,
//             name: doc.name,
//             status: doc.status,
//             ipBlock24: doc.ipBlock24,
//             user: user,
//             lastActivatedAt: doc.lastActivatedAt,
//             teamId: team.$id
//         }));
//     }
