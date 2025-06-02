import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { CreateContainerDto } from './create-container.dto';
import { TokenService } from 'src/token/token.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { Databases } from 'node-appwrite';

type UserIdentifier = {
  userId: string;
  teamId: string;
  deviceId: string;
};

@WebSocketGateway({ path: 'events' })
export class EventsGateway {
  constructor(
    private tokenService: TokenService,
    private appwriteService: AppwriteService,
  ) {}

  async identifyUser(payload: string): Promise<UserIdentifier> {
    const token = payload['token'];
    const tokenData = this.tokenService.decodeToken(token);
    const deviceId = tokenData['deviceId'];
    const doc = await this.appwriteService.getDevice(deviceId);
    return {
      userId: doc['user']['$id'],
      teamId: doc['team']['$id'],
      deviceId: deviceId,
    };
  }

  @SubscribeMessage('container_connected')
  async handleContainerConnected(client: any, payload: any) {
    const id = await this.identifyUser(payload);
    const dto = new CreateContainerDto({
      name: payload['event']['container_name'],
      ip: payload['event']['container_ip'],
      image: payload['event']['container_image'],
      user: id.userId,
      team: id.teamId,
      device: id.deviceId,
      lastAccessed: new Date().toISOString(),
    });

    return this.appwriteService.createContainer(dto);
  }
  @SubscribeMessage('container_disconnected')
  async handleContainerDisconnected(client: any, payload: any) {
    const id = await this.identifyUser(payload);
    return await this.appwriteService.deleteContainer(
      id.deviceId,
      payload['event']['container_name'],
    );
  }

  @SubscribeMessage('device_state')
  handleDeviceState(client: any, payload: any): string {
    console.log('Device stats: ' + JSON.stringify(payload));
    return '';
  }
}
