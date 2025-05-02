import { Injectable } from '@nestjs/common';
import { ContainerInfoDto } from './container-info.dto';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DeviceInfoDto } from 'src/devices/device-info.dto';

@Injectable()
export class ContainersService {
  constructor(private readonly appwriteService: AppwriteService) {}
  async getContainers(): Promise<ContainerInfoDto[]> {
    const client = this.appwriteService.getServerClient();

    return [
      new ContainerInfoDto({
        name: 'containerOne',
        address: '10.2.1.3',
        device: new DeviceInfoDto({
          name: 'clientA',
          subnet: '10.2.1.0/24',
          address: '192.168.100.2',
        }),
      }),
      new ContainerInfoDto({
        name: 'containerTwo',
        address: '10.2.2.3',
        device: new DeviceInfoDto({
          name: 'clientB',
          subnet: '10.2.2.0/24',
          address: '192.168.100.3',
        }),
      }),
    ];
  }
}
