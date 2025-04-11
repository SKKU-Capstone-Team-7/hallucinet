export class TeamInfoDto {
    readonly $id: string;
    readonly name: string;
    readonly total: number;

    constructor(partial: Partial<TeamInfoDto>) {
        Object.assign(this, partial);
    }
}