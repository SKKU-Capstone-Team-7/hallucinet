import { IsEmpty, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class TeamInfoDto {
    @IsString()
    readonly $id: string;

    @IsString()
    readonly name: string;

    @IsNumber()
    readonly total: number;

    @IsNotEmpty()
    @Matches(
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.0\.0$/
    )
    readonly ipBlock16?: string;

    constructor(partial: Partial<TeamInfoDto>) {
        Object.assign(this, partial);
    }
}