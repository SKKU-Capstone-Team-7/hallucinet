import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, IsEmail, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { PublicTeamInfoDto } from "src/modules/team/dto/team-info.dto";
import { PublicUserInfoDto } from "src/modules/user/dto/user-info.dto";

export class InvitationDto {
    @ApiProperty({
        example: '67f9f12c0015b7f72fd2',
        description: 'Invitation ID in appwrite'
    })
    @IsString()
    readonly $id: string;

    @ApiProperty({ type: PublicUserInfoDto })
    @Type(() => PublicUserInfoDto)
    readonly inviter: PublicUserInfoDto;

    @ApiProperty({ type: PublicUserInfoDto })
    @Type(() => PublicUserInfoDto)
    readonly invitee: PublicUserInfoDto;

    @ApiProperty({ type: PublicTeamInfoDto })
    @Type(() => PublicTeamInfoDto)
    readonly team: PublicTeamInfoDto;

    @ApiProperty({
        example: '2025-04-23T06:14:31.387Z',
        description: 'time when the invitation is created(TypeORM Date type)'
    })
    @Type(() => Date)
    @IsDate()
    readonly createdAt: Date;

    constructor(partial: Partial<InvitationDto>) {
        Object.assign(this, partial);
    }
}