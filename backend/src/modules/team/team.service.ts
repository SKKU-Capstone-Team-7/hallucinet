import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Client, ID, Teams } from 'node-appwrite';
import { AppwriteService } from 'src/modules/appwrite/appwrite.service';
import { TeamInfoDto } from './dto/team-info.dto';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamService {
    constructor(private readonly appwriteService: AppwriteService) { }


    async createTeam(
        client: Client,
        createTeamDto: CreateTeamDto
    ): Promise<TeamInfoDto> {
        const teams = new Teams(client);

        if ((await teams.list()).total) {
            throw new BadRequestException('you are already registered in another team.')
        }

        try {
            const newTeam = await teams.create(ID.unique(), createTeamDto.name, ['owner']);
            newTeam.prefs
            const teamInfo: TeamInfoDto = {
                $id: newTeam.$id,
                name: newTeam.name,
                total: newTeam.total
            };

            return teamInfo;
        } catch (error) {
            throw new Error(`Failed to create team: ${error.message || error}`);
        }
    }


    /**
       * Retrieves the team information for the given teamId using Appwrite's Teams API.
       * @param teamId The ID of the team to retrieve.
       * @returns A JSON object containing the team information.
       */
    async getTeamInfo(teamId: string): Promise<TeamInfoDto> {
        const client = this.appwriteService.getServerClient();
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
