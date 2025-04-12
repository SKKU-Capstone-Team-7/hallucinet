import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamInfoDto } from './dto/team-info.dto';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client } from 'node-appwrite';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @Post()
  @UseGuards(AppwriteAuthGuard)
  async createTeam(@AppwriteClient() client: Client, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(client, createTeamDto);
  }

  @Get()
  @UseGuards(AppwriteAuthGuard)
  async getMyTeam(@AppwriteClient() client: Client): Promise<TeamInfoDto> {
    return await this.teamService.getMyTeamInfo(client);
  }

  /**
* GET /team/:teamid endpoint that retrieves team information.
* @param teamId The team ID extracted from the URL.
* @returns The team information JSON.
*/
  @Get(':teamid')
  @UseGuards(AppwriteAuthGuard)
  async getTeam(@Param('teamid') teamId: string): Promise<TeamInfoDto> {
    return await this.teamService.getTeamInfo(teamId);
  }
}
