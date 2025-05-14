import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches, IsOptional } from "class-validator";
import { DeviceInfoDto } from "src/modules/device/dto/device-info.dto";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { PublicUserInfoDto, UserInfoDto } from "src/modules/user/dto/user-info.dto";

export class UpdateContainerInfoDto {
    @ApiPropertyOptional({
        example: 'appwrite',
        description: 'docker container name'
    })
    @IsOptional()
    @IsString()
    readonly name?: string;

    @ApiPropertyOptional({
        example: '10.2.1.1',
        description: 'IP address assigned to container automatically'
    })
    @IsOptional()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    )
    readonly ip?: string;

    @ApiPropertyOptional({
        example: '2025-04-23T06:14:31.387Z',
        description: 'time when the container is accessed(TypeORM Date type)'
    })
    @IsOptional()
    @Type(() => Date)
    readonly lastAccessed?: Date;

    constructor(partial: Partial<UpdateContainerInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastAccessed = new Date();
    }
}