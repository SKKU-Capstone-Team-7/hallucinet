import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateUserDto {
    @ApiProperty({
        example: 'user',
        description: 'name of user'
    })
    @IsOptional()
    @IsString()
    readonly name?: string;

    @ApiProperty({
        example: '12345678',
        description: 'current password'
    })
    readonly password?: string;

    @ApiProperty({
        example: '12345678',
        description: 'new passord that user wants to change to'
    })
    readonly oldPassword?: string;
}