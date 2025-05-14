import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches, IsOptional } from "class-validator";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { PublicUserInfoDto, UserInfoDto } from "src/modules/user/dto/user-info.dto";

export class UpdateDeviceInfoDto {

    @ApiPropertyOptional({
        example: 'true',
        description: 'device status(ture: online, false: offline)'
    })
    @IsOptional()
    @IsBoolean()
    readonly status?: boolean;

    @ApiPropertyOptional({
        example: 'dev-mac',
        description: 'name of device'
    })
    @IsOptional()
    @IsString()
    readonly name?: string;

    //@Type(() => TeamInfoDto)
    //readonly team: TeamInfoDto;

    @ApiPropertyOptional({
        example: '2025-04-23T06:14:31.387Z',
        description: 'time when the device is activated(TypeORM Date type)'
    })
    @IsOptional()
    @Type(() => Date)
    readonly lastActivatedAt?: Date;

    constructor(partial: Partial<UpdateDeviceInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastActivatedAt = new Date();
    }
}