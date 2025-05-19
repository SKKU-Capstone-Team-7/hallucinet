import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateTeamDto {
    @ApiProperty({
        example: 'team1',
        description: 'name of team'
    })
    @IsString()
    readonly name: string;

    @ApiProperty({
        example: '10.2.0.0',
        description: '/16 IP block assigned to each team, decided by team owner.'
    })
    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.0\.0$/
    )
    readonly ipBlock16: string;
}