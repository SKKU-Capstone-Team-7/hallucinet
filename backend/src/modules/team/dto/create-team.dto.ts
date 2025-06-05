import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateTeamDto {
    @ApiProperty({
        example: 'team1',
        description: 'name of team'
    })
    @IsString()
    readonly name: string;
}