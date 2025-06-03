import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { PublicUserInfoDto, UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Body } from '@nestjs/common';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { Client } from 'node-appwrite';
import { UserInfo } from 'os';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRoleDto } from './dto/user-role.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @ApiOperation({ summary: 'get current user info endpoint' })
    @ApiOkResponse({
        description: 'current user info',
        type: UserInfoDto,
    })
    @Get('users/me')
    @UseGuards(AppwriteAuthGuard)
    async getCurrentUser(@AppwriteClient() client: Client): Promise<UserInfoDto> {
        return await this.userService.getCurrentUser(client);
    }

    @ApiOperation({ summary: 'edit current user info endpoint' })
    @ApiBody({
        description: 'only user info to update',
        type: UpdateUserDto,
    })
    @ApiOkResponse({
        description: 'changed current user info',
        type: UserInfoDto,
    })
    @Patch('users/me')
    @UseGuards(AppwriteAuthGuard)
    async updateCurrentUser(
        @AppwriteClient() client: Client,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserInfoDto> {
        return await this.userService.updateCurrentUser(client, updateUserDto);
    }

    @ApiOperation({ summary: 'get user info by userId endpoint' })
    @ApiOkResponse({
        description: 'user info for the given ID except password',
        type: PublicUserInfoDto,
    })
    @Get('users/:userId')
    @UseGuards(AppwriteAuthGuard)
    async getUserById(@Param('userId') userId: string): Promise<PublicUserInfoDto> {
        return await this.userService.getUserById(userId);
    }

    @ApiOperation({ summary: 'it is for registering userId in database(it has to be called when user is created!)' })
    @Post('users/me')
    @UseGuards(AppwriteAuthGuard)
    async registerUserId(@AppwriteClient() client: Client) {
        await this.userService.registerUserId(client);
    }

    @ApiOperation({ summary: 'get user info list of my team endpoint' })
    @ApiOkResponse({
        description: 'user info list of my team',
        type: PublicUserInfoDto,
        isArray: true
    })
    @Get('/teams/me/users')
    @UseGuards(AppwriteAuthGuard)
    async getUsersInMyTeam(@AppwriteClient() client: Client): Promise<PublicUserInfoDto[]> {
        return await this.userService.getUsersInMyTeam(client);
    }

    @ApiOperation({ summary: 'get user membership' })
    @ApiBody({
        description: 'team id and user id',
        type: UserRoleDto,
    })
    @Post('users/role')
    @UseGuards(AppwriteAuthGuard)
    async getUserRole(@Body() userRoleDto: UserRoleDto) {
        return await this.userService.getUserRole(userRoleDto);
    }
}
