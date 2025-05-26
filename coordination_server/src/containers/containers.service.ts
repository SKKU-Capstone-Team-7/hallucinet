import { Injectable } from '@nestjs/common';
import { ContainerInfoDto } from './container-info.dto';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DeviceInfoDto } from 'src/devices/device-info.dto';
import { Client, Databases, ID, Query } from 'node-appwrite';
import { ConfigService } from '@nestjs/config';
import { CreateContainerDto } from './create-container.dto';

@Injectable()
export class ContainersService {
  readonly deviceCollectionId: string;
  readonly databaseId: string;
  readonly teamCollectionId: string;
  readonly containerCollectionId: string;
  client: Client;
  databases: Databases;

  constructor(
    private readonly appwriteService: AppwriteService,
    private readonly configService: ConfigService,
  ) {
    this.databaseId = configService.getOrThrow('APPWRITE_DATABASE_ID');
    this.deviceCollectionId = configService.getOrThrow('DEVICE_COLLECTION_ID');
    this.teamCollectionId = configService.getOrThrow('TEAM_COLLECTION_ID');
    this.containerCollectionId = configService.getOrThrow(
      'CONTAINER_COLLECTION_ID',
    );
    this.client = this.appwriteService.getServerClient();
    this.databases = new Databases(this.client);
  }

  async getContainers(deviceId: string): Promise<ContainerInfoDto[]> {
    const { documents } = await this.databases.listDocuments(
      this.databaseId,
      this.containerCollectionId,
      [Query.equal('device', [deviceId])],
    );
    const dtos: ContainerInfoDto[] = [];

    for (const doc of documents) {
      dtos.push(
        new ContainerInfoDto({
          name: doc['name'],
          address: doc['ip'],
          device: new DeviceInfoDto({
            name: doc['device']['name'],
            subnet: doc['device']['ipBlock24'] + '/24',
            address: doc['device']['address'],
          }),
        }),
      );
    }

    return dtos;
  }

  async createContainers(
    deviceId: string,
    dto: CreateContainerDto,
  ): Promise<CreateContainerDto> {
    const deviceDoc = await this.databases.getDocument(
      this.databaseId,
      this.deviceCollectionId,
      deviceId,
    );

    let doc = await this.databases.createDocument(
      this.databaseId,
      this.containerCollectionId,
      ID.unique(),
      {
        name: dto.name,
        ip: dto.ip,
        image: dto.image,
        team: deviceDoc.team['$id'],
        user: deviceDoc.user['$id'],
        device: deviceId,
      },
    );

    return dto;
  }
}
