import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateTeamDto {
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.0\.0$/
    )
    readonly ipBlock16: string;
}