import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateUserDto {
    @ApiProperty({
        example: 'user',
        description: 'name of user'
    })
    @IsString()
    readonly name?: string;

    @ApiProperty({
        example: '12345678',
        description: 'current password'
    })
    @IsString()
    readonly password?: string;

    @ApiProperty({
        example: '12345678',
        description: 'new passord that user wants to change to'
    })
    @IsString()
    readonly oldPassword?: string;
}