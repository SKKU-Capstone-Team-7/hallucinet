import { Controller, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtToken } from 'src/common/decorators/jwt-token.decorator';
import { Body } from '@nestjs/common';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    /**
   * GET /user endpoint that retrieves information for the authenticated user.
   * Expects an Authorization header in the form: "Bearer <JWT_TOKEN>".
   */
    @Get()
    async getUser(@JwtToken() jwtToken: string): Promise<UserInfoDto> {
        // This returns a DTO directly.
        return await this.userService.getUserInfo(jwtToken);
    }

    /**
   * PATCH /user endpoint that updates the authenticated user's information.
   * Accepts an Authorization header with a Bearer JWT and a JSON body with fields to update (name or/and password).
   */
    @Patch()
    async updateUser(
        @JwtToken() jwtToken: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserInfoDto> {
        return await this.userService.updateUserInfo(jwtToken, updateUserDto);
    }
}
