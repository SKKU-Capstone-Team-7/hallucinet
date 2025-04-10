import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtToken } from 'src/common/decorators/jwt-token.decorator';
import { TeamInfoDto } from './dto/team-info.dto';

@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    /**
  * GET /team/:teamid endpoint that retrieves team information.
  * @param teamId The team ID extracted from the URL.
  * @returns The team information JSON.
  */
    @Get(':teamid')
    async getTeam(@JwtToken() jwtToken: string, @Param('teamid') teamId: string): Promise<TeamInfoDto> {
        return await this.teamService.getTeamInfo(jwtToken, teamId);
    }
}
