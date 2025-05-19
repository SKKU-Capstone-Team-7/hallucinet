import { Injectable } from '@nestjs/common';
import { Client } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DeviceInfoDto } from './device-info.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly appwriteService: AppwriteService) {}

  async getDevices(): Promise<DeviceInfoDto[]> {
    const client = this.appwriteService.getServerClient();

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
