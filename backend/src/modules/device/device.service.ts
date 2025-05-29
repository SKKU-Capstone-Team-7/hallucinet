import { Injectable, BadRequestException } from '@nestjs/common';
import { AppwriteService } from '../appwrite/appwrite.service';
import { Client, Teams, ID } from 'node-appwrite';
import { DeviceInfoDto } from './dto/device-info.dto';
import { TeamService } from '../team/team.service';
import { TeamInfoDto } from '../team/dto/team-info.dto';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { DeviceAuthResponseDto } from './dto/device-auth-response.dto';
import { randomBytes, createHash } from 'crypto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UserInfoDto } from '../user/dto/user-info.dto';
import { randomInt } from 'crypto';
import { UpdateDeviceInfoDto } from './dto/update-device-info.dto';

@Injectable()
export class DeviceService {
  private readonly confirmBaseUrl: string = process.env.CONFIRM_BASE_URL!;

  constructor(
    private readonly appwriteService: AppwriteService,
    private readonly teamService: TeamService,
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
  ) {}

  async listDevices(client: Client): Promise<DeviceInfoDto[]> {
    const team = await this.teamService.getMyTeam(client);

    const { documents } = await this.databaseService.listDevicesByTeamId(
      team.$id,
    );

    //console.log(documents);

    const users = await this.userService.getUsersInMyTeam(client);

    //console.log(users);
    const userMap = new Map(
        users.map(u => [u.$id, u])
    );

    return documents.map(doc =>
        new DeviceInfoDto({
            $id: doc.$id,
            name: doc.name,
            status: doc.status,
            ipBlock24: doc.ipBlock24,
            user: userMap.get(doc.user.$id)!,
            lastActivatedAt: doc.lastActivatedAt,
        })
        );
    }

  //async getDeviceById(client: Client, deviceId: string):Promise<DeviceInfoDto> {
  //    const doc = await this.databaseService.getDeviceById(client, deviceId);
  //
  //    return new DeviceInfoDto({
  //        $id: doc.$id,
  //        name: doc.name,
  //        status: doc.status,
  //        ipBlock24: doc.ipBlock24,
  //        userId: doc.user.$id,
  //        lastActivatedAt: doc.lastActivatedAt,
  //        teamId: doc.team.$id
  //    })
  //}

  async getDeviceById(deviceId: string): Promise<DeviceInfoDto> {
    const doc = await this.databaseService.getDeviceById(deviceId);
    const user = doc.user
      ? await this.userService.getUserById(doc.user?.$id)
      : undefined;
    return new DeviceInfoDto({
      $id: doc.$id,
      name: doc.name,
      status: doc.status,
      ipBlock24: doc.ipBlock24,
      user: user,
      lastActivatedAt: doc.lastActivatedAt,
    });
  }

  async addDevice(deviceName: CreateDeviceDto): Promise<DeviceAuthResponseDto> {
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    const doc = await this.databaseService.createDevice(
      expiresAt,
      ID.unique(),
      deviceName.name,
    );

    //console.log(doc);
    return new DeviceAuthResponseDto({
      $id: doc.$id,
      url: `${this.confirmBaseUrl}?deviceId=${doc.$id}`,
    });
  }

  async confirmDevice(
    client: Client,
    deviceId: string,
  ): Promise<DeviceInfoDto> {
    // get user, team (team 있는가 check) o
    // make ipblock
    // check expires time o
    // set address null (dummy) o
    // set lastActivateAt = now o
    // status false o
    const userInfo = await this.userService.getCurrentUser(client);
    const teamInfo = await this.teamService.getMyTeam(client);
    console.log('Confirming device ' + deviceId);
    const registrationExpiresAt =
      await this.databaseService.getRegistrationExpiresAt(client, deviceId);
    console.log('Confirming sdevice ' + deviceId);
    const lastActivateAt = new Date(Date.now());

    if (!userInfo.teamIds || userInfo.teamIds.length == 0) {
      throw new BadRequestException("you don't have team.");
    }

    if (lastActivateAt > registrationExpiresAt) {
      throw new BadRequestException('The confirmation link has expired.');
    }

    console.log(lastActivateAt);
    console.log(registrationExpiresAt);

    const prefix = getIpBlock24Prefix(teamInfo.ipBlock16);
    const used = await this.databaseService.fetchUsedOctets(
      userInfo.teamIds[0],
    );
    const octet = pickRandomOctet(used);
    const ipBlock24 = `${prefix}${octet}.0`;

    const doc = await this.databaseService.confirmDevice(
      client,
      deviceId,
      userInfo.$id,
      userInfo.teamIds[0],
      ipBlock24,
      new Date(Date.now()),
    );

    return new DeviceInfoDto({
      $id: doc.$id,
      name: doc.name,
      status: doc.status,
      ipBlock24: doc.ipBlock24,
      user: userInfo,
      lastActivatedAt: doc.lastActivatedAt,
    });
  }

  async updateDevice(
    deviceId: string,
    updateDeviceInfoDto: UpdateDeviceInfoDto,
  ): Promise<DeviceInfoDto> {
    console.log(deviceId);
    const doc = await this.databaseService.updateDevice(
      deviceId,
      updateDeviceInfoDto,
    );
    const userInfo = await this.userService.getUserById(doc.user.$id);

    return new DeviceInfoDto({
      $id: doc.$id,
      name: doc.name,
      status: doc.status,
      ipBlock24: doc.ipBlock24,
      user: userInfo,
      lastActivatedAt: doc.lastActivatedAt,
    });
  }

  async delDeviceById(deviceId: string ) {
    await this.databaseService.delDeviceById(deviceId);
  }
}

function pickRandomOctet(used: Set<number>): number {
  const candidates = Array.from({ length: 255 }, (_, i) => i + 1).filter(
    (n) => !used.has(n),
  );

  if (!candidates.length) {
    throw new BadRequestException('there is no available ipBlock24.');
  }

  const idx = randomInt(0, candidates.length);
  return candidates[idx];
}

function getIpBlock24Prefix(ipBlock24: string): string {
  const parts = ipBlock24.split('.');
  return `${parts[0]}.${parts[1]}.`;
}
