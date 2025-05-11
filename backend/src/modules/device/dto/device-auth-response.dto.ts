import { ApiProperty } from "@nestjs/swagger";
import {IsString, IsUrl} from "class-validator";

export class DeviceAuthResponseDto {
    @ApiProperty({
        example: '68089e5300280c88c3ed',
        description: 'device ID in appwrite'
    })
    @IsString()
    readonly $id: string;

    @ApiProperty({
        example: 'http://localhost/confirm-device?deviceId=68089e5300280c88c3ed',
        description: 'url for confirmation'
    })
    @IsUrl()
    readonly url: string;

    constructor(partial: Partial<DeviceAuthResponseDto>) {
        Object.assign(this, partial);
        // it is temporary.
        //this.lastActivatedAt = new Date();
    }
}