import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Body } from '@nestjs/common';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { Client } from 'node-appwrite';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    /**
   * GET /user endpoint that retrieves information for the authenticated user.
   * Expects an Authorization header in the form: "Bearer <JWT_TOKEN>".
   */
    @Get()
    @UseGuards(AppwriteAuthGuard)
    async getUser(@AppwriteClient() client: Client): Promise<UserInfoDto> {
        // This returns a DTO directly.
        return await this.userService.getUserInfo(client);
    }

    /**
   * PATCH /user endpoint that updates the authenticated user's information.
   * Accepts an Authorization header with a Bearer JWT and a JSON body with fields to update (name or/and password).
   */
    @Patch()
    @UseGuards(AppwriteAuthGuard)
    async updateUser(
        @AppwriteClient() client: Client,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserInfoDto> {
        return await this.userService.updateUserInfo(client, updateUserDto);
    }
}
