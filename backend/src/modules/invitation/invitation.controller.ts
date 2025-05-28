import { InvitationService } from './invitation.service';
import { HttpCode, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client } from 'node-appwrite';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitationDto } from './dto/invitation.dto';

@ApiTags('Invitation')
@ApiBearerAuth('bearer')
@Controller()
export class InvitationController {
    constructor(private readonly inviteService: InvitationService) {}

    @ApiOperation({ summary: 'invite user to team by email endpoint' })
    @ApiBody({
        description: 'invitee email',
        type: InviteUserDto,
    })
    @ApiOkResponse({
        description: 'invitation created',
        type: InvitationDto,
    })
    @Post('teams/me/invitations')
    @UseGuards(AppwriteAuthGuard)
    async inviteUser(@AppwriteClient() client: Client, @Body() inviteUserDto: InviteUserDto): Promise<InvitationDto> {
        return this.inviteService.inviteUser(client, inviteUserDto);
    }

    @ApiOperation({ summary: 'get all pending/accepted/declined invitaions for user endpoint' })
    @ApiOkResponse({
        description: 'all pending/accepted/declined invitations',
        type: InvitationDto,
        isArray: true
    })
    @Get('me/invitations')
    @UseGuards(AppwriteAuthGuard)
    async listInvitationForMe(@AppwriteClient() client: Client, @Query('status') status: string): Promise<InvitationDto[]> {
        return this.inviteService.listInvitationForMe(client, status);
    }

    @ApiOperation({ summary: 'accept invitation endpoint' })
    @Post('invitations/:inviteId/accept')
    @UseGuards(AppwriteAuthGuard)
    @HttpCode(204)                     
    async acceptInvite(@AppwriteClient() client, @Param('inviteId') inviteId: string) {
        return this.inviteService.acceptInvite(client, inviteId);
    }

    @ApiOperation({ summary: 'decline invitation endpoint' })
    @Post('invitations/:inviteId/decline')
    @UseGuards(AppwriteAuthGuard)
    @HttpCode(204)                     
    async declineInvite(@AppwriteClient() client, @Param('inviteId') inviteId: string) {
        return this.inviteService.declineInvite(client, inviteId);
    }
}
