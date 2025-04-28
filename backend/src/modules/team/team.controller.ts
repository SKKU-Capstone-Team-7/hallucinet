import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { PublicTeamInfoDto, TeamInfoDto } from './dto/team-info.dto';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client } from 'node-appwrite';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Teams')
@ApiBearerAuth('JWT')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @ApiOperation({ summary: 'create new team only when current user doesn\'t have team endpoint' })
  @ApiBody({
    description: 'team info',
    type: CreateTeamDto,
  })
  @ApiOkResponse({
    description: 'created team info',
    type: TeamInfoDto,
  })
  @Post()
  @UseGuards(AppwriteAuthGuard)
  async createTeam(@AppwriteClient() client: Client, @Body() createTeamDto: CreateTeamDto): Promise<TeamInfoDto> {
    return this.teamService.createTeam(client, createTeamDto);
  }

  @ApiOperation({ summary: 'get team info of current user endpoint' })
  @ApiOkResponse({
    description: 'current user\'s team info',
    type: TeamInfoDto,
  })
  @Get('me')
  @UseGuards(AppwriteAuthGuard)
  async getMyTeam(@AppwriteClient() client: Client): Promise<TeamInfoDto> {
    return await this.teamService.getMyTeam(client);
  }

  @Patch('me')
  @UseGuards(AppwriteAuthGuard)
  async updateMyTeam() {
    return;
  }

  @Delete('me')
  @UseGuards(AppwriteAuthGuard)
  async deleteMyTeam() {
    return;
  }

  @ApiOperation({ summary: 'get team info by teamId endpoint' })
  @ApiOkResponse({
    description: 'team info for the given ID except team ipBlock16',
    type: PublicTeamInfoDto,
  })
  @Get(':teamId')
  @UseGuards(AppwriteAuthGuard)
  async getTeamById(@Param('teamId') teamId: string): Promise<PublicTeamInfoDto> {
    return await this.teamService.getTeamById(teamId);
  }
}
