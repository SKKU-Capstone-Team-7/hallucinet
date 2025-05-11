import { ApiProperty } from "@nestjs/swagger";
import {IsString, IsUrl} from "class-validator";

export class CreateDeviceDto {
    @ApiProperty({
        example: 'device-one',
        description: 'device name'
    })
    @IsString()
    readonly name: string;

    constructor(partial: Partial<CreateDeviceDto>) {
        Object.assign(this, partial);
    }
}