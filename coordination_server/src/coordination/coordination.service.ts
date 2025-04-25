import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'node-appwrite';
import { pid } from 'process';
import { DeviceCoordInfo } from './device-coord-info.dto';

@Injectable()
export class CoordinationService {
  constructor(private config: ConfigService) {}

  private getAppwriteClient(): Client {
    let projectId = this.config.getOrThrow('APPWRITE_PROJECT_ID');
    let endpoint = this.config.getOrThrow('APPWRITE_PROJECT_ID');
    let key = this.config.getOrThrow('APPWRITE_API_KEY');

    let client = new Client()
      .setProject(projectId)
      .setEndpoint(endpoint)
      .setKey(key);
    return client;
  }

  getDevices(): DeviceCoordInfo[] {
    return [
      { address: '192.168.100.100', publicKey: '', subnet: '10.21.1.0/24' },
      { address: '192.168.100.200', publicKey: '', subnet: '10.21.2.0/24' },
    ];
  }
}
