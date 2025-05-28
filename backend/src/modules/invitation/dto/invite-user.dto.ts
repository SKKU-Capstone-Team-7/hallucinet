import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, IsEmail } from "class-validator";

export class InviteUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'invitee email'
    })
    @IsEmail()
    readonly email: string;

    constructor(partial: Partial<InviteUserDto>) {
        Object.assign(this, partial);
    }
}