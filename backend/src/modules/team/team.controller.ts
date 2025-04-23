import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamInfoDto } from './dto/team-info.dto';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client } from 'node-appwrite';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @Post()
  @UseGuards(AppwriteAuthGuard)
  async createTeam(@AppwriteClient() client: Client, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(client, createTeamDto);
  }

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

  @Get(':teamId')
  @UseGuards(AppwriteAuthGuard)
  async getTeamById(@Param('teamId') teamId: string): Promise<TeamInfoDto> {
    return await this.teamService.getTeamById(teamId);
  }
}
