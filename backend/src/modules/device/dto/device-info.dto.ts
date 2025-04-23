import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches } from "class-validator";
import { TeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { UserInfoDto } from "src/modules/user/dto/user-info.dto";

export class DeviceInfoDto {
    @IsString()
    readonly $id: string;

    @IsBoolean()
    readonly status: boolean;

    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.0$/
    )
    readonly ipBlock24: string;

    @Type(() => UserInfoDto)
    readonly user: UserInfoDto;

    //@Type(() => TeamInfoDto)
    //readonly team: TeamInfoDto;

    @Type(() => Date)
    @IsDate()
    readonly lastActivatedAt: Date;

    readonly teamId: string;

    constructor(partial: Partial<DeviceInfoDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastActivatedAt = new Date();
    }
}