import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class PublicUserInfoDto {
    @ApiProperty({
        example: '67ef5673002b2bf5d909',
        description: 'ID in appwrite'
    })
    @IsString()
    readonly $id: string;

    @ApiProperty({
        example: 'user',
        description: 'name of user'
    })
    @IsString()
    readonly name: string;

    @ApiProperty({
        example: 'user@example',
        description: 'email of user'
    })
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        example: '[\'67f9f12c0015b7f72fd2\']',
        description: 'team ID array of user(there is only one team but it is array)'
    })
    readonly teamIds?: string[];

    readonly role?: string;

    readonly joinedAt?: Date;

    constructor(partial: Partial<PublicUserInfoDto>) {
        Object.assign(this, partial);
    }
}

export class UserInfoDto extends PublicUserInfoDto {
    @ApiProperty({
        example: '12345678',
        description: 'password of user'
    })
    @IsString()
    readonly password?: string;

    constructor(partial: Partial<UserInfoDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}