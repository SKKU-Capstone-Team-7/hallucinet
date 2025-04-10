import { Injectable, NotFoundException } from '@nestjs/common';
import { Teams } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { TeamInfoDto } from './dto/team-info.dto';

@Injectable()
export class TeamService {
    constructor(private readonly appwriteService: AppwriteService) { }

    /**
       * Retrieves the team information for the given teamId using Appwrite's Teams API.
       * @param teamId The ID of the team to retrieve.
       * @returns A JSON object containing the team information.
       */
    async getTeamInfo(jwtToken: string, teamId: string): Promise<any> {
        const client = this.appwriteService.getClient(jwtToken);
        const teams = new Teams(client);

        try {
            // Appwrite API call to get team information by teamId
            const team = await teams.get(teamId);
            const teamInfo: TeamInfoDto = new TeamInfoDto({
                $id: team.$id,
                name: team.name,
                total: team.total
            })
            return teamInfo
        } catch (error) {
            throw new NotFoundException(`Team with id ${teamId} not found.`);
        }
    }
}
