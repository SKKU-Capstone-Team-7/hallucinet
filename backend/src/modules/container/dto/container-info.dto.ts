import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches } from "class-validator";
import { DeviceInfoDto } from "src/modules/device/dto/device-info.dto";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { UserInfoDto } from "src/modules/user/dto/user-info.dto";

export class ContainerInfoDto {
    @ApiProperty({
        example: '6808a77300050739c45b',
        description: 'container ID in appwrite'
    })
    @IsString()
    readonly $id: string;

    @ApiProperty({
        example: 'appwrite',
        description: 'docker container name'
    })
    @IsString()
    readonly name: string;

    @ApiProperty({
        example: 'traefik:2.11',
        description: 'image name of the container'
    })
    @IsString()
    readonly image: string;

    @ApiProperty({
        example: '10.2.1.1',
        description: 'IP address assigned to container automatically'
    })
    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    )
    readonly ip: string;

    @ApiProperty({
        example: '68089e5300280c88c3ed',
        description: 'device hosting this container'
    })
    @IsString()
    readonly deviceId?: string;

    @ApiProperty({
        example: '2025-04-23T06:14:31.387Z',
        description: 'time when the container is accessed(TypeORM Date type)'
    })
    @Type(() => Date)
    @IsDate()
    readonly lastAccessed?: Date;

    @ApiProperty({
        example: '67f9f12c0015b7f72fd2',
        description: 'team ID the container is registered to'
    })
    readonly teamId: string;

    @ApiProperty({
        example: '67f75a1a002dfda6894f',
        description: 'device owner ID in appwrite'
    })
    readonly userId: string;

    constructor(partial: Partial<ContainerInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastAccessed = new Date();
    }
}