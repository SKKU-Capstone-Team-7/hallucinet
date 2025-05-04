import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class PublicTeamInfoDto {
    @ApiProperty({
        example: '67f9f12c0015b7f72fd2',
        description: 'team ID in appwrite'
    })
    @IsString()
    readonly $id: string;

    @ApiProperty({
        example: 'team1',
        description: 'name of team'
    })
    @IsString()
    readonly name: string;

    @ApiProperty({
        example: '10',
        description: 'number of team member'
    })
    @IsNumber()
    readonly total: number;

    constructor(partial: Partial<PublicTeamInfoDto>) {
        Object.assign(this, partial);
    }
}

export class TeamInfoDto extends PublicTeamInfoDto {
    @ApiProperty({
        example: '10.2.0.0',
        description: '/16 IP block assigned to each team, decided by team owner.'
    })
    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.0\.0$/
    )
    readonly ipBlock16?: string;

    constructor(partial: Partial<TeamInfoDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}