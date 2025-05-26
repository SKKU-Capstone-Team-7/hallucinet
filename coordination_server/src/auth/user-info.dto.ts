import { TeamInfoDto } from './team-info.dto';

export class UserInfoDto {
  readonly id: string;
  readonly team: TeamInfoDto;
}
