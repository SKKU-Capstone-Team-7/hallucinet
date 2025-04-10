import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Account, Teams } from 'node-appwrite';

@Injectable()
export class UserService {
    constructor(private readonly appwriteService: AppwriteService) { }

    /**
   * Retrieves the user information from Appwrite using the provided JWT,
   * and maps it to a fixed UserInfo DTO.
   * @param jwtToken - The JWT token from the client.
   * @returns The user information as a UserInfoDto.
   */
    async getUserInfo(jwtToken: string): Promise<UserInfoDto> {
        const client = this.appwriteService.getClient(jwtToken);
        const account = new Account(client);
        const teams = new Teams(client);

        try {
            const user = await account.get();
            const userInfo: UserInfoDto = new UserInfoDto({
                $id: user.$id,
                name: user.name,
                email: user.email,
                password: user.password,
                teamIds: (await teams.list()).teams.map((team) => team.$id)
            });
            return userInfo;
        } catch (error) {
            throw new UnauthorizedException('Failed to retrieve user information.');
        }
    }

    /**
   * Updates the user's name and/or password based on the provided fields.
   * To update the password, oldPassword must be provided.
   */
    async updateUserInfo(jwtToken: string, updateDto: UpdateUserDto): Promise<UserInfoDto> {
        const client = this.appwriteService.getClient(jwtToken);
        const account = new Account(client);
        const teams = new Teams(client);

        // Update name if provided
        if (updateDto.name) {
            await account.updateName(updateDto.name);
        }

        // Update password if provided
        if (updateDto.password) {
            if (!updateDto.oldPassword) {
                throw new UnauthorizedException('Old password is required to update password.');
            }
            try {
                await account.updatePassword(updateDto.password, updateDto.oldPassword);
            } catch (error) {
                throw new UnauthorizedException('Old password is incorrect.');
            }
        }

        // Retrieve and return the updated user info
        try {
            const user = await account.get();
            return new UserInfoDto({
                email: user.email,
                name: user.name,
                password: user.password,
                teamIds: (await teams.list()).teams.map((team) => team.$id)
            });
        } catch (error) {
            throw new UnauthorizedException('Failed to retrieve updated user information.');
        }
    }
}
