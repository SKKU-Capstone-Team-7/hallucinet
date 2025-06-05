import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Client, ID, Query, Teams } from 'node-appwrite';
import { AppwriteService } from 'src/modules/appwrite/appwrite.service';
import { PublicTeamInfoDto, TeamInfoDto } from './dto/team-info.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TeamService {
    constructor(private readonly appwriteService: AppwriteService, private readonly databaseService: DatabaseService) { }

    async createTeam(
        client: Client,
        createTeamDto: CreateTeamDto
    ): Promise<TeamInfoDto> {
        const teams = new Teams(client);

        if ((await teams.list()).total) {
            throw new BadRequestException('you are already registered in another team.')
        }

        const randomNum = Math.floor(Math.random() * 256);

        const ipBlock16 = `10.${randomNum}.0.0`;

        try {
            const newTeam = await teams.create(ID.unique(), createTeamDto.name, ['owner']);
            const updatedPrefs = await teams.updatePrefs(newTeam.$id, { ipBlock16: ipBlock16 });
            const teamInDb = await this.databaseService.registerTeamId(newTeam.$id);
            console.log(teamInDb);
            // team database register is needed
            return this.getMyTeam(client);
        } catch (error) {
            throw new Error(`Failed to create team: ${error.message || error}`);
        }
    }

    async getMyTeam(client: Client, index: number = 0): Promise<TeamInfoDto> {
        const teams = new Teams(client);
        try {
            const team = (await teams.list()).teams[index];
            console.log('Fetched team: ', team);
            const teamInfo: TeamInfoDto = new TeamInfoDto({
                $id: team.$id,
                name: team.name,
                total: team.total,
                ipBlock16: team.prefs.ipBlock16
            })
            return teamInfo
        } catch (error) {
            throw new NotFoundException(`Team not found.`);
        }
    }


    /**
       * Retrieves the team information for the given teamId using Appwrite's Teams API.
       * @param teamId The ID of the team to retrieve.
       * @returns A JSON object containing the team information.
       */
    async getTeamById(teamId: string): Promise<PublicTeamInfoDto> {
        const client = this.appwriteService.getServerClient();
        const teams = new Teams(client);

        try {
            // Appwrite API call to get team information by teamId
            const team = await teams.get(teamId);
            console.log('Fetched team: ', team);
            const teamInfo: PublicTeamInfoDto = new PublicTeamInfoDto({
                $id: team.$id,
                name: team.name,
                total: team.total,
            })
            return teamInfo
        } catch (error) {
            throw new NotFoundException(`Team with id ${teamId} not found.`);
        }
    }
}
