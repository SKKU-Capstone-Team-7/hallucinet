import { IsEmail, IsString } from "class-validator";

export class UserInfoDto {
    @IsString()
    readonly $id: string;

    @IsString()
    readonly name: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    readonly password: string;

    readonly teamIds: string[];

    constructor(partial: Partial<UserInfoDto>) {
        Object.assign(this, partial);
    }
}