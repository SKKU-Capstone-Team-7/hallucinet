import { Injectable,ConflictException  } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AppwriteService } from '../appwrite/appwrite.service';
import { Client, ID, Query, Teams } from 'node-appwrite';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitationDto } from './dto/invitation.dto';
import { UserService } from '../user/user.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class InvitationService {
    constructor(private readonly appwriteService: AppwriteService, private readonly databaseService: DatabaseService,
        private readonly userService: UserService, private readonly teamService: TeamService
    ) { }

    async inviteUser(client: Client, inviteUserDto: InviteUserDto): Promise<InvitationDto> {
        const inviter = await this.userService.getCurrentUser(client);
        const team = await this.teamService.getMyTeam(client);
        const invitee = await this.userService.getUserByEmail(inviteUserDto.email);
        // get user info o
        // get team info o
        // get invitee info o
        // create document o
        // checking alreay member o
        // checking he is owner

        if (Array.isArray(invitee.teamIds) && invitee.teamIds.includes(team.$id)) {
            throw new ConflictException(
                `User ${inviteUserDto.email} is already a member of team ${team.name}.`
            );
        }

        const doc = await this.databaseService.createInvitation(inviter.$id,invitee.$id,team.$id,ID.unique());
        
        //console.log(doc);

        return new InvitationDto({
            $id: doc.$id,
            team: team,
            inviter: inviter,
            invitee: invitee,
        });
    }

    async listInvitationForMe(client: Client, status: string): Promise<InvitationDto[]> {
        const user = await this.userService.getCurrentUser(client);

        const { documents } = await this.databaseService.listInvitation(user.$id, status);

        return Promise.all(documents.map(async doc => {
            console.log(doc.team.$id);
            const inviter = await this.userService.getUserById(doc.inviterId);
            const team    = await this.teamService.getTeamById(doc.team.$id);
            return new InvitationDto({ $id: doc.$id, inviter: inviter, invitee: user, team: team });
        }));
    }

    async acceptInvite(client: Client, inviteId: string) {
        const doc = await this.databaseService.handleInvitation(inviteId, "accepted");
        const teams = new Teams(this.appwriteService.getServerClient());

        //console.log(doc);

        const result = await teams.createMembership(
            doc.team.$id,
            ['member'],
            undefined,
            doc.inviteeId,
        )
    }

    async declineInvite(client: Client, inviteId: string) {
        const doc = await this.databaseService.handleInvitation(inviteId, "declined");

        console.log(doc);
    }
}
