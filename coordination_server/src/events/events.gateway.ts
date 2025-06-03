import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { CreateContainerDto } from './create-container.dto';
import { TokenService } from 'src/token/token.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { Databases } from 'node-appwrite';
import { HttpStatus } from '@nestjs/common';
import { WsDeviceStatusPayload } from './ws-device-status.dto';
import { WsContainerEvent } from './ws-container-event';
import { WsContainerEventPayload } from './ws-container-event-payload.dto';

type UserIdentifier = {
  userId: string;
  teamId: string;
  deviceId: string;
};

@WebSocketGateway({ path: 'events' })
export class EventsGateway {
  private deviceSocket: Map<string, any>;
  private socketDevice: Map<any, string>;

  constructor(
    private tokenService: TokenService,
    private appwriteService: AppwriteService,
  ) {
    this.deviceSocket = new Map<string, any>();
    this.socketDevice = new Map<any, string>();
  }

  mapDeviceToSocket(deviceId: string, socket: any) {
    this.deviceSocket.set(deviceId, socket);
    this.socketDevice.set(socket, deviceId);
  }

  unmapDevice(deviceId: string) {
    const sock = this.deviceSocket.get(deviceId);
    this.deviceSocket.delete(deviceId);
    this.socketDevice.delete(sock);
  }

  unmapSocket(socket: any) {
    const device = this.socketDevice.get(socket);
    this.socketDevice.delete(socket);
    this.deviceSocket.delete(device!);
  }

  async identifyUser(token: string): Promise<UserIdentifier> {
    const tokenData = this.tokenService.decodeToken(token);
    const deviceId = tokenData['deviceId'];
    const doc = await this.appwriteService.getDevice(deviceId);
    return {
      userId: doc['user']['$id'],
      teamId: doc['team']['$id'],
      deviceId: deviceId,
    };
  }

  @SubscribeMessage('device_connected')
  async handleDeviceConnected(client: any, payload: WsDeviceStatusPayload) {
    const id = await this.identifyUser(payload.token);

    this.appwriteService.clearDeviceContainers(id.deviceId);

    this.mapDeviceToSocket(id.deviceId, client);

    payload.containers.forEach((cont) => {
      this.appwriteService.createContainer(
        new CreateContainerDto({
          name: cont.container_image,
          ip: cont.container_ip,
          image: cont.container_image,
          user: id.userId,
          team: id.teamId,
          device: id.deviceId,
          lastAccessed: new Date().toISOString(),
        }),
      );
    });

    return HttpStatus.OK;
  }

  async handleDisconnect(client: any) {
    const deviceId = this.socketDevice.get(client);
    if (!deviceId) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    this.unmapDevice(deviceId!);
    this.appwriteService.clearDeviceContainers(deviceId!);
  }

  @SubscribeMessage('container_connected')
  async handleContainerConnected(
    client: any,
    payload: WsContainerEventPayload,
  ) {
    const id = await this.identifyUser(payload.token);
    const dto = new CreateContainerDto({
      name: payload.event.container_image,
      ip: payload.event.container_ip,
      image: payload.event.container_image,
      user: id.userId,
      team: id.teamId,
      device: id.deviceId,
      lastAccessed: new Date().toISOString(),
    });

    return this.appwriteService.createContainer(dto);
  }

  @SubscribeMessage('container_disconnected')
  async handleContainerDisconnected(
    client: any,
    payload: WsContainerEventPayload,
  ) {
    const id = await this.identifyUser(payload.token);
    return await this.appwriteService.deleteContainer(
      id.deviceId,
      payload['event']['container_name'],
    );
  }
}
