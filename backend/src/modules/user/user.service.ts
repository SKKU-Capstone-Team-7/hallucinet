import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppwriteService } from 'src/modules/appwrite/appwrite.service';
import { PublicUserInfoDto, UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Account, Client, Teams, Users } from 'node-appwrite';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
    constructor(private readonly appwriteService: AppwriteService, private readonly databaseService: DatabaseService) { }

    async getCurrentUser(client: Client): Promise<UserInfoDto> {
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

    async updateCurrentUser(client: Client, updateDto: UpdateUserDto): Promise<UserInfoDto> {
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
                $id: user.$id,
                email: user.email,
                name: user.name,
                password: user.password,
                teamIds: (await teams.list()).teams.map((team) => team.$id)
            });
        } catch (error) {
            throw new UnauthorizedException('Failed to retrieve updated user information.');
        }
    }

    async getUserById(userId: string): Promise<PublicUserInfoDto> {
        const users = new Users(this.appwriteService.getServerClient());
        const { memberships } = await users.listMemberships(userId);
        console.log(memberships);

        try {
            const user = await users.get(userId);
            console.log(user);
            return new PublicUserInfoDto({
                $id: user.$id,
                email: user.email,
                name: user.name,
                teamIds: memberships.map((m) => m.teamId)
            })
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    }

    async registerUserId(client) {
        const account = new Account(client);
        const user = await account.get();
        const userInDb = this.databaseService.registerUserId(user.$id);
        console.log(userInDb);
    }
}
