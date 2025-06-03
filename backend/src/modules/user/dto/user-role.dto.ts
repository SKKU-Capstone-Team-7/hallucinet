import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UserRoleDto {
    readonly userId: string;

    readonly teamId: string;
}