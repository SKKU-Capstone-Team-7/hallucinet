import { Injectable } from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Injectable()
export class DevicesService {
  constructor(private readonly appwriteService: AppwriteService) {}
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
