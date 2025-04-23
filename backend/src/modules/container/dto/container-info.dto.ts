import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches } from "class-validator";
import { DeviceInfoDto } from "src/modules/device/dto/device-info.dto";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { UserInfoDto } from "src/modules/user/dto/user-info.dto";

export class ContainerInfoDto {
    @IsString()
    readonly $id: string;

    @IsString()
    readonly name: string;

    @IsString()
    readonly image: string;

    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    )
    readonly ip: string;

    @Type(() => DeviceInfoDto)
    readonly device?: DeviceInfoDto;

    @Type(() => Date)
    @IsDate()
    readonly lastAccessed?: Date;

    readonly teamId: string;

    readonly userId: string;

    constructor(partial: Partial<ContainerInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastAccessed = new Date();
    }
}