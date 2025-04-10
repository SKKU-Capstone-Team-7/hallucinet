export class UserInfoDto {
    readonly $id: string;
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly teamIds: string[];

    constructor(partial: Partial<UserInfoDto>) {
        Object.assign(this, partial);
    }
}