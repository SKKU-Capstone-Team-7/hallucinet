import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches } from "class-validator";
import { DeviceInfoDto } from "src/modules/device/dto/device-info.dto";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { PublicUserInfoDto, UserInfoDto } from "src/modules/user/dto/user-info.dto";

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

    @ApiProperty({ type: DeviceInfoDto })
    @Type(()=> DeviceInfoDto)
    @IsString()
    readonly device?: DeviceInfoDto;

    @ApiProperty({
        example: '2025-04-23T06:14:31.387Z',
        description: 'time when the container is accessed(TypeORM Date type)'
    })
    @Type(() => Date)
    @IsDate()
    readonly lastAccessed?: Date;

    constructor(partial: Partial<ContainerInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastAccessed = new Date();
    }
}