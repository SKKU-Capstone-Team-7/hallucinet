import { Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Account, Client, Databases, ID, Query } from 'node-appwrite';
import { CreateContainerDto } from 'src/events/create-container.dto';

@Injectable()
export class AppwriteService {
  private endpoint: string;
  private project: string;
  private apiKey: string;
  private dbId: string;
  private deviceCol: string;
  private containerCol: string;
  private serverClient: Client;

  constructor(private configService: ConfigService) {
    this.endpoint = configService.get<string>('APPWRITE_ENDPOINT')!;
    this.project = configService.get<string>('APPWRITE_PROJECT')!;
    this.apiKey = configService.get<string>('APPWRITE_API_KEY')!;
    this.dbId = configService.get<string>('APPWRITE_DATABASE_ID')!;
    this.deviceCol = configService.get<string>('DEVICE_COLLECTION_ID')!;
    this.containerCol = configService.get<string>('CONTAINER_COLLECTION_ID')!;
  }

  getServerClient(): Client {
    if (this.serverClient) {
      return this.serverClient;
    }

    const client = new Client();

    client
      .setEndpoint(this.endpoint)
      .setProject(this.project)
      .setKey(this.apiKey);

    this.serverClient = client;
    return client;
  }

  async getDevice(id: string) {
    const db = new Databases(this.getServerClient());
    const doc = await db.getDocument(this.dbId, this.deviceCol, id);
    return doc;
  }

  async createContainer(dto: CreateContainerDto) {
    const db = new Databases(this.getServerClient());
    return await db.createDocument(
      this.dbId,
      this.containerCol,
      ID.unique(),
      dto,
    );
  }

  async deleteContainer(deviceId: string, containerName: string) {
    const db = new Databases(this.getServerClient());
    const containerDocs = await db.listDocuments(this.dbId, this.containerCol, [
      Query.equal('device', deviceId),
      Query.equal('name', containerName),
    ]);

    return await db.deleteDocument(
      this.dbId,
      this.containerCol,
      containerDocs.documents[0]['$id'],
    );
  }

  async clearDeviceContainers(deviceId: string) {
    const db = new Databases(this.getServerClient());
    const containerDocs = await db.listDocuments(this.dbId, this.containerCol, [
      Query.equal('device', deviceId),
    ]);

    containerDocs.documents.forEach((doc) => {
      db.deleteDocument(this.dbId, this.containerCol, doc['$id']);
    });
  }

  async getTeamContainers(teamId: string) {
    const db = new Databases(this.getServerClient());
    const containerDocs = await db.listDocuments(this.dbId, this.containerCol, [
      Query.equal('team', teamId),
    ]);

    return containerDocs;
  }

  async touchDeviceActivationTime(deviceId: string) {
    const db = new Databases(this.getServerClient());
    await db.updateDocument(this.dbId, this.deviceCol, deviceId, {
      lastActivatedAt: new Date(),
    });
  }
}
