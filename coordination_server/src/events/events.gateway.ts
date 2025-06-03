import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { CreateContainerDto } from './create-container.dto';
import { TokenService } from 'src/token/token.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { Databases } from 'node-appwrite';
import { HttpStatus } from '@nestjs/common';
import { WsDeviceStatusPayload } from './ws-device-status.dto';
import { WsContainerEvent } from './ws-container-event';
import { WsContainerEventPayload } from './ws-container-event-payload.dto';
import { ContainersService } from 'src/containers/containers.service';
import { WsPingPayload } from './ws-ping-payload.dto';
import { ContainerInfoDto } from 'src/containers/container-info.dto';
import { DevicesService } from 'src/devices/devices.service';

type UserIdentifier = {
  userId: string;
  teamId: string;
  deviceId: string;
};

@WebSocketGateway({ path: 'events' })
export class EventsGateway {
  private idSocket: Map<UserIdentifier, WebSocket>;
  private socketId: Map<WebSocket, UserIdentifier>;

  constructor(
    private tokenService: TokenService,
    private appwriteService: AppwriteService,
    private containersService: ContainersService,
    private devicesService: DevicesService,
  ) {
    this.idSocket = new Map<UserIdentifier, WebSocket>();
    this.socketId = new Map<WebSocket, UserIdentifier>();
  }

  mapIdToSocket(id: UserIdentifier, socket: WebSocket) {
    this.idSocket.set(id, socket);
    this.socketId.set(socket, id);
  }

  unmapId(id: UserIdentifier) {
    const sock = this.idSocket.get(id);
    this.idSocket.delete(id);
    this.socketId.delete(sock!);
  }

  unmapSocket(socket: any) {
    const id = this.socketId.get(socket);
    this.socketId.delete(socket);
    this.idSocket.delete(id!);
  }

  getTeamSockets(id) {
    const entries = Array.from(this.idSocket.entries());
    const teamEntries = entries.filter(([entId, sock]) => {
      return entId.teamId == id.teamId;
    });
    return teamEntries.map(([id, sock]) => {
      return sock;
    });
  }

  getTeamSocketsExclusive(id) {
    const entries = Array.from(this.idSocket.entries());
    const teamEntries = entries.filter(([entId, sock]) => {
      return entId.teamId == id.teamId && entId.deviceId != id.deviceId;
    });

    return teamEntries.map(([id, sock]) => {
      return sock;
    });
  }

  broadcastEventToOtherDevices(id: UserIdentifier, event: string, payload) {
    const teamSockets = this.getTeamSocketsExclusive(id);
    teamSockets.forEach((sock) => {
      sock.send(
        JSON.stringify({
          event: event,
          data: payload,
        }),
      );
    });
  }

  sendEventToId(id: UserIdentifier, event: string, payload: any) {
    const sock = this.idSocket.get(id);
    sock!.send(
      JSON.stringify({
        event: event,
        data: payload,
      }),
    );
  }

  async contEventToContainerInfoDto(
    event: WsContainerEvent,
    id: UserIdentifier,
  ) {
    const device = await this.devicesService.getDevice(id.deviceId);
    return new ContainerInfoDto({
      name: event.container_name,
      address: event.container_ip ? event.container_ip : '0.0.0.0',
      image: event.container_image,
      device: device,
    });
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
  async handleDeviceConnected(
    client: WebSocket,
    payload: WsDeviceStatusPayload,
  ) {
    const id = await this.identifyUser(payload.token);
    this.mapIdToSocket(id, client);

    // Send team containers to the client
    const teamContainers = await this.containersService.getTeamContainers(
      id.teamId,
    );
    this.sendEventToId(id, 'team_containers', {
      containers: teamContainers,
    });
    console.log('Sent: ' + JSON.stringify({ containers: teamContainers }));

    // Reset device containers to the current state
    this.appwriteService.clearDeviceContainers(id.deviceId);
    payload.containers.forEach((cont) => {
      this.appwriteService.createContainer(
        new CreateContainerDto({
          name: cont.container_name,
          ip: cont.container_ip,
          image: cont.container_image,
          user: id.userId,
          team: id.teamId,
          device: id.deviceId,
          lastAccessed: new Date().toISOString(),
        }),
      );
    });

    this.broadcastEventToOtherDevices(id, 'device_connected', payload);
  }

  async handleDisconnect(client: WebSocket) {
    const id = this.socketId.get(client);
    if (!id) {
      return;
    }
    this.unmapId(id!);
    this.appwriteService.clearDeviceContainers(id.deviceId);
    this.broadcastEventToOtherDevices(id, 'device_disconnected', {
      deviceId: id.deviceId,
    });
  }

  @SubscribeMessage('container_connected')
  async handleContainerConnected(
    client: WebSocket,
    payload: WsContainerEventPayload,
  ) {
    const id = await this.identifyUser(payload.token);

    // Create device in db
    const createDeviceDto = new CreateContainerDto({
      name: payload.event.container_name,
      ip: payload.event.container_ip,
      image: payload.event.container_image,
      user: id.userId,
      team: id.teamId,
      device: id.deviceId,
      lastAccessed: new Date().toISOString(),
    });
    this.appwriteService.createContainer(createDeviceDto);

    // Broadcast the new container to other devices
    const dto = await this.contEventToContainerInfoDto(payload.event, id);
    console.log('Sending container_connected event: ' + JSON.stringify(dto));
    this.broadcastEventToOtherDevices(id, 'container_connected', {
      container: dto,
    });
  }

  @SubscribeMessage('container_disconnected')
  async handleContainerDisconnected(
    client: WebSocket,
    payload: WsContainerEventPayload,
  ) {
    const id = await this.identifyUser(payload.token);

    // Broadcast the new container to other devices
    const dto = await this.contEventToContainerInfoDto(payload.event, id);
    console.log('Sending container_disconnected event: ' + JSON.stringify(dto));
    this.broadcastEventToOtherDevices(id, 'container_disconnected', {
      container: dto,
    });

    // IMPORTANT! Broadcast then delete. We need the IP in db.
    await this.appwriteService.deleteContainer(
      id.deviceId,
      payload.event.container_name,
    );
  }

  @SubscribeMessage('ping')
  async handlePing(client: WebSocket, payload: WsPingPayload) {
    const id = await this.identifyUser(payload.token);
    await this.appwriteService.touchDeviceActivationTime(id.deviceId);
  }
}
