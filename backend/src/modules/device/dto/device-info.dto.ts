import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches } from "class-validator";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { PublicUserInfoDto, UserInfoDto } from "src/modules/user/dto/user-info.dto";

export class DeviceInfoDto {
    @ApiProperty({
        example: '68089e5300280c88c3ed',
        description: 'device ID in appwrite'
    })
    @IsString()
    readonly $id: string;

    @ApiProperty({
        example: 'dev-mac',
        description: 'name of device'
    })
    @IsString()
    readonly name: string;

    @ApiProperty({
        example: '10.2.1.0',
        description: '/24 IP block assigned to each device automatically'
    })
    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.0$/
    )
    readonly ipBlock24: string;

    @ApiProperty({ type: PublicUserInfoDto })
    @Type(() => PublicUserInfoDto)
    readonly user: PublicUserInfoDto;

    //@Type(() => TeamInfoDto)
    //readonly team: TeamInfoDto;

    @ApiProperty({
        example: '2025-04-23T06:14:31.387Z',
        description: 'time when the device is activated(TypeORM Date type)'
    })
    @Type(() => Date)
    @IsDate()
    readonly lastActivatedAt: Date;

    constructor(partial: Partial<DeviceInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastActivatedAt = new Date();
    }
}