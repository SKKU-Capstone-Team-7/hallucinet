import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Body } from '@nestjs/common';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { Client } from 'node-appwrite';
import { UserInfo } from 'os';


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    @UseGuards(AppwriteAuthGuard)
    async getCurrentUser(@AppwriteClient() client: Client): Promise<UserInfoDto> {
        return await this.userService.getCurrentUser(client);
    }

    @Patch('me')
    @UseGuards(AppwriteAuthGuard)
    async updateCurrentUser(
        @AppwriteClient() client: Client,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserInfoDto> {
        return await this.userService.updateCurrentUser(client, updateUserDto);
    }

    @Get(':userId')
    @UseGuards(AppwriteAuthGuard)
    async getUserById(@Param('userId') userId: string): Promise<UserInfoDto> {
        return await this.userService.getUserById(userId);
    }

}
